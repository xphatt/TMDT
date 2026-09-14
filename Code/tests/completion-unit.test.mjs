import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateAverageRating,
  calculateOrderTotals,
  canManageCatalogue,
  effectiveProductPrice,
  isCheckoutDemoEnabled,
  isPromotionActive,
  normalizeSearchText,
  validateFeedbackInput,
  validateReviewInput,
} from "../app/domain/completion-rules.ts";
import { loadCart, saveCart } from "../app/lib/storage.ts";
import { validateCheckoutDetails } from "../app/domain/checkout-validation.ts";
import {
  applyVerifiedPaymentEvent,
  canRetryPayment,
  verifyHmacSha256,
} from "../app/server/payments/online-payment.ts";

test("Vietnamese search normalization matches accented and unaccented queries", () => {
  assert.equal(normalizeSearchText("Trà Đào Cam Sả"), "tra dao cam sa");
  assert.equal(normalizeSearchText("  OOLONG   NƯỚNG  "), "oolong nuong");
  assert.equal(normalizeSearchText("!!!"), "!!!");
});

test("cart storage restores the same configured items after a reload boundary", () => {
  const values = new Map();
  globalThis.window = {
    localStorage: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
    },
  };
  const cart = [{ key: "p4-M-50-vua-pearl", productId: "p4", size: "M", sugar: "50%", ice: "Vừa", toppings: ["pearl"], quantity: 2, unitPrice: 44000 }];
  try {
    saveCart(cart);
    assert.deepEqual(loadCart(), cart);
  } finally {
    delete globalThis.window;
  }
});

test("feedback validation accepts email or Vietnamese phone and rejects unsafe lengths", () => {
  const valid = validateFeedbackInput({ fullName: "Nguyễn An", contact: "an@example.com", subject: "Góp ý món", message: "Mình muốn góp ý về độ ngọt của món.", clientRequestId: "feedback_001" });
  assert.deepEqual(valid.errors, {});
  const invalid = validateFeedbackInput({ fullName: "A", contact: "khong-hop-le", subject: "x", message: "ngắn", clientRequestId: "x" });
  assert.deepEqual(Object.keys(invalid.errors).sort(), ["clientRequestId", "contact", "fullName", "message", "subject"]);
});

test("promotion pricing applies only inside an active valid window", () => {
  const promotion = { salePrice: 37000, startsAt: "2026-01-01T00:00:00.000Z", endsAt: "2026-12-31T23:59:59.999Z", isActive: true };
  assert.equal(isPromotionActive(promotion, new Date("2026-06-01T00:00:00.000Z")), true);
  assert.equal(effectiveProductPrice(42000, promotion, new Date("2026-06-01T00:00:00.000Z")), 37000);
  assert.equal(effectiveProductPrice(42000, promotion, new Date("2027-01-01T00:00:00.000Z")), 42000);
  assert.equal(effectiveProductPrice(42000, { ...promotion, salePrice: 45000 }, new Date("2026-06-01T00:00:00.000Z")), 42000);
});

test("review validation and average rating ignore invalid ratings", () => {
  const valid = validateReviewInput({ productId: "p1", reviewerName: "Minh", rating: 5, comment: "Trà thơm và vừa ngọt.", ownerToken: "owner_token_123456", clientRequestId: "review_req_001" });
  assert.deepEqual(valid.errors, {});
  assert.equal(calculateAverageRating([5, 4, 3, 0, 8, 4.5]), 4);
  assert.equal(calculateAverageRating([]), 0);
});

test("admin permission and server totals reject negative or non-finite values", () => {
  assert.equal(canManageCatalogue("admin"), true);
  assert.equal(canManageCatalogue("operator"), false);
  assert.deepEqual(calculateOrderTotals([37000, 16000, Number.NaN, -1], 18000, 10000), { subtotal: 53000, discountAmount: 10000, shippingFee: 18000, total: 61000 });
});

test("checkout demo is development-only and defaults off", () => {
  assert.equal(isCheckoutDemoEnabled({ isProduction: false, demoMode: "true", scenario: "checkout_timeout" }), true);
  assert.equal(isCheckoutDemoEnabled({ isProduction: true, demoMode: "true", scenario: "checkout_timeout" }), false);
  assert.equal(isCheckoutDemoEnabled({ isProduction: false, demoMode: "false", scenario: "checkout_timeout" }), false);
});

test("checkout accepts a complete manual address without a Geoapify selection", () => {
  const valid = validateCheckoutDetails({
    fullName: "Nguyễn An",
    phone: "0901234567",
    address: "25 Nguyễn Thị Minh Khai, Phường Bến Nghé, Quận 1, Thành phố Hồ Chí Minh",
    note: "Gọi trước khi giao",
    payment: "cash",
  });
  assert.deepEqual(valid, {});

  const invalid = validateCheckoutDetails({
    fullName: "Nguyễn An",
    phone: "0901234567",
    address: "dsad",
    note: "",
    payment: "cash",
  });
  assert.match(invalid.address, /số nhà.*đường.*khu vực/i);
});

test("online payment foundation rejects forged or mismatched webhook data", async () => {
  const secret = "sandbox-test-secret";
  const body = JSON.stringify({ transaction: "txn-001", amount: 57000 });
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signatureBytes = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body)));
  const signature = [...signatureBytes].map((value) => value.toString(16).padStart(2, "0")).join("");
  assert.equal(await verifyHmacSha256({ secret, payload: body, signature, encoding: "hex" }), true);
  assert.equal(await verifyHmacSha256({ secret, payload: body, signature: `${signature.slice(0, -2)}00`, encoding: "hex" }), false);

  const attempt = {
    id: "attempt-001",
    orderId: "order-001",
    provider: "sandbox_gateway",
    merchantReference: "merchant-001",
    providerTransactionId: "txn-001",
    amount: 57000,
    currency: "VND",
    status: "pending",
    processedEventIds: [],
    updatedAt: "2026-09-14T00:00:00.000Z",
  };
  assert.throws(() => applyVerifiedPaymentEvent(attempt, {
    eventId: "event-forged",
    orderId: "order-001",
    provider: "sandbox_gateway",
    merchantReference: "merchant-001",
    providerTransactionId: "txn-001",
    amount: 57000,
    currency: "VND",
    status: "paid",
    occurredAt: "2026-09-14T00:01:00.000Z",
    signatureVerified: false,
  }), /chữ ký/i);
  assert.throws(() => applyVerifiedPaymentEvent(attempt, {
    eventId: "event-wrong-amount",
    orderId: "order-001",
    provider: "sandbox_gateway",
    merchantReference: "merchant-001",
    providerTransactionId: "txn-001",
    amount: 1,
    currency: "VND",
    status: "paid",
    occurredAt: "2026-09-14T00:01:00.000Z",
    signatureVerified: true,
  }), /số tiền/i);
  assert.throws(() => applyVerifiedPaymentEvent(attempt, {
    eventId: "event-wrong-transaction",
    orderId: "order-001",
    provider: "sandbox_gateway",
    merchantReference: "merchant-001",
    providerTransactionId: "txn-khong-khop",
    amount: 57000,
    currency: "VND",
    status: "paid",
    occurredAt: "2026-09-14T00:01:00.000Z",
    signatureVerified: true,
  }), /giao dịch/i);
});

test("online payment foundation applies a valid webhook once and exposes retryable terminal states", () => {
  const attempt = {
    id: "attempt-002",
    orderId: "order-002",
    provider: "sandbox_gateway",
    merchantReference: "merchant-002",
    providerTransactionId: "txn-002",
    amount: 64000,
    currency: "VND",
    status: "pending",
    processedEventIds: [],
    updatedAt: "2026-09-14T00:00:00.000Z",
  };
  const event = {
    eventId: "event-paid-002",
    orderId: "order-002",
    provider: "sandbox_gateway",
    merchantReference: "merchant-002",
    providerTransactionId: "txn-002",
    amount: 64000,
    currency: "VND",
    status: "paid",
    occurredAt: "2026-09-14T00:02:00.000Z",
    signatureVerified: true,
  };
  const first = applyVerifiedPaymentEvent(attempt, event);
  assert.equal(first.duplicate, false);
  assert.equal(first.attempt.status, "paid");
  const duplicate = applyVerifiedPaymentEvent(first.attempt, event);
  assert.equal(duplicate.duplicate, true);
  assert.equal(duplicate.attempt.processedEventIds.length, 1);
  assert.equal(canRetryPayment("pending"), false);
  for (const status of ["failed", "cancelled", "expired"]) {
    const terminal = applyVerifiedPaymentEvent({ ...attempt, status: "pending", processedEventIds: [] }, {
      ...event,
      eventId: `event-${status}`,
      status,
    });
    assert.equal(terminal.attempt.status, status);
    assert.equal(canRetryPayment(status), true);
  }
  assert.equal(canRetryPayment("paid"), false);
});

test("browser redirect data cannot mark a pending payment as paid", () => {
  const attempt = {
    id: "attempt-redirect",
    orderId: "order-redirect",
    provider: "sandbox_gateway",
    merchantReference: "merchant-redirect",
    providerTransactionId: "txn-redirect",
    amount: 72000,
    currency: "VND",
    status: "pending",
    processedEventIds: [],
    updatedAt: "2026-09-14T00:00:00.000Z",
  };
  assert.throws(() => applyVerifiedPaymentEvent(attempt, {
    eventId: "fake-browser-redirect",
    orderId: attempt.orderId,
    provider: attempt.provider,
    merchantReference: attempt.merchantReference,
    providerTransactionId: attempt.providerTransactionId,
    amount: attempt.amount,
    currency: attempt.currency,
    status: "paid",
    occurredAt: "2026-09-14T00:03:00.000Z",
    signatureVerified: false,
  }), /chữ ký/i);
  assert.equal(attempt.status, "pending");
});
