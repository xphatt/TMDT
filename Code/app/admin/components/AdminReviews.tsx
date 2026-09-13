"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReviewRecord } from "../../server/engagement/engagement-service";
import type { AdminRole } from "../../server/auth/admin-auth";
import { AdminApiError, adminFetch, formatAdminDate } from "../admin-client";

export function AdminReviews({ role }: { role: AdminRole }) {
  const [items, setItems] = useState<ReviewRecord[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"" | ReviewRecord["status"]>("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    try { const payload = await adminFetch<{ reviews: ReviewRecord[] }>("/api/admin/reviews"); setItems(payload.reviews); }
    catch (caught) { setError(caught instanceof AdminApiError ? caught.message : "Không thể tải đánh giá."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { window.queueMicrotask(() => void load()); }, [load]);
  const filtered = useMemo(() => { const normalized = query.trim().toLocaleLowerCase("vi"); return items.filter((item) => (!status || item.status === status) && (!normalized || `${item.reviewerName} ${item.comment} ${item.productId}`.toLocaleLowerCase("vi").includes(normalized))); }, [items, query, status]);

  async function changeStatus(item: ReviewRecord) {
    setSavingId(item.id); setError("");
    try { const payload = await adminFetch<{ review: ReviewRecord }>(`/api/admin/reviews/${encodeURIComponent(item.id)}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status: item.status === "visible" ? "hidden" : "visible" }) }); setItems((current) => current.map((entry) => entry.id === item.id ? payload.review : entry)); }
    catch (caught) { setError(caught instanceof AdminApiError ? caught.message : "Không thể cập nhật đánh giá."); }
    finally { setSavingId(""); }
  }

  async function remove(item: ReviewRecord) {
    if (!window.confirm(`Xóa vĩnh viễn đánh giá của “${item.reviewerName}”?`)) return;
    setSavingId(item.id); setError("");
    try { await adminFetch(`/api/admin/reviews/${encodeURIComponent(item.id)}`, { method: "DELETE" }); setItems((current) => current.filter((entry) => entry.id !== item.id)); }
    catch (caught) { setError(caught instanceof AdminApiError ? caught.message : "Không thể xóa đánh giá."); }
    finally { setSavingId(""); }
  }

  return <>
    <header className="admin-page-header"><div><h1>Đánh giá sản phẩm</h1><p>Đọc, ẩn hoặc xóa nội dung vi phạm mà không thay đổi điểm của nội dung khác.</p></div><span className="admin-result-count">{items.length} đánh giá</span></header>
    <div className="admin-review-tools"><label>Tìm nội dung<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} /></label><label>Trạng thái<select value={status} onChange={(event) => setStatus(event.target.value as typeof status)}><option value="">Tất cả</option><option value="visible">Đang hiển thị</option><option value="hidden">Đã ẩn</option></select></label></div>
    {error && <div className="admin-inline-error" role="alert">{error}<button type="button" onClick={() => setError("")}>Đóng</button></div>}
    {loading ? <div className="admin-state" role="status">Đang tải đánh giá…</div> : filtered.length === 0 ? <div className="admin-state admin-empty-state"><h2>Chưa có đánh giá phù hợp</h2></div> : <div className="admin-review-ledger">{filtered.map((item) => <article key={item.id}><header><div><strong>{item.reviewerName}</strong><span>{item.rating}/5 sao · {item.productId}</span></div><span className={`admin-status review-${item.status}`}>{item.status === "visible" ? "Đang hiển thị" : "Đã ẩn"}</span></header><p>{item.comment}</p><time dateTime={item.createdAt}>{formatAdminDate(item.createdAt)}</time>{role === "admin" && <div><button type="button" disabled={savingId === item.id} onClick={() => void changeStatus(item)}>{item.status === "visible" ? "Ẩn nội dung" : "Hiển thị lại"}</button><button type="button" disabled={savingId === item.id} onClick={() => void remove(item)}>Xóa</button></div>}</article>)}</div>}
  </>;
}
