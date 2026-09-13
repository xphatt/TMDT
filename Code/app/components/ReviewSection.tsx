"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";

type Review = { id: string; reviewerName: string; rating: number; comment: string; createdAt: string; owned?: boolean };
type ReviewSummary = { items: Review[]; average: number; total: number };

function StarIcon({ filled = true }: { filled?: boolean }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m12 2.8 2.85 5.78 6.38.93-4.62 4.5 1.09 6.35L12 17.37l-5.7 2.99 1.09-6.35-4.62-4.5 6.38-.93L12 2.8Z" fill={filled ? "currentColor" : "none"} /></svg>;
}

function getOwnerToken(): string {
  const key = "tra-sua-ngon:review-owner:v1";
  const existing = window.localStorage.getItem(key);
  if (existing && /^[a-zA-Z0-9_-]{16,100}$/u.test(existing)) return existing;
  const value = crypto.randomUUID();
  window.localStorage.setItem(key, value);
  return value;
}

export function ReviewSection({ productId }: { productId: string }) {
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [ownerToken, setOwnerToken] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [state, setState] = useState<"loading" | "idle" | "saving" | "error" | "success">("loading");
  const [message, setMessage] = useState("");
  const requestId = useRef(crypto.randomUUID());

  const load = useCallback(async (token: string) => {
    try {
      const response = await fetch(`/api/reviews?productId=${encodeURIComponent(productId)}`, { headers: { accept: "application/json", "x-review-owner": token } });
      const payload = await response.json() as { reviews?: ReviewSummary; error?: { message?: string } };
      if (!response.ok || !payload.reviews) throw new Error(payload.error?.message ?? "Không thể tải đánh giá.");
      setSummary(payload.reviews);
      setState("idle");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Không thể tải đánh giá lúc này.");
    }
  }, [productId]);

  useEffect(() => {
    window.queueMicrotask(() => {
      let token = "";
      try { token = getOwnerToken(); } catch { token = crypto.randomUUID(); }
      setOwnerToken(token);
      void load(token);
    });
  }, [load]);

  function resetForm() {
    setReviewerName(""); setRating(0); setComment(""); setEditingId(null); requestId.current = crypto.randomUUID();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "saving") return;
    if (reviewerName.trim().length < 2 || rating < 1 || rating > 5 || comment.trim().length < 5) {
      setState("error"); setMessage("Nhập tên, chọn từ 1 đến 5 sao và viết ít nhất 5 ký tự."); return;
    }
    setState("saving"); setMessage("");
    const response = await fetch(editingId ? `/api/reviews/${encodeURIComponent(editingId)}` : "/api/reviews", {
      method: editingId ? "PATCH" : "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ productId, reviewerName, rating, comment, ownerToken, clientRequestId: requestId.current }),
    });
    const payload = await response.json() as { error?: { message?: string } };
    if (!response.ok) { setState("error"); setMessage(payload.error?.message ?? "Chưa thể lưu đánh giá."); return; }
    resetForm();
    setState("success"); setMessage(editingId ? "Đã cập nhật đánh giá." : "Đánh giá đã được lưu.");
    await load(ownerToken);
  }

  function edit(review: Review) {
    setEditingId(review.id); setReviewerName(review.reviewerName); setRating(review.rating); setComment(review.comment); setState("idle"); setMessage("");
    document.getElementById("review-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function remove(review: Review) {
    if (!window.confirm("Xóa đánh giá này? Thao tác không thể hoàn tác.")) return;
    const response = await fetch(`/api/reviews/${encodeURIComponent(review.id)}`, { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ ownerToken }) });
    if (!response.ok) { const payload = await response.json() as { error?: { message?: string } }; setState("error"); setMessage(payload.error?.message ?? "Chưa thể xóa đánh giá."); return; }
    setState("success"); setMessage("Đã xóa đánh giá."); resetForm(); await load(ownerToken);
  }

  return (
    <section className="review-section" aria-labelledby="review-title">
      <header><div><h2 id="review-title">Đánh giá từ người dùng</h2><p>Chia sẻ trải nghiệm trên thiết bị này. Nội dung được lưu trong database local/test.</p></div><div className="review-score" aria-label={summary?.total ? `${summary.average} trên 5 sao từ ${summary.total} đánh giá` : "Chưa có đánh giá"}><strong>{summary?.total ? summary.average.toFixed(1) : "—"}</strong><span>{summary?.total ?? 0} lượt đánh giá</span></div></header>
      <div className="review-layout">
        <form id="review-form" className="review-form" onSubmit={submit} noValidate>
          <h3>{editingId ? "Sửa đánh giá của bạn" : "Viết đánh giá"}</h3>
          <label>Tên hiển thị<input value={reviewerName} maxLength={80} onChange={(event) => setReviewerName(event.target.value)} /></label>
          <fieldset><legend>Chấm điểm</legend><div className="star-choices">{[1,2,3,4,5].map((value) => <label key={value} className={rating === value ? "selected" : ""}><input type="radio" name={`rating-${productId}`} value={value} checked={rating === value} onChange={() => setRating(value)} /><StarIcon filled={rating >= value} /><span className="sr-only">{value} sao</span></label>)}</div></fieldset>
          <label>Bình luận<textarea value={comment} maxLength={1000} rows={4} onChange={(event) => setComment(event.target.value)} /></label>
          {message && <p className={`review-message state-${state}`} role={state === "error" ? "alert" : "status"}>{message}</p>}
          <div className="review-form-actions"><button className="button button-primary" type="submit" disabled={state === "saving"}>{state === "saving" ? "Đang lưu" : editingId ? "Lưu thay đổi" : "Gửi đánh giá"}</button>{editingId && <button className="button button-secondary" type="button" onClick={resetForm}>Hủy sửa</button>}</div>
        </form>
        <div className="review-list" aria-live="polite">
          {state === "loading" && <p>Đang tải đánh giá…</p>}
          {summary && summary.items.length === 0 && <div className="review-empty"><h3>Chưa có đánh giá</h3><p>Hãy là người đầu tiên chia sẻ cảm nhận về món này.</p></div>}
          {summary?.items.map((review) => <article key={review.id}><div><strong>{review.reviewerName}</strong><span className="review-stars" aria-label={`${review.rating} trên 5 sao`}>{[1,2,3,4,5].map((value) => <StarIcon key={value} filled={value <= review.rating} />)}</span></div><p>{review.comment}</p><time dateTime={review.createdAt}>{new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date(review.createdAt))}</time>{review.owned && <div className="review-owner-actions"><button type="button" onClick={() => edit(review)}>Sửa</button><button type="button" onClick={() => void remove(review)}>Xóa</button></div>}</article>)}
        </div>
      </div>
    </section>
  );
}
