import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { extname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const workerUrl = new URL("../dist/server/index.js", import.meta.url);
workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
const { default: worker } = await import(workerUrl.href);

const baseEnv = {
  ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
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

test("server renders the Trà Sữa Ngon storefront", async () => {
  const response = await request("/");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>Trà Sữa Ngon \| Trà tươi, chọn đúng gu<\/title>/);
  assert.match(html, /Trà ngon,/);
  assert.doesNotMatch(html, /Your site is taking shape|codex-preview|react-loading-skeleton/);
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
  assert.equal(envExample.trim(), "GEOAPIFY_API_KEY=");
  assert.match(gitignore, /^\.env\*$/m);
  assert.match(gitignore, /^!\.env\.example$/m);

  const sourceFiles = (await collectFiles(new URL("../app/", import.meta.url))).filter((file) => [".ts", ".tsx", ".js", ".mjs"].includes(extname(file)));
  const source = (await Promise.all(sourceFiles.map((file) => readFile(file, "utf8")))).join("\n");
  assert.doesNotMatch(source, /GEOAPIFY_API_KEY\s*=\s*["'][^"']+/);
});
