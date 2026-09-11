import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { extname, join } from "node:path";
import test, { after } from "node:test";
import { fileURLToPath } from "node:url";
import { Miniflare } from "miniflare";

const miniflare = new Miniflare({
  compatibilityDate: "2026-05-22",
  d1Databases: { DB: "tra-sua-ngon-tests" },
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

const baseEnv = {
  ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  DB: database,
};
const executionContext = {
  waitUntil() {},
  passThroughOnException() {},
};

function request(path, init = {}, env = {}) {
  return worker.fetch(
    new Request(new URL(path, "http://localhost"), init),
    { ...baseEnv, ...env },
    executionContext,
  );
}

async function json(response) {
  return response.json();
}

function base64Url(bytes) {
  return Buffer.from(bytes).toString("base64url");
}

async function testPasswordHash(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const digest = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: 310_000 }, key, 256);
  return `pbkdf2-sha256$310000$${base64Url(salt)}$${base64Url(new Uint8Array(digest))}`;
}

function cookieHeader(response) {
  const values = typeof response.headers.getSetCookie === "function"
    ? response.headers.getSetCookie()
    : [response.headers.get("set-cookie")].filter(Boolean);
  return values.map((value) => value.split(";", 1)[0]).join("; ");
}

function cookieValue(cookies, name) {
  const pair = cookies.split("; ").find((value) => value.startsWith(`${name}=`));
  return pair ? decodeURIComponent(pair.slice(name.length + 1)) : "";
}

test("server renders the Trà Sữa Ngon storefront", async () => {
  const response = await request("/");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>Trà Sữa Ngon \| Trà tươi, chọn đúng gu<\/title>/);
  assert.match(html, /<link rel="canonical" href="http:\/\/localhost:3000\/?"/);
  assert.match(html, /<meta property="og:url" content="http:\/\/localhost:3000\/?"/);
  assert.match(html, /viewport-fit=cover/);
  assert.match(html, /Trà ngon,/);
  assert.doesNotMatch(html, /Your site is taking shape|codex-preview|react-loading-skeleton/);
});

test("robots and sitemap expose the configured local canonical origin", async () => {
  const robotsResponse = await request("/robots.txt");
  assert.equal(robotsResponse.status, 200);
  const robots = await robotsResponse.text();
  assert.match(robots, /Host: http:\/\/localhost:3000/);
  assert.match(robots, /Sitemap: http:\/\/localhost:3000\/sitemap\.xml/);

  const sitemapResponse = await request("/sitemap.xml");
  assert.equal(sitemapResponse.status, 200);
  const sitemap = await sitemapResponse.text();
  assert.match(sitemap, /<loc>http:\/\/localhost:3000<\/loc>/);
});

test("menu endpoint exposes only internal catalogue and pricing data", async () => {
  const response = await request("/api/menu");
  assert.equal(response.status, 200);
  const payload = await json(response);
  assert.equal(payload.products[0].id, "p1");
  assert.equal(payload.products[0].price, 39000);
  assert.equal(payload.toppings.find((item) => item.id === "white-pearl").price, 8000);
  assert.deepEqual(payload.pricing.sizeSurcharge, { M: 0, L: 7000 });
  assert.equal(payload.pricing.deliveryFee, 18000);
});

test("address endpoint rejects short queries and missing configuration safely", async () => {
  const previousKey = process.env.GEOAPIFY_API_KEY;
  delete process.env.GEOAPIFY_API_KEY;
  const shortResponse = await request("/api/address-suggestions?q=HN");
  assert.equal(shortResponse.status, 400);
  assert.equal((await json(shortResponse)).error.code, "invalid_query");

  const missingKeyResponse = await request("/api/address-suggestions?q=Nguyen%20Hue");
  assert.equal(missingKeyResponse.status, 503);
  assert.equal((await json(missingKeyResponse)).error.code, "address_service_unconfigured");
  if (previousKey === undefined) delete process.env.GEOAPIFY_API_KEY;
  else process.env.GEOAPIFY_API_KEY = previousKey;
});

test("address endpoint filters Vietnam, limits to five and returns minimal fields", async () => {
  const originalFetch = globalThis.fetch;
  const previousKey = process.env.GEOAPIFY_API_KEY;
  process.env.GEOAPIFY_API_KEY = "geo-test-secret-should-not-ship";
  let requestedUrl = "";
  globalThis.fetch = async (input) => {
    requestedUrl = String(input);
    return Response.json({
      results: Array.from({ length: 6 }, (_, index) => ({
        formatted: `${index + 1} Nguyễn Huệ, Phường Sài Gòn, Thành phố Hồ Chí Minh, Việt Nam`,
        state: "Thành phố Hồ Chí Minh",
        district: "Quận 1",
        lat: 10.773 + index / 1000,
        lon: 106.703 + index / 1000,
      })),
    });
  };

  try {
    const response = await request(
      "/api/address-suggestions?q=Nguyen%20Hue",
      {},
    );
    assert.equal(response.status, 200);
    const payload = await json(response);
    assert.equal(payload.suggestions.length, 5);
    assert.deepEqual(Object.keys(payload.suggestions[0]).sort(), ["district", "label", "latitude", "longitude", "province"]);
    const geoUrl = new URL(requestedUrl);
    assert.equal(geoUrl.searchParams.get("filter"), "countrycode:vn");
    assert.equal(geoUrl.searchParams.get("limit"), "5");
    assert.equal(geoUrl.searchParams.get("apiKey"), "geo-test-secret-should-not-ship");
  } finally {
    globalThis.fetch = originalFetch;
    if (previousKey === undefined) delete process.env.GEOAPIFY_API_KEY;
    else process.env.GEOAPIFY_API_KEY = previousKey;
  }
});

test("address endpoint supports empty results and masks Geoapify failures", async () => {
  const originalFetch = globalThis.fetch;
  const previousKey = process.env.GEOAPIFY_API_KEY;
  process.env.GEOAPIFY_API_KEY = "test-key";
  try {
    globalThis.fetch = async () => Response.json({ results: [] });
    const emptyResponse = await request(
      "/api/address-suggestions?q=Dia%20chi%20khong%20co",
      {},
    );
    assert.equal(emptyResponse.status, 200);
    assert.deepEqual((await json(emptyResponse)).suggestions, []);

    globalThis.fetch = async () => Response.json({ message: "unauthorized" }, { status: 401 });
    process.env.GEOAPIFY_API_KEY = "invalid-key";
    const invalidKeyResponse = await request(
      "/api/address-suggestions?q=Nguyen%20Hue",
      {},
    );
    assert.equal(invalidKeyResponse.status, 502);
    const invalidKeyPayload = await json(invalidKeyResponse);
    assert.equal(invalidKeyPayload.error.code, "address_service_misconfigured");
    assert.doesNotMatch(JSON.stringify(invalidKeyPayload), /invalid-key|unauthorized/);

    globalThis.fetch = async () => { throw new Error("network unavailable"); };
    process.env.GEOAPIFY_API_KEY = "test-key";
    const errorResponse = await request(
      "/api/address-suggestions?q=Nguyen%20Hue",
      {},
    );
    assert.equal(errorResponse.status, 502);
    assert.equal((await json(errorResponse)).error.code, "address_service_unavailable");
  } finally {
    globalThis.fetch = originalFetch;
    if (previousKey === undefined) delete process.env.GEOAPIFY_API_KEY;
    else process.env.GEOAPIFY_API_KEY = previousKey;
  }
});

test("order API recalculates internal prices and confirms without paid status", async () => {
  const customer = {
    fullName: "Nguyễn An",
    phone: "0901234567",
    address: "10 Nguyễn Huệ, Quận 1, Thành phố Hồ Chí Minh",
    note: "Gọi trước khi giao",
    payment: "bank",
  };
  const items = [{
    key: "client-controlled-key",
    productId: "p1",
    size: "L",
    sugar: "50%",
    ice: "Ít đá",
    toppings: ["white-pearl"],
    quantity: 2,
    unitPrice: 1,
  }];

  const createResponse = await request("/api/orders", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ customer, items }),
  });
  assert.equal(createResponse.status, 201);
  const pendingOrder = (await json(createResponse)).order;
  assert.equal(pendingOrder.status, "pending");
  assert.equal(pendingOrder.payment.paymentStatus, "simulation_only");
  assert.equal(pendingOrder.items[0].unitPrice, 54000);
  assert.equal(pendingOrder.subtotal, 108000);
  assert.equal(pendingOrder.deliveryFee, 18000);
  assert.equal(pendingOrder.total, 126000);
  assert.notEqual(pendingOrder.items[0].key, "client-controlled-key");

  const confirmResponse = await request(`/api/orders/${encodeURIComponent(pendingOrder.id)}/confirm`, { method: "POST" });
  assert.equal(confirmResponse.status, 200);
  const confirmedOrder = (await json(confirmResponse)).order;
  assert.equal(confirmedOrder.status, "confirmed");
  assert.equal(confirmedOrder.payment.paymentStatus, "simulation_only");
  assert.ok(confirmedOrder.confirmedAt);
  assert.doesNotMatch(JSON.stringify(confirmedOrder), /"paid"/);

  const cashResponse = await request("/api/orders", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ customer: { ...customer, payment: "cash" }, items }),
  });
  assert.equal(cashResponse.status, 201);
  assert.equal((await json(cashResponse)).order.payment.paymentStatus, "unpaid");
});

test("order API rejects missing address and unknown catalogue items", async () => {
  const baseCustomer = { fullName: "Nguyễn An", phone: "0901234567", address: "", note: "", payment: "cash" };
  const validItem = { key: "x", productId: "p1", size: "M", sugar: "50%", ice: "Vừa", toppings: [], quantity: 1, unitPrice: 39000 };
  const missingAddress = await request("/api/orders", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ customer: baseCustomer, items: [validItem] }),
  });
  assert.equal(missingAddress.status, 400);
  assert.ok((await json(missingAddress)).error.fields.address);

  const unknownItem = await request("/api/orders", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ customer: { ...baseCustomer, address: "10 Nguyễn Huệ, Quận 1" }, items: [{ ...validItem, productId: "external-product" }] }),
  });
  assert.equal(unknownItem.status, 400);
  assert.match((await json(unknownItem)).error.fields["items.0"], /menu nội bộ/);

  const unsupportedPayment = await request("/api/orders", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ customer: { ...baseCustomer, address: "10 Nguyễn Huệ, Quận 1", payment: "external_gateway" }, items: [validItem] }),
  });
  assert.equal(unsupportedPayment.status, 400);
  assert.match((await json(unsupportedPayment)).error.fields.payment, /không được hỗ trợ/);
});

async function collectFiles(directory) {
  const root = directory instanceof URL ? fileURLToPath(directory) : directory;
  const entries = await readdir(root, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(path));
    else files.push(path);
  }
  return files;
}

test("Geoapify secret is absent from client bundle and env files are protected", async () => {
  const clientFiles = await collectFiles(new URL("../dist/client/", import.meta.url));
  const textFiles = clientFiles.filter((file) => [".js", ".css", ".html", ".json"].includes(extname(file)));
  const clientBundle = (await Promise.all(textFiles.map((file) => readFile(file, "utf8")))).join("\n");
  assert.doesNotMatch(clientBundle, /GEOAPIFY_API_KEY|geo-test-secret-should-not-ship/);

  const envExample = await readFile(new URL("../.env.example", import.meta.url), "utf8");
  const gitignore = await readFile(new URL("../.gitignore", import.meta.url), "utf8");
  assert.match(envExample, /^GEOAPIFY_API_KEY=$/m);
  assert.match(envExample, /^SITE_URL=http:\/\/localhost:3000$/m);
  assert.match(gitignore, /^\.env\*$/m);
  assert.match(gitignore, /^!\.env\.example$/m);

  const sourceFiles = (await collectFiles(new URL("../app/", import.meta.url))).filter((file) => [".ts", ".tsx", ".js", ".mjs"].includes(extname(file)));
  const source = (await Promise.all(sourceFiles.map((file) => readFile(file, "utf8")))).join("\n");
  assert.doesNotMatch(source, /GEOAPIFY_API_KEY\s*=\s*["'][^"']+/);
  assert.doesNotMatch(source, /ADMIN_(?:PASSWORD|SESSION_TOKEN)\s*=\s*["'][^"']+/);
});

test("admin routes require authentication and login rate limiting does not reveal accounts", async () => {
  const pageResponse = await request("/admin");
  assert.ok([307, 308].includes(pageResponse.status));
  assert.match(pageResponse.headers.get("location") ?? "", /^\/admin\/login\?returnTo=/);

  const apiResponse = await request("/api/admin/orders");
  assert.equal(apiResponse.status, 401);
  assert.equal((await json(apiResponse)).error.code, "unauthorized");

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const wrongResponse = await request("/api/admin/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "http://localhost" },
      body: JSON.stringify({ loginName: "khong-ton-tai", password: "mat-khau-khong-dung" }),
    });
    assert.equal(wrongResponse.status, 401);
    assert.equal((await json(wrongResponse)).error.message, "Tên đăng nhập hoặc mật khẩu chưa đúng.");
  }
  const blockedResponse = await request("/api/admin/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "http://localhost" },
    body: JSON.stringify({ loginName: "khong-ton-tai", password: "mat-khau-khong-dung" }),
  });
  assert.equal(blockedResponse.status, 429);
  assert.equal((await json(blockedResponse)).error.code, "rate_limited");
});

test("admin can search orders, enforce transitions, confirm COD and produce audit history", async () => {
  const password = "MatKhauTest-AnToan-2026";
  const operatorPassword = "MatKhauOperator-2026";
  const now = new Date().toISOString();
  await database.batch([
    database.prepare(
      `INSERT INTO admin_users (
        id, login_name, display_name, password_hash, role, is_active,
        failed_attempts, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'admin', 1, 0, ?, ?)`,
    ).bind("admin-test", "admin-test", "Quản trị kiểm thử", await testPasswordHash(password), now, now),
    database.prepare(
      `INSERT INTO admin_users (
        id, login_name, display_name, password_hash, role, is_active,
        failed_attempts, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'operator', 1, 0, ?, ?)`,
    ).bind("operator-test", "operator-test", "Nhân viên kiểm thử", await testPasswordHash(operatorPassword), now, now),
  ]);

  const customer = {
    fullName: "Trần Minh An",
    phone: "0912345678",
    address: "25 Nguyễn Thị Minh Khai, Quận 1, Thành phố Hồ Chí Minh",
    note: "Giao tại quầy lễ tân",
    payment: "cash",
  };
  const item = { productId: "p1", size: "M", sugar: "50%", ice: "Vừa", toppings: ["white-pearl"], quantity: 1 };
  const createResponse = await request("/api/orders", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ customer, items: [item] }),
  });
  assert.equal(createResponse.status, 201);
  const createdOrder = (await json(createResponse)).order;
  const customerConfirm = await request(`/api/orders/${encodeURIComponent(createdOrder.id)}/confirm`, { method: "POST" });
  assert.equal(customerConfirm.status, 200);

  const loginResponse = await request("/api/admin/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "http://localhost" },
    body: JSON.stringify({ loginName: "admin-test", password }),
  });
  assert.equal(loginResponse.status, 200);
  const adminCookies = cookieHeader(loginResponse);
  assert.match(adminCookies, /tsn_admin_session=/);
  assert.match(adminCookies, /tsn_admin_csrf=/);
  const csrf = cookieValue(adminCookies, "tsn_admin_csrf");

  const sessionResponse = await request("/api/admin/auth/session", { headers: { cookie: adminCookies } });
  assert.equal(sessionResponse.status, 200);
  assert.equal((await json(sessionResponse)).admin.role, "admin");

  const listResponse = await request(`/api/admin/orders?q=${encodeURIComponent(createdOrder.id)}&page=1&pageSize=20`, { headers: { cookie: adminCookies } });
  assert.equal(listResponse.status, 200);
  const list = (await json(listResponse)).orders;
  assert.equal(list.totalItems, 1);
  assert.equal(list.items[0].orderCode, createdOrder.id);
  assert.equal(list.items[0].amountPaid, 0);

  let detailResponse = await request(`/api/admin/orders/${encodeURIComponent(createdOrder.id)}`, { headers: { cookie: adminCookies } });
  let detail = (await json(detailResponse)).order;
  assert.equal(detail.orderStatus, "confirmed");
  assert.equal(detail.payment.amountOutstanding, detail.totalAmount);

  const invalidTransition = await request(`/api/admin/orders/${encodeURIComponent(createdOrder.id)}/status`, {
    method: "PATCH",
    headers: { cookie: adminCookies, origin: "http://localhost", "x-csrf-token": csrf, "content-type": "application/json" },
    body: JSON.stringify({ toStatus: "completed", expectedVersion: detail.version }),
  });
  assert.equal(invalidTransition.status, 409);
  assert.equal((await json(invalidTransition)).error.code, "invalid_transition");

  for (const toStatus of ["preparing", "delivering"]) {
    const transitionResponse = await request(`/api/admin/orders/${encodeURIComponent(createdOrder.id)}/status`, {
      method: "PATCH",
      headers: { cookie: adminCookies, origin: "http://localhost", "x-csrf-token": csrf, "content-type": "application/json" },
      body: JSON.stringify({ toStatus, expectedVersion: detail.version, reason: "Đã kiểm tra theo quy trình." }),
    });
    assert.equal(transitionResponse.status, 200);
    detail = (await json(transitionResponse)).order;
    assert.equal(detail.orderStatus, toStatus);
  }

  const codResponse = await request(`/api/admin/orders/${encodeURIComponent(createdOrder.id)}/payments/cod-confirmation`, {
    method: "POST",
    headers: { cookie: adminCookies, origin: "http://localhost", "x-csrf-token": csrf, "content-type": "application/json" },
    body: JSON.stringify({ expectedVersion: detail.version, note: "Đã nhận đủ tiền mặt." }),
  });
  assert.equal(codResponse.status, 200);
  detail = (await json(codResponse)).order;
  assert.equal(detail.payment.status, "paid");
  assert.equal(detail.payment.amountPaid, detail.totalAmount);
  assert.equal(detail.payment.amountOutstanding, 0);
  assert.ok(detail.audit.some((entry) => entry.action === "order.cod_confirmed"));

  const completedResponse = await request(`/api/admin/orders/${encodeURIComponent(createdOrder.id)}/status`, {
    method: "PATCH",
    headers: { cookie: adminCookies, origin: "http://localhost", "x-csrf-token": csrf, "content-type": "application/json" },
    body: JSON.stringify({ toStatus: "completed", expectedVersion: detail.version }),
  });
  assert.equal(completedResponse.status, 200);
  detail = (await json(completedResponse)).order;
  assert.equal(detail.orderStatus, "completed");
  assert.ok(detail.history.length >= 5);
  assert.ok(detail.audit.some((entry) => entry.action === "order.status_changed"));

  const operatorLogin = await request("/api/admin/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "http://localhost" },
    body: JSON.stringify({ loginName: "operator-test", password: operatorPassword }),
  });
  const operatorCookies = cookieHeader(operatorLogin);
  const operatorCsrf = cookieValue(operatorCookies, "tsn_admin_csrf");
  const deniedMutation = await request(`/api/admin/orders/${encodeURIComponent(createdOrder.id)}/status`, {
    method: "PATCH",
    headers: { cookie: operatorCookies, origin: "http://localhost", "x-csrf-token": operatorCsrf, "content-type": "application/json" },
    body: JSON.stringify({ toStatus: "cancelled", expectedVersion: detail.version, reason: "Không đủ quyền thao tác." }),
  });
  assert.equal(deniedMutation.status, 403);

  const logoutResponse = await request("/api/admin/auth/logout", {
    method: "POST",
    headers: { cookie: adminCookies, origin: "http://localhost", "x-csrf-token": csrf },
  });
  assert.equal(logoutResponse.status, 200);
  const revokedSession = await request("/api/admin/auth/session", { headers: { cookie: adminCookies } });
  assert.equal(revokedSession.status, 401);

  const expiringLogin = await request("/api/admin/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "http://localhost" },
    body: JSON.stringify({ loginName: "admin-test", password }),
  });
  const expiringCookies = cookieHeader(expiringLogin);
  const sessionToken = cookieValue(expiringCookies, "tsn_admin_session");
  const sessionTokenHash = base64Url(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(sessionToken))));
  await database.prepare("UPDATE admin_sessions SET expires_at = ? WHERE token_hash = ?").bind("2000-01-01T00:00:00.000Z", sessionTokenHash).run();
  const expiredSession = await request("/api/admin/auth/session", { headers: { cookie: expiringCookies } });
  assert.equal(expiredSession.status, 401);
});
