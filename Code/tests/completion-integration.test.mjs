import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test, { after } from "node:test";
import { Miniflare } from "miniflare";

const miniflare = new Miniflare({ compatibilityDate: "2026-05-22", d1Databases: { DB: "completion-tests" }, modules: true, script: "export default { fetch() { return new Response('test'); } }" });
const database = await miniflare.getD1Database("DB");
after(async () => miniflare.dispose());
const migrationDirectory = new URL("../drizzle/", import.meta.url);
for (const name of (await readdir(migrationDirectory)).filter((entry) => /^\d+.*\.sql$/u.test(entry)).sort()) {
  const sql = await readFile(new URL(name, migrationDirectory), "utf8");
  for (const statement of sql.split("--> statement-breakpoint").map((value) => value.trim()).filter(Boolean)) await database.prepare(statement).run();
}
const workerUrl = new URL("../dist/server/index.js", import.meta.url);
workerUrl.searchParams.set("completion", `${process.pid}-${Date.now()}`);
const { default: worker } = await import(workerUrl.href);
const env = { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) }, DB: database };
const context = { waitUntil() {}, passThroughOnException() {} };
const request = (path, init = {}) => worker.fetch(new Request(new URL(path, "http://localhost"), init), env, context);
const json = (response) => response.json();

function base64Url(bytes) { return Buffer.from(bytes).toString("base64url"); }
async function passwordHash(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const digest = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: 310_000 }, key, 256);
  return `pbkdf2-sha256$310000$${base64Url(salt)}$${base64Url(new Uint8Array(digest))}`;
}
function cookieHeader(response) {
  const values = typeof response.headers.getSetCookie === "function" ? response.headers.getSetCookie() : [response.headers.get("set-cookie")].filter(Boolean);
  return values.map((value) => value.split(";", 1)[0]).join("; ");
}
function cookieValue(cookies, name) { const pair = cookies.split("; ").find((value) => value.startsWith(`${name}=`)); return pair ? decodeURIComponent(pair.slice(name.length + 1)) : ""; }

const adminPassword = "MatKhauCompletion-Test-2026";
const now = new Date().toISOString();
await database.prepare("INSERT INTO admin_users (id, login_name, display_name, password_hash, role, is_active, failed_attempts, created_at, updated_at) VALUES (?, ?, ?, ?, 'admin', 1, 0, ?, ?)").bind("completion-admin", "completion-admin", "Admin hoàn thiện", await passwordHash(adminPassword), now, now).run();
const login = await request("/api/admin/auth/login", { method: "POST", headers: { "content-type": "application/json", origin: "http://localhost" }, body: JSON.stringify({ loginName: "completion-admin", password: adminPassword }) });
assert.equal(login.status, 200);
const cookies = cookieHeader(login);
const csrf = cookieValue(cookies, "tsn_admin_csrf");
const adminHeaders = { cookie: cookies, origin: "http://localhost", "x-csrf-token": csrf, "content-type": "application/json" };

test("health endpoint verifies the configured D1 binding without exposing configuration", async () => {
  const response = await request("/api/health");
  assert.equal(response.status, 200);
  const payload = await json(response);
  assert.equal(payload.status, "ok");
  assert.equal(payload.database, "connected");
  assert.match(payload.checkedAt, /^\d{4}-\d{2}-\d{2}T/u);
  assert.equal(JSON.stringify(payload).includes("GEOAPIFY"), false);
});

test("feedback validates, persists once and is available only through authenticated admin API", async () => {
  const invalid = await request("/api/feedback", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({}) });
  assert.equal(invalid.status, 400);
  const body = { fullName: "Nguyễn Minh", contact: "minh@example.com", subject: "Góp ý giao hàng", message: "Mong quầy gọi trước khi giao món.", clientRequestId: "feedback_req_001" };
  const first = await request("/api/feedback", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const firstRecord = (await json(first)).feedback;
  const duplicate = await request("/api/feedback", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  assert.equal((await json(duplicate)).feedback.id, firstRecord.id);
  const denied = await request("/api/admin/feedback");
  assert.equal(denied.status, 401);
  const list = await request("/api/admin/feedback", { headers: { cookie: cookies } });
  assert.ok((await json(list)).feedback.some((item) => item.id === firstRecord.id));
});

test("reviews persist, calculate aggregate, enforce ownership and support admin moderation", async () => {
  const ownerToken = "owner_token_completion_001";
  const body = { productId: "p4", reviewerName: "Lan", rating: 5, comment: "Vị đào rõ và không quá ngọt.", ownerToken, clientRequestId: "review_req_001" };
  const createdResponse = await request("/api/reviews", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  assert.equal(createdResponse.status, 201);
  const created = (await json(createdResponse)).review;
  const list = await request("/api/reviews?productId=p4", { headers: { "x-review-owner": ownerToken } });
  const summary = (await json(list)).reviews;
  assert.equal(summary.average, 5);
  assert.equal(summary.total, 1);
  assert.equal(summary.items[0].owned, true);
  const duplicate = await request("/api/reviews", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...body, clientRequestId: "review_req_002" }) });
  assert.equal(duplicate.status, 409);
  const forbidden = await request(`/api/reviews/${created.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ reviewerName: "Lan", rating: 4, comment: "Cập nhật đánh giá.", ownerToken: "wrong_owner_token_001" }) });
  assert.equal(forbidden.status, 403);
  const moderated = await request(`/api/admin/reviews/${created.id}`, { method: "PATCH", headers: adminHeaders, body: JSON.stringify({ status: "hidden" }) });
  assert.equal((await json(moderated)).review.status, "hidden");
});

test("admin catalogue CRUD drives active promotions and order totals are server-owned and idempotent", async () => {
  const unauthorized = await request("/api/admin/catalogue");
  assert.equal(unauthorized.status, 401);
  const product = { id: "p-test-completion", slug: "tra-thu-nghiem", name: "Trà Thử Nghiệm", category: "fruit-tea", basePrice: 50000, description: "Sản phẩm dùng riêng cho integration test.", ingredients: "Trà xanh, trái cây", tags: ["Mới"], popularity: 10, image: "/images/product-lineup.png", imagePosition: "50% 50%", tone: "green", isActive: true };
  const created = await request("/api/admin/catalogue", { method: "POST", headers: adminHeaders, body: JSON.stringify(product) });
  assert.equal(created.status, 201);
  assert.ok((await json(created)).catalogue.products.some((item) => item.id === product.id));
  const promotion = { id: "promo-test-completion", productId: product.id, label: "Giá test", salePrice: 41000, startsAt: "2026-01-01T00:00:00.000Z", endsAt: "2027-12-31T23:59:59.999Z", isActive: true };
  const promoted = await request("/api/admin/promotions", { method: "POST", headers: adminHeaders, body: JSON.stringify(promotion) });
  assert.equal(promoted.status, 201);
  const menu = await request("/api/menu");
  const menuProduct = (await json(menu)).products.find((item) => item.id === product.id);
  assert.equal(menuProduct.price, 41000);
  assert.equal(menuProduct.originalPrice, 50000);

  const customer = { fullName: "Nguyễn An", phone: "0901234567", address: "10 Nguyễn Huệ, Quận 1, Thành phố Hồ Chí Minh", note: "", payment: "cash" };
  const orderBody = { customer, items: [{ productId: product.id, size: "M", sugar: "50%", ice: "Vừa", toppings: [], quantity: 2, unitPrice: 1 }], clientRequestId: "checkout_req_completion_001" };
  const firstOrderResponse = await request("/api/orders", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(orderBody) });
  assert.equal(firstOrderResponse.status, 201);
  const firstOrder = (await json(firstOrderResponse)).order;
  assert.equal(firstOrder.items[0].unitPrice, 41000);
  assert.equal(firstOrder.total, 100000);
  const retryResponse = await request("/api/orders", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(orderBody) });
  assert.equal((await json(retryResponse)).order.id, firstOrder.id);
  const count = await database.prepare("SELECT COUNT(*) AS total FROM orders WHERE idempotency_key = ?").bind(orderBody.clientRequestId).first();
  assert.equal(count.total, 1);
});

test("production bundle ignores checkout demo environment flags", async () => {
  const previousMode = process.env.DEMO_MODE;
  const previousScenario = process.env.DEMO_ERROR_SCENARIO;
  process.env.DEMO_MODE = "true";
  process.env.DEMO_ERROR_SCENARIO = "checkout_timeout";
  try {
    const response = await request("/api/orders", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ customer: { fullName: "Đỗ An", phone: "0901234567", address: "12 Lê Lợi, Quận 1, Thành phố Hồ Chí Minh", note: "", payment: "cash" }, items: [{ productId: "p1", size: "M", sugar: "50%", ice: "Vừa", toppings: [], quantity: 1 }], clientRequestId: "checkout_prod_guard_001" }) });
    assert.equal(response.status, 201);
  } finally {
    if (previousMode === undefined) delete process.env.DEMO_MODE; else process.env.DEMO_MODE = previousMode;
    if (previousScenario === undefined) delete process.env.DEMO_ERROR_SCENARIO; else process.env.DEMO_ERROR_SCENARIO = previousScenario;
  }
});
