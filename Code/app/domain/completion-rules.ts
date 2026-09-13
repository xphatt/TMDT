export type PromotionRule = {
  salePrice: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
};

export type ValidationResult<T> = {
  value: T;
  errors: Record<string, string>;
};

export function cleanText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  const withoutControlCharacters = Array.from(value).filter((character) => {
    const code = character.codePointAt(0) ?? 0;
    return code === 9 || code === 10 || (code >= 32 && code !== 127);
  }).join("");
  return withoutControlCharacters
    .replace(/\r\n?/gu, "\n")
    .trim()
    .slice(0, maxLength);
}

export function normalizeSearchText(value: unknown): string {
  return cleanText(value, 5000)
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .replace(/[đĐ]/gu, "d")
    .toLocaleLowerCase("vi")
    .replace(/\s+/gu, " ");
}

export function validateFeedbackInput(value: unknown): ValidationResult<{
  fullName: string;
  contact: string;
  subject: string;
  message: string;
  clientRequestId: string;
}> {
  const input = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const result = {
    fullName: cleanText(input.fullName, 100),
    contact: cleanText(input.contact, 160),
    subject: cleanText(input.subject, 120),
    message: cleanText(input.message, 2000),
    clientRequestId: cleanText(input.clientRequestId, 100),
  };
  const errors: Record<string, string> = {};
  if (result.fullName.length < 2) errors.fullName = "Nhập họ tên có ít nhất 2 ký tự.";
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(result.contact);
  const normalizedPhone = result.contact.replace(/[\s.-]/gu, "");
  const isPhone = /^(0|\+84)(3|5|7|8|9)\d{8}$/u.test(normalizedPhone);
  if (!isEmail && !isPhone) errors.contact = "Nhập email hoặc số điện thoại Việt Nam hợp lệ.";
  if (result.subject.length < 3) errors.subject = "Nhập chủ đề có ít nhất 3 ký tự.";
  if (result.message.length < 10) errors.message = "Nội dung cần có ít nhất 10 ký tự.";
  if (!/^[a-zA-Z0-9_-]{8,100}$/u.test(result.clientRequestId)) errors.clientRequestId = "Mã gửi phản hồi không hợp lệ.";
  return { value: result, errors };
}

export function validateReviewInput(value: unknown): ValidationResult<{
  productId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  ownerToken: string;
  clientRequestId: string;
}> {
  const input = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const result = {
    productId: cleanText(input.productId, 80),
    reviewerName: cleanText(input.reviewerName, 80),
    rating: Number(input.rating),
    comment: cleanText(input.comment, 1000),
    ownerToken: cleanText(input.ownerToken, 100),
    clientRequestId: cleanText(input.clientRequestId, 100),
  };
  const errors: Record<string, string> = {};
  if (!/^[a-zA-Z0-9_-]{1,80}$/u.test(result.productId)) errors.productId = "Sản phẩm đánh giá không hợp lệ.";
  if (result.reviewerName.length < 2) errors.reviewerName = "Nhập tên hiển thị có ít nhất 2 ký tự.";
  if (!Number.isInteger(result.rating) || result.rating < 1 || result.rating > 5) errors.rating = "Chọn số sao từ 1 đến 5.";
  if (result.comment.length < 5) errors.comment = "Bình luận cần có ít nhất 5 ký tự.";
  if (!/^[a-zA-Z0-9_-]{16,100}$/u.test(result.ownerToken)) errors.ownerToken = "Mã sở hữu đánh giá không hợp lệ.";
  if (!/^[a-zA-Z0-9_-]{8,100}$/u.test(result.clientRequestId)) errors.clientRequestId = "Mã gửi đánh giá không hợp lệ.";
  return { value: result, errors };
}

export function isPromotionActive(promotion: PromotionRule, now = new Date()): boolean {
  if (!promotion.isActive || !Number.isFinite(promotion.salePrice) || promotion.salePrice <= 0) return false;
  const startsAt = Date.parse(promotion.startsAt);
  const endsAt = Date.parse(promotion.endsAt);
  const current = now.getTime();
  return Number.isFinite(startsAt) && Number.isFinite(endsAt) && startsAt <= current && current <= endsAt;
}

export function effectiveProductPrice(basePrice: number, promotion: PromotionRule | null, now = new Date()): number {
  if (!Number.isFinite(basePrice) || basePrice < 0) return 0;
  if (!promotion || !isPromotionActive(promotion, now) || promotion.salePrice >= basePrice) return Math.round(basePrice);
  return Math.round(promotion.salePrice);
}

export function calculateAverageRating(ratings: number[]): number {
  const valid = ratings.filter((rating) => Number.isInteger(rating) && rating >= 1 && rating <= 5);
  if (!valid.length) return 0;
  return Math.round((valid.reduce((sum, rating) => sum + rating, 0) / valid.length) * 10) / 10;
}

export function canManageCatalogue(role: string): boolean {
  return role === "admin";
}

export function calculateOrderTotals(lineTotals: number[], shippingFee: number, discountAmount = 0) {
  const subtotal = lineTotals.reduce((sum, value) => sum + (Number.isFinite(value) && value > 0 ? Math.round(value) : 0), 0);
  const safeShipping = Number.isFinite(shippingFee) && shippingFee >= 0 ? Math.round(shippingFee) : 0;
  const safeDiscount = Number.isFinite(discountAmount) && discountAmount > 0 ? Math.min(Math.round(discountAmount), subtotal) : 0;
  return { subtotal, discountAmount: safeDiscount, shippingFee: safeShipping, total: subtotal - safeDiscount + safeShipping };
}

export function isCheckoutDemoEnabled(options: {
  isProduction: boolean;
  demoMode?: string;
  scenario?: string;
}): boolean {
  return !options.isProduction && options.demoMode === "true" && options.scenario === "checkout_timeout";
}
