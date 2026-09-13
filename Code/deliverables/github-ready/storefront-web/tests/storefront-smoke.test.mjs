import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test, { after } from "node:test";
import { Miniflare } from "miniflare";

const miniflare = new Miniflare({
  compatibilityDate: "2026-05-22",
  d1Databases: { DB: "tra-sua-ngon-storefront-tests" },
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

test("storefront renders and exposes internal menu data", async () => {
  const page = await request("/");
  assert.equal(page.status, 200);
  assert.match(await page.text(), /Trà Sữa Ngon/);

  const menu = await request("/api/menu");
  assert.equal(menu.status, 200);
  const payload = await menu.json();
  assert.equal(payload.products[0].id, "p1");
  assert.equal(payload.pricing.deliveryFee, 18000);
});

test("storefront creates a pending COD order with server-calculated pricing", async () => {
  const response = await request("/api/orders", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      customer: {
        fullName: "Nguyễn An",
        phone: "0901234567",
        address: "10 Nguyễn Huệ, Quận 1, Thành phố Hồ Chí Minh",
        note: "",
        payment: "cash",
      },
      items: [{
        productId: "p1",
        size: "L",
        sugar: "50%",
        ice: "Ít đá",
        toppings: ["white-pearl"],
        quantity: 1,
        unitPrice: 1,
      }],
    }),
  });
  assert.equal(response.status, 201);
  const order = (await response.json()).order;
  assert.equal(order.status, "pending");
  assert.equal(order.payment.paymentStatus, "unpaid");
  assert.equal(order.items[0].unitPrice, 54000);
});

test("address proxy fails safely when Geoapify is not configured", async () => {
  const previousKey = process.env.GEOAPIFY_API_KEY;
  delete process.env.GEOAPIFY_API_KEY;
  try {
    const response = await request("/api/address-suggestions?q=Nguyen%20Hue");
    assert.equal(response.status, 503);
    assert.equal((await response.json()).error.code, "address_service_unconfigured");
  } finally {
    if (previousKey === undefined) delete process.env.GEOAPIFY_API_KEY;
    else process.env.GEOAPIFY_API_KEY = previousKey;
  }
});
