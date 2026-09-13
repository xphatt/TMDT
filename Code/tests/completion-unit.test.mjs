import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateAverageRating,
  calculateOrderTotals,
  canManageCatalogue,
  effectiveProductPrice,
  isCheckoutDemoEnabled,
  isPromotionActive,
  validateFeedbackInput,
  validateReviewInput,
} from "../app/domain/completion-rules.ts";

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
