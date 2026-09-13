"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FeedbackRecord } from "../../server/engagement/engagement-service";
import type { AdminRole } from "../../server/auth/admin-auth";
import { AdminApiError, adminFetch, formatAdminDate } from "../admin-client";

const labels = { new: "Mới", in_progress: "Đang xử lý", resolved: "Đã xử lý" } as const;

export function AdminFeedback({ role }: { role: AdminRole }) {
  const [items, setItems] = useState<FeedbackRecord[]>([]);
  const [filter, setFilter] = useState<"" | FeedbackRecord["status"]>("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    try { const payload = await adminFetch<{ feedback: FeedbackRecord[] }>("/api/admin/feedback"); setItems(payload.feedback); }
    catch (caught) { setError(caught instanceof AdminApiError ? caught.message : "Không thể tải phản hồi."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { window.queueMicrotask(() => void load()); }, [load]);
  const filtered = useMemo(() => items.filter((item) => !filter || item.status === filter), [filter, items]);
  const selected = items.find((item) => item.id === selectedId) ?? filtered[0] ?? null;

  async function setStatus(item: FeedbackRecord, status: FeedbackRecord["status"]) {
    setSaving(true); setError("");
    try { const payload = await adminFetch<{ feedback: FeedbackRecord }>(`/api/admin/feedback/${encodeURIComponent(item.id)}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status }) }); setItems((current) => current.map((entry) => entry.id === item.id ? payload.feedback : entry)); }
    catch (caught) { setError(caught instanceof AdminApiError ? caught.message : "Không thể cập nhật phản hồi."); }
    finally { setSaving(false); }
  }

  return <>
    <header className="admin-page-header"><div><h1>Hộp thư phản hồi</h1><p>Thông tin liên hệ chỉ hiển thị trong khu vực quản trị được bảo vệ.</p></div><span className="admin-result-count">{items.length} phản hồi</span></header>
    <label className="admin-compact-filter">Trạng thái<select value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)}><option value="">Tất cả</option><option value="new">Mới</option><option value="in_progress">Đang xử lý</option><option value="resolved">Đã xử lý</option></select></label>
    {error && <div className="admin-inline-error" role="alert">{error}<button type="button" onClick={() => setError("")}>Đóng</button></div>}
    {loading ? <div className="admin-state" role="status">Đang tải phản hồi…</div> : filtered.length === 0 ? <div className="admin-state admin-empty-state"><h2>Chưa có phản hồi phù hợp</h2><p>Đổi bộ lọc để xem các trạng thái khác.</p></div> : <div className="admin-inbox-layout"><div className="admin-inbox-list">{filtered.map((item) => <button key={item.id} type="button" className={selected?.id === item.id ? "is-selected" : ""} onClick={() => setSelectedId(item.id)}><span><strong>{item.subject}</strong><small>{item.fullName}</small></span><span className={`admin-status feedback-${item.status}`}>{labels[item.status]}</span><time dateTime={item.createdAt}>{formatAdminDate(item.createdAt)}</time></button>)}</div>{selected && <article className="admin-message-detail"><header><div><h2>{selected.subject}</h2><p>{selected.fullName} · <a href={selected.contact.includes("@") ? `mailto:${selected.contact}` : `tel:${selected.contact}`}>{selected.contact}</a></p></div><span className={`admin-status feedback-${selected.status}`}>{labels[selected.status]}</span></header><p className="admin-message-body">{selected.message}</p><time dateTime={selected.createdAt}>Gửi lúc {formatAdminDate(selected.createdAt)}</time>{role === "admin" && <div className="admin-message-actions"><button type="button" disabled={saving || selected.status === "in_progress"} onClick={() => void setStatus(selected, "in_progress")}>Đang xử lý</button><button className="admin-filter-button" type="button" disabled={saving || selected.status === "resolved"} onClick={() => void setStatus(selected, "resolved")}>Đánh dấu đã xử lý</button></div>}</article>}</div>}
  </>;
}
