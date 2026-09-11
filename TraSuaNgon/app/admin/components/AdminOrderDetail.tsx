"use client";
/* eslint-disable @next/next/no-html-link-for-pages -- Vinext client navigation is more stable with native anchors. */

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import type { AdminOrderDetail as OrderDetail } from "../../server/admin/admin-orders";
import type { AdminRole } from "../../server/auth/admin-auth";
import type { OrderStatus } from "../../server/orders/order-types";
import {
  AdminApiError,
  adminFetch,
  formatAdminDate,
  formatAdminVnd,
  orderStatusLabels,
  paymentStatusLabels,
} from "../admin-client";

const transitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled", "rejected"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["delivering", "cancelled"],
  delivering: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
  rejected: [],
};

type ConfirmAction =
  | { kind: "status"; toStatus: OrderStatus; reason: string }
  | { kind: "cod"; note: string };

export function AdminOrderDetail({ orderId, role }: { orderId: string; role: AdminRole }) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [toStatus, setToStatus] = useState<OrderStatus | "">("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const load = useCallback(async () => {
    try {
      const payload = await adminFetch<{ order: OrderDetail }>(`/api/admin/orders/${encodeURIComponent(orderId)}`);
      setOrder(payload.order);
      setToStatus("");
      setReason("");
    } catch (caught) {
      setError(caught instanceof AdminApiError ? caught.message : "Không thể tải chi tiết đơn.");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  // Async HTTP synchronization; state updates happen after the awaited response.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, [load]);

  function retry() {
    setLoading(true);
    setError("");
    void load();
  }

  function requestStatusChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!toStatus) return;
    setConfirmAction({ kind: "status", toStatus, reason });
    dialogRef.current?.showModal();
  }

  function requestCodConfirmation() {
    setConfirmAction({ kind: "cod", note: "Đã đối soát tiền mặt với người giao hàng." });
    dialogRef.current?.showModal();
  }

  async function confirmMutation() {
    if (!order || !confirmAction) return;
    setSaving(true);
    setError("");
    try {
      const endpoint = confirmAction.kind === "status"
        ? `/api/admin/orders/${encodeURIComponent(order.id)}/status`
        : `/api/admin/orders/${encodeURIComponent(order.id)}/payments/cod-confirmation`;
      const method = confirmAction.kind === "status" ? "PATCH" : "POST";
      const body = confirmAction.kind === "status"
        ? { toStatus: confirmAction.toStatus, reason: confirmAction.reason, expectedVersion: order.version }
        : { note: confirmAction.note, expectedVersion: order.version };
      const payload = await adminFetch<{ order: OrderDetail }>(endpoint, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      setOrder(payload.order);
      setToStatus("");
      setReason("");
      dialogRef.current?.close();
      setConfirmAction(null);
    } catch (caught) {
      const message = caught instanceof AdminApiError ? caught.message : "Không thể cập nhật đơn hàng.";
      setError(message);
      dialogRef.current?.close();
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="admin-state" role="status">Đang mở đơn hàng…</div>;
  if (error && !order) return <div className="admin-state admin-state-error" role="alert"><p>{error}</p><button type="button" onClick={retry}>Thử lại</button></div>;
  if (!order) return null;

  const nextStatuses = transitions[order.orderStatus];
  const canConfirmCod = role === "admin"
    && order.payment.method === "cash"
    && order.payment.status === "unpaid"
    && (order.orderStatus === "delivering" || order.orderStatus === "completed");

  return (
    <>
      <header className="admin-page-header admin-detail-header">
        <div><a className="admin-back-link" href="/admin/orders">Quay lại sổ đơn</a><h1>{order.orderCode}</h1><p>Đặt lúc {formatAdminDate(order.createdAt)}</p></div>
        <div className="admin-detail-statuses"><span className={`admin-status admin-order-${order.orderStatus}`}>{orderStatusLabels[order.orderStatus]}</span><span className={`admin-status admin-payment-${order.payment.status}`}>{paymentStatusLabels[order.payment.status]}</span></div>
      </header>
      {error && <div className="admin-inline-error" role="alert">{error}<button type="button" onClick={() => setError("")}>Đóng</button></div>}
      <div className="admin-detail-layout">
        <div className="admin-detail-primary">
          <section className="admin-detail-section" aria-labelledby="items-title">
            <div className="admin-section-heading"><h2 id="items-title">Món trong đơn</h2><span>{order.items.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm</span></div>
            <div className="admin-item-ledger">{order.items.map((item) => (
              <article key={item.id}>
                <div className="admin-item-quantity">{item.quantity}×</div>
                <div><h3>{item.productName}</h3><p>Size {item.size} · Đường {item.sugar} · {item.ice}</p>{item.toppings.length > 0 && <p>Thêm: {item.toppings.map((topping) => topping.name).join(", ")}</p>}</div>
                <strong>{formatAdminVnd(item.lineTotal)}</strong>
              </article>
            ))}</div>
          </section>
          <section className="admin-detail-section" aria-labelledby="history-title">
            <div className="admin-section-heading"><h2 id="history-title">Lịch sử xử lý</h2><span>{order.history.length} mốc</span></div>
            <ol className="admin-history">{order.history.map((entry) => (
              <li key={entry.id}><span aria-hidden="true" /><div><strong>{orderStatusLabels[entry.toStatus]}</strong><p>{entry.reason || "Cập nhật theo luồng hệ thống."}</p><small>{entry.actorName || "Storefront"} · {formatAdminDate(entry.createdAt)}</small></div></li>
            ))}</ol>
          </section>
          <section className="admin-detail-section" aria-labelledby="audit-title">
            <div className="admin-section-heading"><h2 id="audit-title">Nhật ký quản trị</h2><span>{order.audit.length} thao tác</span></div>
            {order.audit.length === 0 ? <p className="admin-muted">Chưa có thao tác quản trị trên đơn này.</p> : <ul className="admin-audit-list">{order.audit.map((entry) => (
              <li key={entry.id}><strong>{entry.action === "order.status_changed" ? "Đổi trạng thái đơn" : "Xác nhận thu COD"}</strong><span>{entry.actorName || "Tài khoản đã ngừng hoạt động"}</span><time dateTime={entry.createdAt}>{formatAdminDate(entry.createdAt)}</time></li>
            ))}</ul>}
          </section>
        </div>
        <aside className="admin-detail-aside">
          <section className="admin-detail-section" aria-labelledby="customer-title">
            <h2 id="customer-title">Giao cho</h2>
            <dl className="admin-info-list"><div><dt>Khách hàng</dt><dd>{order.customer.name}</dd></div><div><dt>Điện thoại</dt><dd><a href={`tel:${order.customer.phone}`}>{order.customer.phone}</a></dd></div><div><dt>Địa chỉ</dt><dd>{order.customer.address}</dd></div>{order.customer.note && <div><dt>Ghi chú</dt><dd>{order.customer.note}</dd></div>}</dl>
          </section>
          <section className="admin-detail-section admin-payment-section" aria-labelledby="payment-title">
            <h2 id="payment-title">Thanh toán</h2>
            <dl className="admin-total-list"><div><dt>Tạm tính</dt><dd>{formatAdminVnd(order.subtotal)}</dd></div><div><dt>Giảm giá</dt><dd>{formatAdminVnd(order.discountAmount)}</dd></div><div><dt>Phí giao hàng</dt><dd>{formatAdminVnd(order.shippingFee)}</dd></div><div className="is-total"><dt>Tổng cộng</dt><dd>{formatAdminVnd(order.totalAmount)}</dd></div><div><dt>Đã thanh toán</dt><dd>{formatAdminVnd(order.payment.amountPaid)}</dd></div><div className="is-due"><dt>Còn phải thu</dt><dd>{formatAdminVnd(order.payment.amountOutstanding)}</dd></div></dl>
            <p className="admin-payment-copy"><strong>{order.payment.method === "cash" ? "COD" : "QR mô phỏng"}</strong><span>{order.payment.message}</span>{order.payment.transactionReference && <span>Mã: {order.payment.transactionReference}</span>}</p>
            {canConfirmCod && <button className="admin-primary-button" type="button" onClick={requestCodConfirmation}>Xác nhận đã thu COD</button>}
          </section>
          <section className="admin-detail-section" aria-labelledby="action-title">
            <h2 id="action-title">Cập nhật xử lý</h2>
            {role !== "admin" ? <p className="admin-muted">Tài khoản của bạn chỉ có quyền xem.</p> : nextStatuses.length === 0 ? <p className="admin-muted">Đơn đã ở trạng thái kết thúc và không thể chuyển tiếp.</p> : (
              <form className="admin-status-form" onSubmit={requestStatusChange}>
                <label>Trạng thái tiếp theo<select value={toStatus} onChange={(event) => setToStatus(event.target.value as OrderStatus)} required><option value="">Chọn trạng thái</option>{nextStatuses.map((status) => <option key={status} value={status}>{orderStatusLabels[status]}</option>)}</select></label>
                <label>Lý do / ghi chú<textarea value={reason} onChange={(event) => setReason(event.target.value)} maxLength={300} rows={3} required={toStatus === "cancelled" || toStatus === "rejected"} placeholder={toStatus === "cancelled" || toStatus === "rejected" ? "Bắt buộc khi hủy hoặc từ chối" : "Không bắt buộc"} /></label>
                <button className="admin-secondary-button" type="submit" disabled={!toStatus}>Kiểm tra và cập nhật</button>
              </form>
            )}
          </section>
        </aside>
      </div>
      <dialog ref={dialogRef} className="admin-confirm-dialog" onClose={() => setConfirmAction(null)}>
        <div>
          <h2>{confirmAction?.kind === "cod" ? "Xác nhận đã thu đủ tiền COD?" : "Xác nhận đổi trạng thái đơn?"}</h2>
          <p>{confirmAction?.kind === "cod" ? "Hành động này ghi số tiền đã thu bằng tổng phải trả và lưu vào nhật ký quản trị." : confirmAction ? `Đơn sẽ chuyển sang “${orderStatusLabels[confirmAction.toStatus]}”. Thao tác được ghi lại trong lịch sử.` : ""}</p>
          <div className="admin-dialog-actions"><button type="button" onClick={() => dialogRef.current?.close()} disabled={saving}>Quay lại</button><button className="admin-primary-button" type="button" onClick={() => void confirmMutation()} disabled={saving}>{saving ? "Đang lưu…" : "Xác nhận thao tác"}</button></div>
        </div>
      </dialog>
    </>
  );
}
