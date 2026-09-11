import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

async function runWrangler(args: string[], runtimeDirectory: string): Promise<void> {
  const wranglerEntry = join(process.cwd(), "node_modules", "wrangler", "bin", "wrangler.js");
  await new Promise<void>((resolve, reject) => {
    const child = spawn(process.execPath, [wranglerEntry, ...args], {
      cwd: process.cwd(),
      stdio: "inherit",
      shell: false,
      env: {
        ...process.env,
        XDG_CONFIG_HOME: join(runtimeDirectory, "xdg"),
        WRANGLER_LOG_PATH: join(runtimeDirectory, "wrangler.log"),
        WRANGLER_SEND_METRICS: "false",
      },
    });
    child.once("error", reject);
    child.once("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Wrangler kết thúc với mã ${code ?? "không xác định"}.`));
    });
  });
}

async function main(): Promise<void> {
  const wranglerRuntimeDirectory = join(process.cwd(), ".wrangler", "local-runtime");
  await mkdir(wranglerRuntimeDirectory, { recursive: true });
  await runWrangler(["d1", "migrations", "apply", "DB", "--local"], wranglerRuntimeDirectory);
  await runWrangler(["d1", "execute", "DB", "--local", "--command", "PRAGMA optimize;"], wranglerRuntimeDirectory);
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : "Không thể migrate D1 local."}\n`);
  process.exitCode = 1;
});
