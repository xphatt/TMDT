import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  AdminAuthError,
  authenticateAdminToken,
  requireAdminRole,
  verifyCsrf,
  type AdminPrincipal,
  type AuthenticatedAdmin,
} from "./admin-auth";

export const ADMIN_SESSION_COOKIE = "tsn_admin_session";
export const ADMIN_CSRF_COOKIE = "tsn_admin_csrf";
const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

export function readCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get("cookie") ?? "";
  for (const part of cookieHeader.split(";")) {
    const [rawName, ...rawValue] = part.trim().split("=");
    if (rawName === name) return decodeURIComponent(rawValue.join("="));
  }
  return null;
}

function serializeCookie(
  name: string,
  value: string,
  options: { httpOnly: boolean; secure: boolean; maxAge: number },
): string {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    `Max-Age=${options.maxAge}`,
    "SameSite=Lax",
  ];
  if (options.httpOnly) parts.push("HttpOnly");
  if (options.secure) parts.push("Secure");
  return parts.join("; ");
}

export function appendAdminCookies(
  headers: Headers,
  request: Request,
  sessionToken: string,
  csrfToken: string,
): void {
  const secure = new URL(request.url).protocol === "https:";
  headers.append("set-cookie", serializeCookie(ADMIN_SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure,
    maxAge: SESSION_MAX_AGE_SECONDS,
  }));
  headers.append("set-cookie", serializeCookie(ADMIN_CSRF_COOKIE, csrfToken, {
    httpOnly: false,
    secure,
    maxAge: SESSION_MAX_AGE_SECONDS,
  }));
}

export function appendClearedAdminCookies(headers: Headers, request: Request): void {
  const secure = new URL(request.url).protocol === "https:";
  headers.append("set-cookie", serializeCookie(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure,
    maxAge: 0,
  }));
  headers.append("set-cookie", serializeCookie(ADMIN_CSRF_COOKIE, "", {
    httpOnly: false,
    secure,
    maxAge: 0,
  }));
}

export function validateSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    throw new AdminAuthError("csrf_failed", "Nguồn gửi yêu cầu không hợp lệ.", 403);
  }
}

export async function requireAdminRequest(
  request: Request,
  options: { csrf?: boolean; adminOnly?: boolean } = {},
): Promise<AuthenticatedAdmin> {
  const authenticated = await authenticateAdminToken(readCookie(request, ADMIN_SESSION_COOKIE));
  if (!authenticated) throw new AdminAuthError("unauthorized", "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.", 401);
  if (options.adminOnly) requireAdminRole(authenticated);
  if (options.csrf) {
    validateSameOrigin(request);
    await verifyCsrf(authenticated, request.headers.get("x-csrf-token"));
  }
  return authenticated;
}

function safeReturnTo(value: string): string {
  if (!value.startsWith("/admin") || value.startsWith("//")) return "/admin";
  try {
    const url = new URL(value, "https://admin.local");
    return url.origin === "https://admin.local" ? `${url.pathname}${url.search}` : "/admin";
  } catch {
    return "/admin";
  }
}

export async function requireAdminPage(returnTo: string): Promise<AdminPrincipal> {
  const cookieStore = await cookies();
  const authenticated = await authenticateAdminToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value ?? null);
  if (!authenticated) redirect(`/admin/login?returnTo=${encodeURIComponent(safeReturnTo(returnTo))}`);
  return authenticated.principal;
}

export async function getAdminPagePrincipal(): Promise<AdminPrincipal | null> {
  const cookieStore = await cookies();
  const authenticated = await authenticateAdminToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value ?? null);
  return authenticated?.principal ?? null;
}

export function adminAuthErrorResponse(error: unknown): Response {
  if (error instanceof AdminAuthError) {
    const headers = new Headers({ "cache-control": "no-store" });
    if (error.retryAfterSeconds) headers.set("retry-after", String(error.retryAfterSeconds));
    return Response.json({ error: { code: error.code, message: error.message } }, { status: error.status, headers });
  }
  return Response.json(
    { error: { code: "admin_request_failed", message: "Không thể xử lý yêu cầu quản trị lúc này." } },
    { status: 500, headers: { "cache-control": "no-store" } },
  );
}
