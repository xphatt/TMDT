import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test, { after } from "node:test";
import { Miniflare } from "miniflare";

const miniflare = new Miniflare({
  compatibilityDate: "2026-05-22",
  d1Databases: { DB: "tra-sua-ngon-admin-tests" },
  modules: true,
  script: "export default { fetch() { return new Response('test runtime'); } }",
});
const database = await miniflare.getD1Database("DB");
after(async () => miniflare.dispose());

const migrationSql = await readFile(new URL("../drizzle/0000_material_maestro.sql", import.meta.url), "utf8");
for (const statement of migrationSql.split("--> statement-breakpoint").map((value) => value.trim()).filter(Boolean)) {
  await database.prepare(statement).run();
}

const workerUrl = new URL("../dist/server/index.js", import.meta.url);
workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
const { default: worker } = await import(workerUrl.href);
const env = {
  ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  DB: database,
};
const context = { waitUntil() {}, passThroughOnException() {} };

function request(path, init = {}) {
  return worker.fetch(new Request(new URL(path, "http://localhost"), init), env, context);
}

test("admin root redirects to the login surface", async () => {
  const response = await request("/");
  assert.ok([307, 308].includes(response.status));
  assert.equal(response.headers.get("location"), "/admin/login");
});

test("admin pages and APIs reject anonymous access", async () => {
  const page = await request("/admin");
  assert.ok([307, 308].includes(page.status));
  assert.match(page.headers.get("location") ?? "", /^\/admin\/login\?returnTo=/);

  const api = await request("/api/admin/orders");
  assert.equal(api.status, 401);
  assert.equal((await api.json()).error.code, "unauthorized");
  assert.equal(api.headers.get("cache-control"), "no-store");
});

test("admin login is rendered and robots deny indexing", async () => {
  const login = await request("/admin/login");
  assert.equal(login.status, 200);
  assert.match(await login.text(), /Đăng nhập quản trị/);

  const robots = await request("/robots.txt");
  assert.equal(robots.status, 200);
  assert.match(await robots.text(), /Disallow: \/$/m);
});
