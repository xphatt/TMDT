import { getD1 } from "../../../db";
import { calculateAverageRating, cleanText, validateFeedbackInput, validateReviewInput } from "../../domain/completion-rules";
import { getCatalogueSnapshot } from "../catalogue/catalogue-service";
import { CompletionError } from "../completion-error";

export type FeedbackRecord = {
  id: string; fullName: string; contact: string; subject: string; message: string;
  status: "new" | "in_progress" | "resolved"; createdAt: string; updatedAt: string;
};

export type ReviewRecord = {
  id: string; productId: string; reviewerName: string; rating: number; comment: string;
  status: "visible" | "hidden"; createdAt: string; updatedAt: string; owned?: boolean;
};

type FeedbackRow = { id: string; full_name: string; contact: string; subject: string; message: string; status: FeedbackRecord["status"]; created_at: string; updated_at: string };
type ReviewRow = { id: string; product_id: string; reviewer_name: string; rating: number; comment: string; owner_token_hash: string; status: ReviewRecord["status"]; created_at: string; updated_at: string };

function feedbackFromRow(row: FeedbackRow): FeedbackRecord {
  return { id: row.id, fullName: row.full_name, contact: row.contact, subject: row.subject, message: row.message, status: row.status, createdAt: row.created_at, updatedAt: row.updated_at };
}

function reviewFromRow(row: ReviewRow, ownerHash?: string): ReviewRecord {
  return { id: row.id, productId: row.product_id, reviewerName: row.reviewer_name, rating: row.rating, comment: row.comment, status: row.status, createdAt: row.created_at, updatedAt: row.updated_at, owned: Boolean(ownerHash && ownerHash === row.owner_token_hash) };
}

async function hashToken(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/gu, "-").replace(/\//gu, "_").replace(/=+$/gu, "");
}

export async function createFeedback(input: unknown): Promise<FeedbackRecord> {
  const validation = validateFeedbackInput(input);
  if (Object.keys(validation.errors).length) throw new CompletionError("invalid_feedback", "Phản hồi chưa hợp lệ.", 400, validation.errors);
  const database = getD1();
  const existing = await database.prepare("SELECT id, full_name, contact, subject, message, status, created_at, updated_at FROM feedback WHERE client_request_id = ?").bind(validation.value.clientRequestId).first<FeedbackRow>();
  if (existing) return feedbackFromRow(existing);
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  try {
    await database.prepare("INSERT INTO feedback (id, full_name, contact, subject, message, status, client_request_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'new', ?, ?, ?)").bind(
      id, validation.value.fullName, validation.value.contact, validation.value.subject, validation.value.message, validation.value.clientRequestId, now, now,
    ).run();
  } catch {
    const duplicate = await database.prepare("SELECT id, full_name, contact, subject, message, status, created_at, updated_at FROM feedback WHERE client_request_id = ?").bind(validation.value.clientRequestId).first<FeedbackRow>();
    if (duplicate) return feedbackFromRow(duplicate);
    throw new CompletionError("feedback_storage_failed", "Chưa thể lưu phản hồi lúc này.", 503);
  }
  return { id, fullName: validation.value.fullName, contact: validation.value.contact, subject: validation.value.subject, message: validation.value.message, status: "new", createdAt: now, updatedAt: now };
}

export async function listFeedback(): Promise<FeedbackRecord[]> {
  const rows = await getD1().prepare("SELECT id, full_name, contact, subject, message, status, created_at, updated_at FROM feedback ORDER BY created_at DESC LIMIT 200").all<FeedbackRow>();
  return rows.results.map(feedbackFromRow);
}

export async function updateFeedbackStatus(id: string, rawStatus: unknown): Promise<FeedbackRecord> {
  const status = cleanText(rawStatus, 30) as FeedbackRecord["status"];
  if (!new Set(["new", "in_progress", "resolved"]).has(status)) throw new CompletionError("invalid_feedback_status", "Trạng thái phản hồi không hợp lệ.", 400);
  const now = new Date().toISOString();
  const result = await getD1().prepare("UPDATE feedback SET status = ?, updated_at = ? WHERE id = ?").bind(status, now, id).run();
  if ((result.meta.changes ?? 0) !== 1) throw new CompletionError("feedback_not_found", "Không tìm thấy phản hồi.", 404);
  const row = await getD1().prepare("SELECT id, full_name, contact, subject, message, status, created_at, updated_at FROM feedback WHERE id = ?").bind(id).first<FeedbackRow>();
  if (!row) throw new CompletionError("feedback_not_found", "Không tìm thấy phản hồi.", 404);
  return feedbackFromRow(row);
}

export async function createReview(input: unknown): Promise<ReviewRecord> {
  const validation = validateReviewInput(input);
  if (Object.keys(validation.errors).length) throw new CompletionError("invalid_review", "Đánh giá chưa hợp lệ.", 400, validation.errors);
  const catalogue = await getCatalogueSnapshot();
  if (!catalogue.products.some((product) => product.id === validation.value.productId)) throw new CompletionError("product_not_found", "Sản phẩm không còn trong thực đơn.", 404);
  const database = getD1();
  const ownerHash = await hashToken(validation.value.ownerToken);
  const existing = await database.prepare("SELECT id, product_id, reviewer_name, rating, comment, owner_token_hash, status, created_at, updated_at FROM reviews WHERE client_request_id = ?").bind(validation.value.clientRequestId).first<ReviewRow>();
  if (existing) return reviewFromRow(existing, ownerHash);
  const ownerExisting = await database.prepare("SELECT id FROM reviews WHERE product_id = ? AND owner_token_hash = ?").bind(validation.value.productId, ownerHash).first<{ id: string }>();
  if (ownerExisting) throw new CompletionError("duplicate_review", "Bạn đã đánh giá sản phẩm này trên thiết bị hiện tại. Hãy sửa đánh giá cũ thay vì gửi thêm.", 409);
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  try {
    await database.prepare("INSERT INTO reviews (id, product_id, reviewer_name, rating, comment, owner_token_hash, status, client_request_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'visible', ?, ?, ?)").bind(
      id, validation.value.productId, validation.value.reviewerName, validation.value.rating, validation.value.comment, ownerHash, validation.value.clientRequestId, now, now,
    ).run();
  } catch {
    const duplicate = await database.prepare("SELECT id, product_id, reviewer_name, rating, comment, owner_token_hash, status, created_at, updated_at FROM reviews WHERE client_request_id = ?").bind(validation.value.clientRequestId).first<ReviewRow>();
    if (duplicate) return reviewFromRow(duplicate, ownerHash);
    const ownerDuplicate = await database.prepare("SELECT id FROM reviews WHERE product_id = ? AND owner_token_hash = ?").bind(validation.value.productId, ownerHash).first<{ id: string }>();
    if (ownerDuplicate) throw new CompletionError("duplicate_review", "Bạn đã đánh giá sản phẩm này trên thiết bị hiện tại.", 409);
    throw new CompletionError("review_storage_failed", "Chưa thể lưu đánh giá lúc này.", 503);
  }
  return { id, productId: validation.value.productId, reviewerName: validation.value.reviewerName, rating: validation.value.rating, comment: validation.value.comment, status: "visible", createdAt: now, updatedAt: now, owned: true };
}

export async function listReviews(productId: string, ownerToken = "") {
  const safeProductId = cleanText(productId, 80);
  if (!safeProductId) throw new CompletionError("invalid_product", "Thiếu mã sản phẩm.", 400);
  const ownerHash = ownerToken ? await hashToken(cleanText(ownerToken, 100)) : undefined;
  const rows = await getD1().prepare("SELECT id, product_id, reviewer_name, rating, comment, owner_token_hash, status, created_at, updated_at FROM reviews WHERE product_id = ? AND status = 'visible' ORDER BY created_at DESC LIMIT 50").bind(safeProductId).all<ReviewRow>();
  const items = rows.results.map((row) => reviewFromRow(row, ownerHash));
  return { items, average: calculateAverageRating(items.map((item) => item.rating)), total: items.length };
}

export async function updateOwnReview(id: string, input: unknown): Promise<ReviewRecord> {
  const value = input && typeof input === "object" ? input as Record<string, unknown> : {};
  const ownerToken = cleanText(value.ownerToken, 100);
  const reviewerName = cleanText(value.reviewerName, 80);
  const comment = cleanText(value.comment, 1000);
  const rating = Number(value.rating);
  const fields: Record<string, string> = {};
  if (!/^[a-zA-Z0-9_-]{16,100}$/u.test(ownerToken)) fields.ownerToken = "Mã sở hữu không hợp lệ.";
  if (reviewerName.length < 2) fields.reviewerName = "Nhập tên hiển thị có ít nhất 2 ký tự.";
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) fields.rating = "Chọn số sao từ 1 đến 5.";
  if (comment.length < 5) fields.comment = "Bình luận cần có ít nhất 5 ký tự.";
  if (Object.keys(fields).length) throw new CompletionError("invalid_review", "Đánh giá chưa hợp lệ.", 400, fields);
  const ownerHash = await hashToken(ownerToken);
  const now = new Date().toISOString();
  const result = await getD1().prepare("UPDATE reviews SET reviewer_name = ?, rating = ?, comment = ?, updated_at = ? WHERE id = ? AND owner_token_hash = ? AND status = 'visible'").bind(reviewerName, rating, comment, now, id, ownerHash).run();
  if ((result.meta.changes ?? 0) !== 1) throw new CompletionError("review_forbidden", "Bạn chỉ có thể sửa đánh giá được tạo trên thiết bị này.", 403);
  const row = await getD1().prepare("SELECT id, product_id, reviewer_name, rating, comment, owner_token_hash, status, created_at, updated_at FROM reviews WHERE id = ?").bind(id).first<ReviewRow>();
  if (!row) throw new CompletionError("review_not_found", "Không tìm thấy đánh giá.", 404);
  return reviewFromRow(row, ownerHash);
}

export async function deleteOwnReview(id: string, ownerTokenValue: unknown): Promise<void> {
  const ownerToken = cleanText(ownerTokenValue, 100);
  if (!/^[a-zA-Z0-9_-]{16,100}$/u.test(ownerToken)) throw new CompletionError("review_forbidden", "Mã sở hữu không hợp lệ.", 403);
  const result = await getD1().prepare("DELETE FROM reviews WHERE id = ? AND owner_token_hash = ?").bind(id, await hashToken(ownerToken)).run();
  if ((result.meta.changes ?? 0) !== 1) throw new CompletionError("review_forbidden", "Bạn chỉ có thể xóa đánh giá được tạo trên thiết bị này.", 403);
}

export async function listAdminReviews(): Promise<ReviewRecord[]> {
  const rows = await getD1().prepare("SELECT id, product_id, reviewer_name, rating, comment, owner_token_hash, status, created_at, updated_at FROM reviews ORDER BY created_at DESC LIMIT 300").all<ReviewRow>();
  return rows.results.map((row) => reviewFromRow(row));
}

export async function setReviewStatus(id: string, rawStatus: unknown): Promise<ReviewRecord> {
  const status = cleanText(rawStatus, 20) as ReviewRecord["status"];
  if (status !== "visible" && status !== "hidden") throw new CompletionError("invalid_review_status", "Trạng thái đánh giá không hợp lệ.", 400);
  const result = await getD1().prepare("UPDATE reviews SET status = ?, updated_at = ? WHERE id = ?").bind(status, new Date().toISOString(), id).run();
  if ((result.meta.changes ?? 0) !== 1) throw new CompletionError("review_not_found", "Không tìm thấy đánh giá.", 404);
  const row = await getD1().prepare("SELECT id, product_id, reviewer_name, rating, comment, owner_token_hash, status, created_at, updated_at FROM reviews WHERE id = ?").bind(id).first<ReviewRow>();
  if (!row) throw new CompletionError("review_not_found", "Không tìm thấy đánh giá.", 404);
  return reviewFromRow(row);
}

export async function deleteAdminReview(id: string): Promise<void> {
  const result = await getD1().prepare("DELETE FROM reviews WHERE id = ?").bind(id).run();
  if ((result.meta.changes ?? 0) !== 1) throw new CompletionError("review_not_found", "Không tìm thấy đánh giá.", 404);
}
