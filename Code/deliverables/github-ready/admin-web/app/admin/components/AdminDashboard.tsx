"use client";
/* eslint-disable @next/next/no-html-link-for-pages -- Vinext client navigation is more stable with native anchors. */

import { FormEvent, useCallback, useEffect, useState } from "react";
import type { AdminDashboard as DashboardData } from "../../server/admin/admin-orders";
import { AdminApiError, adminFetch, formatAdminVnd } from "../admin-client";

export function AdminDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (search: string) => {
    try {
      const payload = await adminFetch<{ dashboard: DashboardData }>(`/api/admin/dashboard${search}`);
      setDashboard(payload.dashboard);
    } catch (caught) {
      setError(caught instanceof AdminApiError ? caught.message : "Không thể tải tổng quan.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Async HTTP synchronization; state updates happen after the awaited response.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(query); }, [load, query]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const nextQuery = params.size ? `?${params.toString()}` : "";
    setLoading(true);
    setError("");
    if (nextQuery === query) void load(nextQuery);
    else setQuery(nextQuery);
  }

  function retry() {
    setLoading(true);
    setError("");
    void load(query);
  }

  return (
    <>
      <header className="admin-page-header">
        <div><h1>Tình hình quầy</h1><p>Dữ liệu trực tiếp từ đơn hàng đã ghi trong D1.</p></div>
        <a className="admin-text-link" href="/admin/orders">Mở sổ đơn hàng</a>
      </header>
      <section className="admin-briefing" aria-labelledby="dashboard-status-title">
        <div className="admin-briefing-head">
          <div><h2 id="dashboard-status-title">Nhịp xử lý</h2><p>Lọc theo ngày tạo đơn, múi giờ hiển thị Việt Nam.</p></div>
          <form className="admin-date-filter" onSubmit={submit}>
            <label>Từ ngày<input type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></label>
            <label>Đến ngày<input type="date" value={to} min={from || undefined} onChange={(event) => setTo(event.target.value)} /></label>
            <button type="submit">Áp dụng</button>
          </form>
        </div>
        {loading && <div className="admin-state" role="status">Đang đọc sổ đơn hàng…</div>}
        {error && <div className="admin-state admin-state-error" role="alert"><p>{error}</p><button type="button" onClick={retry}>Thử lại</button></div>}
        {!loading && !error && dashboard && (
          <div className="admin-dashboard-grid">
            <div className="admin-total-block"><span>Tổng đơn trong kỳ</span><strong>{dashboard.totalOrders}</strong><small>{dashboard.totalOrders === 0 ? "Chưa có đơn trong khoảng đã chọn" : "đơn đã được hệ thống ghi nhận"}</small></div>
            <dl className="admin-status-ledger">
              <div><dt>Chờ xác nhận</dt><dd>{dashboard.newOrders}</dd></div>
              <div><dt>Đang xử lý</dt><dd>{dashboard.processingOrders}</dd></div>
              <div><dt>Hoàn tất</dt><dd>{dashboard.completedOrders}</dd></div>
              <div><dt>Hủy / từ chối</dt><dd>{dashboard.cancelledOrders}</dd></div>
            </dl>
          </div>
        )}
      </section>
      {!loading && !error && dashboard && (
        <section className="admin-money-book" aria-labelledby="money-title">
          <div className="admin-money-intro"><h2 id="money-title">Sổ tiền</h2><p>QR hiện chỉ mô phỏng. Chỉ COD được admin xác nhận đã thu.</p></div>
          <dl>
            <div><dt>Giá trị đơn</dt><dd>{formatAdminVnd(dashboard.totalValue)}</dd></div>
            <div><dt>Đã thu COD</dt><dd>{formatAdminVnd(dashboard.amountPaid)}</dd></div>
            <div><dt>Còn phải thu</dt><dd>{formatAdminVnd(dashboard.amountOutstanding)}</dd></div>
          </dl>
          <div className="admin-method-count"><span>COD <strong>{dashboard.codOrders}</strong></span><span>QR mô phỏng <strong>{dashboard.mockQrOrders}</strong></span></div>
        </section>
      )}
    </>
  );
}
