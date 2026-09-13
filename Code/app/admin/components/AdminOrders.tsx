"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import type { AdminOrderList } from "../../server/admin/admin-orders";
import type { OrderStatus } from "../../server/orders/order-types";
import type { PaymentStatus } from "../../server/payments/payment-provider";
import {
  AdminApiError,
  adminFetch,
  formatAdminDate,
  formatAdminVnd,
  orderStatusLabels,
  paymentStatusLabels,
} from "../admin-client";

type Filters = {
  q: string;
  status: "" | OrderStatus;
  paymentStatus: "" | PaymentStatus;
  paymentMethod: "" | "cash" | "bank";
  sort: "created-desc" | "created-asc" | "total-desc" | "total-asc";
};

const initialFilters: Filters = { q: "", status: "", paymentStatus: "", paymentMethod: "", sort: "created-desc" };

export function AdminOrders() {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [applied, setApplied] = useState<Filters>(initialFilters);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AdminOrderList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const params = new URLSearchParams({ page: String(page), pageSize: "20", sort: applied.sort });
    if (applied.q) params.set("q", applied.q);
    if (applied.status) params.set("status", applied.status);
    if (applied.paymentStatus) params.set("paymentStatus", applied.paymentStatus);
    if (applied.paymentMethod) params.set("paymentMethod", applied.paymentMethod);
    try {
      const payload = await adminFetch<{ orders: AdminOrderList }>(`/api/admin/orders?${params.toString()}`);
      setData(payload.orders);
      window.history.replaceState(null, "", `/admin/orders?${params.toString()}`);
    } catch (caught) {
      setError(caught instanceof AdminApiError ? caught.message : "Không thể tải danh sách đơn.");
    } finally {
      setLoading(false);
    }
  }, [applied, page]);

  // Async HTTP synchronization; state updates happen after the awaited response.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, [load]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextApplied = { ...filters, q: filters.q.trim() };
    setLoading(true);
    setError("");
    if (page === 1 && JSON.stringify(nextApplied) === JSON.stringify(applied)) void load();
    else {
      setPage(1);
      setApplied(nextApplied);
    }
  }

  function clearFilters() {
    setLoading(true);
    setError("");
    setFilters(initialFilters);
    if (page === 1 && JSON.stringify(applied) === JSON.stringify(initialFilters)) void load();
    else {
      setApplied(initialFilters);
      setPage(1);
    }
  }

  function retry() {
    setLoading(true);
    setError("");
    void load();
  }

  function changePage(updater: (current: number) => number) {
    setLoading(true);
    setError("");
    setPage(updater);
  }

  return (
    <>
      <header className="admin-page-header">
        <div><h1>Sổ đơn hàng</h1><p>Tìm, lọc và xử lý theo đúng vòng đời đã duyệt.</p></div>
        {data && <span className="admin-result-count">{data.totalItems} đơn</span>}
      </header>
      <form className="admin-order-tools" onSubmit={submit}>
        <label className="admin-search-field">Tìm đơn<input type="search" value={filters.q} onChange={(event) => setFilters({ ...filters, q: event.target.value })} placeholder="Mã đơn, khách hàng hoặc số điện thoại" /></label>
        <label>Trạng thái đơn<select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value as Filters["status"] })}><option value="">Tất cả</option>{Object.entries(orderStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label>Thanh toán<select value={filters.paymentStatus} onChange={(event) => setFilters({ ...filters, paymentStatus: event.target.value as Filters["paymentStatus"] })}><option value="">Tất cả</option>{Object.entries(paymentStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label>Phương thức<select value={filters.paymentMethod} onChange={(event) => setFilters({ ...filters, paymentMethod: event.target.value as Filters["paymentMethod"] })}><option value="">Tất cả</option><option value="cash">COD</option><option value="bank">QR mô phỏng</option></select></label>
        <label>Sắp xếp<select value={filters.sort} onChange={(event) => setFilters({ ...filters, sort: event.target.value as Filters["sort"] })}><option value="created-desc">Mới nhất</option><option value="created-asc">Cũ nhất</option><option value="total-desc">Giá cao trước</option><option value="total-asc">Giá thấp trước</option></select></label>
        <div className="admin-tool-actions"><button className="admin-filter-button" type="submit">Áp dụng</button><button type="button" onClick={clearFilters}>Xóa lọc</button></div>
      </form>
      {loading && <div className="admin-state" role="status">Đang tải danh sách đơn…</div>}
      {error && <div className="admin-state admin-state-error" role="alert"><p>{error}</p><button type="button" onClick={retry}>Thử lại</button></div>}
      {!loading && !error && data && data.items.length === 0 && (
        <div className="admin-state admin-empty-state"><span aria-hidden="true" /><h2>Không tìm thấy đơn phù hợp</h2><p>Thử xóa bớt bộ lọc hoặc kiểm tra lại từ khóa.</p><button type="button" onClick={clearFilters}>Xem toàn bộ đơn</button></div>
      )}
      {!loading && !error && data && data.items.length > 0 && (
        <>
          <div className="admin-table-wrap">
            <table className="admin-orders-table">
              <thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Thời gian</th><th>Tổng tiền</th><th>Đã thu</th><th>Thanh toán</th><th>Trạng thái</th><th><span className="visually-hidden">Thao tác</span></th></tr></thead>
              <tbody>{data.items.map((order) => (
                <tr key={order.id}>
                  <td data-label="Mã đơn"><strong>{order.orderCode}</strong></td>
                  <td data-label="Khách hàng"><strong>{order.customerName}</strong><small>{order.phone}</small></td>
                  <td data-label="Thời gian">{formatAdminDate(order.createdAt)}</td>
                  <td data-label="Tổng tiền" className="admin-money-cell">{formatAdminVnd(order.totalAmount)}</td>
                  <td data-label="Đã thu">{formatAdminVnd(order.amountPaid)}</td>
                  <td data-label="Thanh toán"><span className={`admin-status admin-payment-${order.paymentStatus}`}>{paymentStatusLabels[order.paymentStatus]}</span><small>{order.paymentMethod === "cash" ? "COD" : "QR mô phỏng"}</small></td>
                  <td data-label="Trạng thái"><span className={`admin-status admin-order-${order.orderStatus}`}>{orderStatusLabels[order.orderStatus]}</span></td>
                  <td data-label="Thao tác"><a className="admin-row-action" href={`/admin/orders/${encodeURIComponent(order.id)}`}>Xem chi tiết</a></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <nav className="admin-pagination" aria-label="Phân trang đơn hàng">
            <button type="button" disabled={data.page <= 1} onClick={() => changePage((value) => Math.max(1, value - 1))}>Trang trước</button>
            <span>Trang <strong>{data.page}</strong> / {data.totalPages}</span>
            <button type="button" disabled={data.page >= data.totalPages} onClick={() => changePage((value) => value + 1)}>Trang sau</button>
          </nav>
        </>
      )}
    </>
  );
}
