import { getD1 } from "../../../db";
import type { RuntimeD1Database, RuntimeD1PreparedStatement } from "../runtime-env";
import {
  constantTimeStringEqual,
  consumeDummyPasswordWork,
  randomToken,
  sha256,
  verifyPassword,
} from "./password";

export type AdminRole = "admin" | "operator";

export type AdminPrincipal = {
  id: string;
  loginName: string;
  displayName: string;
  role: AdminRole;
};

type AdminUserRow = {
  id: string;
  login_name: string;
  display_name: string;
  password_hash: string;
  role: AdminRole;
  is_active: number;
  failed_attempts: number;
  locked_until: string | null;
};

type LoginAttemptRow = {
  attempt_count: number;
  window_started_at: string;
  blocked_until: string | null;
};

type SessionRow = {
  session_id: string;
  csrf_token_hash: string;
  last_seen_at: string;
  expires_at: string;
  admin_id: string;
  login_name: string;
  display_name: string;
  role: AdminRole;
  is_active: number;
};

export type AuthenticatedAdmin = {
  principal: AdminPrincipal;
  sessionId: string;
  csrfTokenHash: string;
  expiresAt: string;
};

export type LoginResult = AuthenticatedAdmin & {
  sessionToken: string;
  csrfToken: string;
};

export class AdminAuthError extends Error {
  constructor(
    public readonly code: "invalid_credentials" | "rate_limited" | "unauthorized" | "forbidden" | "csrf_failed",
    message: string,
    public readonly status: number,
    public readonly retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = "AdminAuthError";
  }
}

const SESSION_HOURS = 8;
const ATTEMPT_WINDOW_MINUTES = 15;
const BLOCK_MINUTES = 15;
const MAX_ATTEMPTS = 5;

function normalizeLogin(value: string): string {
  return value.trim().toLocaleLowerCase("vi-VN").slice(0, 100);
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

function isFuture(value: string | null, now: Date): boolean {
  return Boolean(value && new Date(value).getTime() > now.getTime());
}

async function loginKey(loginName: string, networkFingerprint: string): Promise<string> {
  return sha256(`${loginName}|${networkFingerprint}`);
}

async function recordFailedLogin(
  database: RuntimeD1Database,
  keyHash: string,
  user: AdminUserRow | null,
  previous: LoginAttemptRow | null,
  now: Date,
): Promise<void> {
  const windowExpired = !previous
    || now.getTime() - new Date(previous.window_started_at).getTime() > ATTEMPT_WINDOW_MINUTES * 60_000;
  const attemptCount = windowExpired ? 1 : previous.attempt_count + 1;
  const blockedUntil = attemptCount >= MAX_ATTEMPTS ? addMinutes(now, BLOCK_MINUTES).toISOString() : null;
  const windowStartedAt = windowExpired ? now.toISOString() : previous.window_started_at;
  const statements: RuntimeD1PreparedStatement[] = [
    database.prepare(
      `INSERT INTO admin_login_attempts (
        key_hash, attempt_count, window_started_at, blocked_until, updated_at
      ) VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(key_hash) DO UPDATE SET
        attempt_count = excluded.attempt_count,
        window_started_at = excluded.window_started_at,
        blocked_until = excluded.blocked_until,
        updated_at = excluded.updated_at`,
    ).bind(keyHash, attemptCount, windowStartedAt, blockedUntil, now.toISOString()),
  ];
  if (user) {
    statements.push(database.prepare(
      `UPDATE admin_users SET failed_attempts = ?, locked_until = ?, updated_at = ? WHERE id = ?`,
    ).bind(attemptCount, blockedUntil, now.toISOString(), user.id));
  }
  await database.batch(statements);
}

export async function loginAdmin(
  loginNameInput: string,
  password: string,
  networkFingerprint: string,
): Promise<LoginResult> {
  const database = getD1();
  const now = new Date();
  const loginName = normalizeLogin(loginNameInput);
  const keyHash = await loginKey(loginName, networkFingerprint);
  const [attempt, user] = await Promise.all([
    database.prepare(
      "SELECT attempt_count, window_started_at, blocked_until FROM admin_login_attempts WHERE key_hash = ?",
    ).bind(keyHash).first<LoginAttemptRow>(),
    database.prepare(
      `SELECT id, login_name, display_name, password_hash, role, is_active,
        failed_attempts, locked_until
       FROM admin_users WHERE login_name = ?`,
    ).bind(loginName).first<AdminUserRow>(),
  ]);

  if (isFuture(attempt?.blocked_until ?? null, now) || isFuture(user?.locked_until ?? null, now)) {
    const blockedUntil = attempt?.blocked_until ?? user?.locked_until;
    const retryAfter = Math.max(1, Math.ceil((new Date(blockedUntil ?? now).getTime() - now.getTime()) / 1000));
    throw new AdminAuthError(
      "rate_limited",
      "Đăng nhập tạm khóa do có quá nhiều lần thử. Vui lòng thử lại sau.",
      429,
      retryAfter,
    );
  }

  const passwordMatches = user
    ? await verifyPassword(password, user.password_hash)
    : (await consumeDummyPasswordWork(password), false);
  if (!user || !user.is_active || !passwordMatches) {
    await recordFailedLogin(database, keyHash, user, attempt, now);
    throw new AdminAuthError(
      "invalid_credentials",
      "Tên đăng nhập hoặc mật khẩu chưa đúng.",
      401,
    );
  }

  const sessionToken = randomToken();
  const csrfToken = randomToken();
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(now.getTime() + SESSION_HOURS * 60 * 60_000).toISOString();
  const [tokenHash, csrfTokenHash] = await Promise.all([sha256(sessionToken), sha256(csrfToken)]);
  await database.batch([
    database.prepare("DELETE FROM admin_login_attempts WHERE key_hash = ?").bind(keyHash),
    database.prepare(
      `UPDATE admin_users SET failed_attempts = 0, locked_until = NULL,
        last_login_at = ?, updated_at = ? WHERE id = ?`,
    ).bind(now.toISOString(), now.toISOString(), user.id),
    database.prepare(
      `INSERT INTO admin_sessions (
        id, token_hash, csrf_token_hash, admin_id, created_at, last_seen_at, expires_at, revoked_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NULL)`,
    ).bind(sessionId, tokenHash, csrfTokenHash, user.id, now.toISOString(), now.toISOString(), expiresAt),
    database.prepare(
      "DELETE FROM admin_sessions WHERE expires_at < ? OR revoked_at IS NOT NULL",
    ).bind(now.toISOString()),
  ]);

  return {
    sessionId,
    sessionToken,
    csrfToken,
    csrfTokenHash,
    expiresAt,
    principal: {
      id: user.id,
      loginName: user.login_name,
      displayName: user.display_name,
      role: user.role,
    },
  };
}

export async function authenticateAdminToken(sessionToken: string | null): Promise<AuthenticatedAdmin | null> {
  if (!sessionToken) return null;
  const database = getD1();
  const tokenHash = await sha256(sessionToken);
  const now = new Date();
  const row = await database.prepare(
    `SELECT s.id AS session_id, s.csrf_token_hash, s.last_seen_at, s.expires_at,
      u.id AS admin_id, u.login_name, u.display_name, u.role, u.is_active
     FROM admin_sessions s
     JOIN admin_users u ON u.id = s.admin_id
     WHERE s.token_hash = ? AND s.revoked_at IS NULL AND s.expires_at > ?`,
  ).bind(tokenHash, now.toISOString()).first<SessionRow>();
  if (!row || !row.is_active) return null;

  if (now.getTime() - new Date(row.last_seen_at).getTime() > 15 * 60_000) {
    await database.prepare(
      "UPDATE admin_sessions SET last_seen_at = ? WHERE id = ?",
    ).bind(now.toISOString(), row.session_id).run();
  }

  return {
    sessionId: row.session_id,
    csrfTokenHash: row.csrf_token_hash,
    expiresAt: row.expires_at,
    principal: {
      id: row.admin_id,
      loginName: row.login_name,
      displayName: row.display_name,
      role: row.role,
    },
  };
}

export async function revokeAdminSession(sessionId: string): Promise<void> {
  await getD1().prepare(
    "UPDATE admin_sessions SET revoked_at = ? WHERE id = ? AND revoked_at IS NULL",
  ).bind(new Date().toISOString(), sessionId).run();
}

export async function verifyCsrf(authenticated: AuthenticatedAdmin, token: string | null): Promise<void> {
  const tokenHash = token ? await sha256(token) : "";
  if (!token || !constantTimeStringEqual(tokenHash, authenticated.csrfTokenHash)) {
    throw new AdminAuthError("csrf_failed", "Phiên thao tác không hợp lệ. Vui lòng tải lại trang.", 403);
  }
}

export function requireAdminRole(authenticated: AuthenticatedAdmin): AdminPrincipal {
  if (authenticated.principal.role !== "admin") {
    throw new AdminAuthError("forbidden", "Tài khoản không có quyền thực hiện thao tác này.", 403);
  }
  return authenticated.principal;
}

export async function networkFingerprint(request: Request): Promise<string> {
  const forwarded = request.headers.get("cf-connecting-ip")
    ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? "local";
  return sha256(forwarded);
}
