import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { hashPassword } from "../app/server/auth/password.ts";

function escapeSql(value: string): string {
  return value.replace(/'/g, "''");
}

function hiddenPrompt(label: string): Promise<string> {
  if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== "function") {
    throw new Error("Lệnh tạo admin cần chạy trong terminal tương tác.");
  }
  return new Promise((resolve, reject) => {
    let value = "";
    const onData = (chunk: Buffer) => {
      const text = chunk.toString("utf8");
      for (const character of text) {
        if (character === "\u0003") {
          cleanup();
          reject(new Error("Đã hủy tạo tài khoản."));
          return;
        }
        if (character === "\r" || character === "\n") {
          process.stdout.write("\n");
          cleanup();
          resolve(value);
          return;
        }
        if (character === "\u007f" || character === "\b") {
          value = value.slice(0, -1);
        } else if (character >= " ") {
          value += character;
        }
      }
    };
    const cleanup = () => {
      process.stdin.off("data", onData);
      process.stdin.setRawMode(false);
      process.stdin.pause();
    };
    process.stdout.write(label);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on("data", onData);
  });
}

async function runWrangler(sqlFile: string): Promise<void> {
  const wranglerEntry = join(process.cwd(), "node_modules", "wrangler", "bin", "wrangler.js");
  const wranglerRuntimeDirectory = join(process.cwd(), ".wrangler", "local-runtime");
  await mkdir(wranglerRuntimeDirectory, { recursive: true });
  await new Promise<void>((resolve, reject) => {
    const child = spawn(process.execPath, [wranglerEntry, "d1", "execute", "DB", "--local", "--file", sqlFile], {
      cwd: process.cwd(),
      stdio: "inherit",
      shell: false,
      env: {
        ...process.env,
        XDG_CONFIG_HOME: join(wranglerRuntimeDirectory, "xdg"),
        WRANGLER_LOG_PATH: join(wranglerRuntimeDirectory, "wrangler.log"),
        WRANGLER_SEND_METRICS: "false",
      },
    });
    child.once("error", reject);
    child.once("exit", (code) => code === 0 ? resolve() : reject(new Error(`Wrangler kết thúc với mã ${code ?? "không xác định"}.`)));
  });
}

async function main() {
  if (process.argv.includes("--remote")) {
    throw new Error("Script này chỉ tạo tài khoản local. Tài khoản production cần phê duyệt riêng.");
  }
  const readline = createInterface({ input: process.stdin, output: process.stdout });
  const loginName = (await readline.question("Tên đăng nhập (3-50 ký tự a-z, 0-9, ._-): ")).trim().toLowerCase();
  const displayName = (await readline.question("Tên hiển thị: ")).trim();
  readline.close();
  if (!/^[a-z0-9._-]{3,50}$/u.test(loginName)) throw new Error("Tên đăng nhập không hợp lệ.");
  if (displayName.length < 2 || displayName.length > 100) throw new Error("Tên hiển thị phải có từ 2 đến 100 ký tự.");
  const password = await hiddenPrompt("Mật khẩu (ít nhất 12 ký tự): ");
  const confirmation = await hiddenPrompt("Nhập lại mật khẩu: ");
  if (password !== confirmation) throw new Error("Hai mật khẩu không trùng nhau.");
  const passwordHash = await hashPassword(password);
  const now = new Date().toISOString();
  const sql = `INSERT INTO admin_users (
    id, login_name, display_name, password_hash, role, is_active,
    failed_attempts, locked_until, last_login_at, created_at, updated_at
  ) VALUES (
    '${escapeSql(crypto.randomUUID())}',
    '${escapeSql(loginName)}',
    '${escapeSql(displayName)}',
    '${escapeSql(passwordHash)}',
    'admin', 1, 0, NULL, NULL,
    '${escapeSql(now)}', '${escapeSql(now)}'
  );`;
  const temporaryDirectory = await mkdtemp(join(tmpdir(), "tsn-admin-"));
  const sqlFile = join(temporaryDirectory, "create-admin.sql");
  try {
    await writeFile(sqlFile, sql, { encoding: "utf8", mode: 0o600 });
    await runWrangler(sqlFile);
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
  process.stdout.write(`Đã tạo tài khoản admin local “${loginName}”.\n`);
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : "Không thể tạo tài khoản."}\n`);
  process.exitCode = 1;
});
