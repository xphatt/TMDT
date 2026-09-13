import { getD1 } from "../../../db";
import type { D1Value } from "../runtime-env";
import type { AdminPrincipal } from "../auth/admin-auth";
import type { OrderStatus } from "../orders/order-types";
import type { PaymentStatus } from "../payments/payment-provider";

export type AdminDashboard = {
  totalOrders: number;
  newOrders: number;
  processingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalValue: number;
  amountPaid: number;
  amountOutstanding: number;
  codOrders: number;
  mockQrOrders: number;
};

export type AdminOrderSummary = {
  id: string;
  orderCode: string;
  customerName: string;
  phone: string;
  createdAt: string;
  totalAmount: number;
  amountPaid: number;
  amountOutstanding: number;
  paymentMethod: "cash" | "bank";
  paymentProvider: "cash_on_delivery" | "mock_qr";
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  version: number;
};

export type AdminOrderList = {
  items: AdminOrderSummary[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type AdminOrderDetail = AdminOrderSummary & {
  customer: {
    name: string;
    phone: string;
    email: string | null;
    address: string;
    note: string;
  };
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    unitPrice: number;
    size: string;
    sugar: string;
    ice: string;
    quantity: number;
    lineTotal: number;
    toppings: Array<{ id: string; name: string; unitPrice: number }>;
  }>;
  payment: {
    method: "cash" | "bank";
    provider: "cash_on_delivery" | "mock_qr";
    status: PaymentStatus;
    amountDue: number;
    amountPaid: number;
    amountOutstanding: number;
    transactionReference: string | null;
    paidAt: string | null;
    message: string;
  };
  history: Array<{
    id: string;
    fromStatus: OrderStatus | null;
    toStatus: OrderStatus;
    actorName: string | null;
    reason: string | null;
    createdAt: string;
  }>;
  audit: Array<{
    id: string;
    actorName: string | null;
    action: string;
    before: Record<string, unknown> | null;
    after: Record<string, unknown> | null;
    createdAt: string;
  }>;
};

export type OrderListQuery = {
  page: number;
  pageSize: number;
  query: string;
  orderStatus: OrderStatus | null;
  paymentStatus: PaymentStatus | null;
  paymentMethod: "cash" | "bank" | null;
  from: string | null;
  to: string | null;
  sort: "created-desc" | "created-asc" | "total-desc" | "total-asc";
};

export class AdminOrderError extends Error {
  constructor(
    public readonly code: "invalid_query" | "order_not_found" | "invalid_transition" | "conflict" | "payment_not_allowed",
    message: string,
    public readonly status: number,
    public readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "AdminOrderError";
  }
}

type SummaryRow = {
  id: string;
  order_code: string;
  customer_name: string;
  phone: string;
  created_at: string;
  total_amount: number;
  amount_paid: number;
  amount_due: number;
  payment_method: "cash" | "bank";
  provider: "cash_on_delivery" | "mock_qr";
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  version: number;
};

type DetailRow = SummaryRow & {
  email: string | null;
  delivery_address: string;
  note: string;
  subtotal: number;
  discount_amount: number;
  shipping_fee: number;
  transaction_reference: string | null;
  paid_at: string | null;
  payment_message: string;
};

type ItemRow = {
  id: string;
  product_id: string;
  product_name: string;
  unit_price: number;
  size: string;
  sugar: string;
  ice: string;
  quantity: number;
  line_total: number;
};

type ToppingRow = {
  order_item_id: string;
  topping_id: string;
  topping_name: string;
  unit_price: number;
};

type HistoryRow = {
  id: string;
  from_status: OrderStatus | null;
  to_status: OrderStatus;
  actor_name: string | null;
  reason: string | null;
  created_at: string;
};

type AuditRow = {
  id: string;
  actor_name: string | null;
  action: string;
  before_json: string | null;
  after_json: string | null;
  created_at: string;
};

type DashboardRow = {
  total_orders: number;
  new_orders: number;
  processing_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  total_value: number;
  amount_paid: number;
  amount_outstanding: number;
  cod_orders: number;
  mock_qr_orders: number;
};

const orderStatuses = new Set<OrderStatus>([
  "pending", "confirmed", "preparing", "delivering", "completed", "cancelled", "rejected",
]);
const paymentStatuses = new Set<PaymentStatus>(["unpaid", "simulation_only", "paid"]);
const paymentMethods = new Set(["cash", "bank"] as const);
const sortColumns: Record<OrderListQuery["sort"], string> = {
  "created-desc": "o.created_at DESC",
  "created-asc": "o.created_at ASC",
  "total-desc": "o.total_amount DESC",
  "total-asc": "o.total_amount ASC",
};

const allowedTransitions: Record<OrderStatus, ReadonlySet<OrderStatus>> = {
  pending: new Set(["confirmed", "cancelled", "rejected"]),
  confirmed: new Set(["preparing", "cancelled"]),
  preparing: new Set(["delivering", "cancelled"]),
  delivering: new Set(["completed", "cancelled"]),
  completed: new Set(),
  cancelled: new Set(),
  rejected: new Set(),
};

function dateBoundary(value: string | null, endOfDay: boolean): string | null {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(value)) {
    throw new AdminOrderError("invalid_query", "Khoảng ngày không hợp lệ.", 400, { date: "Dùng định dạng YYYY-MM-DD." });
  }
  const date = new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`);
  if (Number.isNaN(date.getTime())) {
    throw new AdminOrderError("invalid_query", "Khoảng ngày không hợp lệ.", 400, { date: "Ngày không tồn tại." });
  }
  return date.toISOString();
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/gu, (character) => `\\${character}`);
}

function toSummary(row: SummaryRow): AdminOrderSummary {
  return {
    id: row.id,
    orderCode: row.order_code,
    customerName: row.customer_name,
    phone: row.phone,
    createdAt: row.created_at,
    totalAmount: row.total_amount,
    amountPaid: row.amount_paid,
    amountOutstanding: Math.max(0, row.amount_due - row.amount_paid),
    paymentMethod: row.payment_method,
    paymentProvider: row.provider,
    paymentStatus: row.payment_status,
    orderStatus: row.order_status,
    version: row.version,
  };
}

function parseJsonRecord(value: string | null): Record<string, unknown> | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : null;
  } catch {
    return null;
  }
}

function maskReference(value: string | null): string | null {
  if (!value) return null;
  if (value.length <= 8) return "••••";
  return `${value.slice(0, 4)}••••${value.slice(-4)}`;
}

export function parseOrderListQuery(url: URL): OrderListQuery {
  const page = Number(url.searchParams.get("page") ?? 1);
  const pageSize = Number(url.searchParams.get("pageSize") ?? 20);
  const query = (url.searchParams.get("q") ?? "").trim().slice(0, 100);
  const rawStatus = url.searchParams.get("status");
  const rawPaymentStatus = url.searchParams.get("paymentStatus");
  const rawMethod = url.searchParams.get("paymentMethod");
  const rawSort = url.searchParams.get("sort") ?? "created-desc";
  if (!Number.isInteger(page) || page < 1) {
    throw new AdminOrderError("invalid_query", "Trang không hợp lệ.", 400, { page: "Trang phải từ 1 trở lên." });
  }
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
    throw new AdminOrderError("invalid_query", "Số dòng mỗi trang không hợp lệ.", 400, { pageSize: "Chọn từ 1 đến 100 dòng." });
  }
  if (rawStatus && !orderStatuses.has(rawStatus as OrderStatus)) {
    throw new AdminOrderError("invalid_query", "Trạng thái đơn không hợp lệ.", 400);
  }
  if (rawPaymentStatus && !paymentStatuses.has(rawPaymentStatus as PaymentStatus)) {
    throw new AdminOrderError("invalid_query", "Trạng thái thanh toán không hợp lệ.", 400);
  }
  if (rawMethod && !paymentMethods.has(rawMethod as "cash" | "bank")) {
    throw new AdminOrderError("invalid_query", "Phương thức thanh toán không hợp lệ.", 400);
  }
  if (!(rawSort in sortColumns)) {
    throw new AdminOrderError("invalid_query", "Cách sắp xếp không hợp lệ.", 400);
  }
  return {
    page,
    pageSize,
    query,
    orderStatus: rawStatus as OrderStatus | null,
    paymentStatus: rawPaymentStatus as PaymentStatus | null,
    paymentMethod: rawMethod as "cash" | "bank" | null,
    from: dateBoundary(url.searchParams.get("from"), false),
    to: dateBoundary(url.searchParams.get("to"), true),
    sort: rawSort as OrderListQuery["sort"],
  };
}

export async function getAdminDashboard(from: string | null, to: string | null): Promise<AdminDashboard> {
  const fromDate = dateBoundary(from, false);
  const toDate = dateBoundary(to, true);
  const conditions: string[] = [];
  const bindings: D1Value[] = [];
  if (fromDate) { conditions.push("o.created_at >= ?"); bindings.push(fromDate); }
  if (toDate) { conditions.push("o.created_at <= ?"); bindings.push(toDate); }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const row = await getD1().prepare(
    `SELECT
      COUNT(*) AS total_orders,
      COALESCE(SUM(CASE WHEN o.order_status = 'pending' THEN 1 ELSE 0 END), 0) AS new_orders,
      COALESCE(SUM(CASE WHEN o.order_status IN ('confirmed','preparing','delivering') THEN 1 ELSE 0 END), 0) AS processing_orders,
      COALESCE(SUM(CASE WHEN o.order_status = 'completed' THEN 1 ELSE 0 END), 0) AS completed_orders,
      COALESCE(SUM(CASE WHEN o.order_status IN ('cancelled','rejected') THEN 1 ELSE 0 END), 0) AS cancelled_orders,
      COALESCE(SUM(o.total_amount), 0) AS total_value,
      COALESCE(SUM(p.amount_paid), 0) AS amount_paid,
      COALESCE(SUM(CASE WHEN p.amount_due > p.amount_paid THEN p.amount_due - p.amount_paid ELSE 0 END), 0) AS amount_outstanding,
      COALESCE(SUM(CASE WHEN p.payment_method = 'cash' THEN 1 ELSE 0 END), 0) AS cod_orders,
      COALESCE(SUM(CASE WHEN p.payment_method = 'bank' THEN 1 ELSE 0 END), 0) AS mock_qr_orders
     FROM orders o JOIN payments p ON p.order_id = o.id ${where}`,
  ).bind(...bindings).first<DashboardRow>();
  return {
    totalOrders: row?.total_orders ?? 0,
    newOrders: row?.new_orders ?? 0,
    processingOrders: row?.processing_orders ?? 0,
    completedOrders: row?.completed_orders ?? 0,
    cancelledOrders: row?.cancelled_orders ?? 0,
    totalValue: row?.total_value ?? 0,
    amountPaid: row?.amount_paid ?? 0,
    amountOutstanding: row?.amount_outstanding ?? 0,
    codOrders: row?.cod_orders ?? 0,
    mockQrOrders: row?.mock_qr_orders ?? 0,
  };
}

export async function listAdminOrders(query: OrderListQuery): Promise<AdminOrderList> {
  const conditions: string[] = [];
  const bindings: D1Value[] = [];
  if (query.query) {
    const pattern = `%${escapeLike(query.query)}%`;
    conditions.push("(o.order_code LIKE ? ESCAPE '\\' OR o.customer_name LIKE ? ESCAPE '\\' OR o.phone LIKE ? ESCAPE '\\')");
    bindings.push(pattern, pattern, pattern);
  }
  if (query.orderStatus) { conditions.push("o.order_status = ?"); bindings.push(query.orderStatus); }
  if (query.paymentStatus) { conditions.push("p.payment_status = ?"); bindings.push(query.paymentStatus); }
  if (query.paymentMethod) { conditions.push("p.payment_method = ?"); bindings.push(query.paymentMethod); }
  if (query.from) { conditions.push("o.created_at >= ?"); bindings.push(query.from); }
  if (query.to) { conditions.push("o.created_at <= ?"); bindings.push(query.to); }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const database = getD1();
  const countRow = await database.prepare(
    `SELECT COUNT(*) AS total FROM orders o JOIN payments p ON p.order_id = o.id ${where}`,
  ).bind(...bindings).first<{ total: number }>();
  const totalItems = countRow?.total ?? 0;
  const offset = (query.page - 1) * query.pageSize;
  const result = await database.prepare(
    `SELECT o.id, o.order_code, o.customer_name, o.phone, o.created_at, o.total_amount,
      o.order_status, o.version, p.amount_paid, p.amount_due, p.payment_method,
      p.provider, p.payment_status
     FROM orders o JOIN payments p ON p.order_id = o.id
     ${where} ORDER BY ${sortColumns[query.sort]} LIMIT ? OFFSET ?`,
  ).bind(...bindings, query.pageSize, offset).all<SummaryRow>();
  return {
    items: result.results.map(toSummary),
    page: query.page,
    pageSize: query.pageSize,
    totalItems,
    totalPages: Math.max(1, Math.ceil(totalItems / query.pageSize)),
  };
}

export async function getAdminOrderDetail(id: string): Promise<AdminOrderDetail> {
  const database = getD1();
  const row = await database.prepare(
    `SELECT o.id, o.order_code, o.customer_name, o.phone, o.email, o.delivery_address,
      o.note, o.subtotal, o.discount_amount, o.shipping_fee, o.total_amount,
      o.order_status, o.created_at, o.version, p.amount_paid, p.amount_due,
      p.payment_method, p.provider, p.payment_status, p.transaction_reference,
      p.paid_at, p.message AS payment_message
     FROM orders o JOIN payments p ON p.order_id = o.id WHERE o.id = ?`,
  ).bind(id).first<DetailRow>();
  if (!row) throw new AdminOrderError("order_not_found", "Không tìm thấy đơn hàng.", 404);

  const [itemResult, toppingResult, historyResult, auditResult] = await Promise.all([
    database.prepare(
      `SELECT id, product_id, product_name, unit_price, size, sugar, ice, quantity, line_total
       FROM order_items WHERE order_id = ? ORDER BY rowid ASC`,
    ).bind(id).all<ItemRow>(),
    database.prepare(
      `SELECT oit.order_item_id, oit.topping_id, oit.topping_name, oit.unit_price
       FROM order_item_toppings oit JOIN order_items oi ON oi.id = oit.order_item_id
       WHERE oi.order_id = ? ORDER BY oit.rowid ASC`,
    ).bind(id).all<ToppingRow>(),
    database.prepare(
      `SELECT h.id, h.from_status, h.to_status, u.display_name AS actor_name,
        h.reason, h.created_at
       FROM order_status_history h LEFT JOIN admin_users u ON u.id = h.actor_admin_id
       WHERE h.order_id = ? ORDER BY h.created_at DESC`,
    ).bind(id).all<HistoryRow>(),
    database.prepare(
      `SELECT a.id, u.display_name AS actor_name, a.action, a.before_json,
        a.after_json, a.created_at
       FROM admin_audit_logs a LEFT JOIN admin_users u ON u.id = a.admin_id
       WHERE a.entity_type = 'order' AND a.entity_id = ? ORDER BY a.created_at DESC LIMIT 50`,
    ).bind(id).all<AuditRow>(),
  ]);

  return {
    ...toSummary(row),
    customer: {
      name: row.customer_name,
      phone: row.phone,
      email: row.email,
      address: row.delivery_address,
      note: row.note,
    },
    subtotal: row.subtotal,
    discountAmount: row.discount_amount,
    shippingFee: row.shipping_fee,
    items: itemResult.results.map((item) => ({
      id: item.id,
      productId: item.product_id,
      productName: item.product_name,
      unitPrice: item.unit_price,
      size: item.size,
      sugar: item.sugar,
      ice: item.ice,
      quantity: item.quantity,
      lineTotal: item.line_total,
      toppings: toppingResult.results.filter((entry) => entry.order_item_id === item.id).map((entry) => ({
        id: entry.topping_id,
        name: entry.topping_name,
        unitPrice: entry.unit_price,
      })),
    })),
    payment: {
      method: row.payment_method,
      provider: row.provider,
      status: row.payment_status,
      amountDue: row.amount_due,
      amountPaid: row.amount_paid,
      amountOutstanding: Math.max(0, row.amount_due - row.amount_paid),
      transactionReference: maskReference(row.transaction_reference),
      paidAt: row.paid_at,
      message: row.payment_message,
    },
    history: historyResult.results.map((entry) => ({
      id: entry.id,
      fromStatus: entry.from_status,
      toStatus: entry.to_status,
      actorName: entry.actor_name,
      reason: entry.reason,
      createdAt: entry.created_at,
    })),
    audit: auditResult.results.map((entry) => ({
      id: entry.id,
      actorName: entry.actor_name,
      action: entry.action,
      before: parseJsonRecord(entry.before_json),
      after: parseJsonRecord(entry.after_json),
      createdAt: entry.created_at,
    })),
  };
}

type MutationContext = {
  admin: AdminPrincipal;
  requestId: string;
  networkFingerprint: string;
};

export async function transitionAdminOrder(
  id: string,
  toStatus: OrderStatus,
  reason: string,
  expectedVersion: number,
  context: MutationContext,
): Promise<AdminOrderDetail> {
  if (!orderStatuses.has(toStatus)) {
    throw new AdminOrderError("invalid_transition", "Trạng thái đích không hợp lệ.", 400);
  }
  const database = getD1();
  const current = await database.prepare(
    "SELECT order_status, version FROM orders WHERE id = ?",
  ).bind(id).first<{ order_status: OrderStatus; version: number }>();
  if (!current) throw new AdminOrderError("order_not_found", "Không tìm thấy đơn hàng.", 404);
  if (current.version !== expectedVersion) {
    throw new AdminOrderError("conflict", "Đơn hàng vừa được cập nhật ở nơi khác. Hãy tải lại dữ liệu.", 409);
  }
  if (!allowedTransitions[current.order_status].has(toStatus)) {
    throw new AdminOrderError(
      "invalid_transition",
      `Không thể chuyển từ ${current.order_status} sang ${toStatus}.`,
      409,
    );
  }
  const safeReason = reason.trim().slice(0, 300);
  if ((toStatus === "cancelled" || toStatus === "rejected") && safeReason.length < 5) {
    throw new AdminOrderError("invalid_transition", "Cần ghi lý do hủy hoặc từ chối đơn.", 400, {
      reason: "Nhập lý do có ít nhất 5 ký tự.",
    });
  }
  const now = new Date().toISOString();
  const result = await database.batch([
    database.prepare(
      `UPDATE orders SET order_status = ?, updated_at = ?, version = version + 1
       WHERE id = ? AND version = ? AND order_status = ?`,
    ).bind(toStatus, now, id, expectedVersion, current.order_status),
    database.prepare(
      `INSERT INTO order_status_history (
        id, order_id, from_status, to_status, actor_admin_id, reason, created_at
      )
      SELECT ?, o.id, ?, ?, ?, ?, ?
      FROM orders o
      WHERE o.id = ? AND o.version = ? AND o.updated_at = ? AND o.order_status = ?`,
    ).bind(
      crypto.randomUUID(),
      current.order_status,
      toStatus,
      context.admin.id,
      safeReason || null,
      now,
      id,
      expectedVersion + 1,
      now,
      toStatus,
    ),
    database.prepare(
      `INSERT INTO admin_audit_logs (
        id, admin_id, action, entity_type, entity_id, before_json, after_json,
        request_id, network_fingerprint, created_at
      )
      SELECT ?, ?, 'order.status_changed', 'order', o.id, ?, ?, ?, ?, ?
      FROM orders o
      WHERE o.id = ? AND o.version = ? AND o.updated_at = ? AND o.order_status = ?`,
    ).bind(
      crypto.randomUUID(),
      context.admin.id,
      JSON.stringify({ orderStatus: current.order_status, version: current.version }),
      JSON.stringify({ orderStatus: toStatus, version: current.version + 1, reason: safeReason || null }),
      context.requestId,
      context.networkFingerprint,
      now,
      id,
      expectedVersion + 1,
      now,
      toStatus,
    ),
  ]);
  if (result.some((entry) => (entry.meta.changes ?? 0) !== 1)) {
    throw new AdminOrderError("conflict", "Đơn hàng vừa được cập nhật ở nơi khác. Hãy tải lại dữ liệu.", 409);
  }
  return getAdminOrderDetail(id);
}

export async function confirmCodPayment(
  id: string,
  expectedVersion: number,
  note: string,
  context: MutationContext,
): Promise<AdminOrderDetail> {
  const database = getD1();
  const current = await database.prepare(
    `SELECT o.order_status, o.version, p.payment_method, p.payment_status,
      p.amount_due, p.amount_paid
     FROM orders o JOIN payments p ON p.order_id = o.id WHERE o.id = ?`,
  ).bind(id).first<{
    order_status: OrderStatus;
    version: number;
    payment_method: "cash" | "bank";
    payment_status: PaymentStatus;
    amount_due: number;
    amount_paid: number;
  }>();
  if (!current) throw new AdminOrderError("order_not_found", "Không tìm thấy đơn hàng.", 404);
  if (current.version !== expectedVersion) {
    throw new AdminOrderError("conflict", "Đơn hàng vừa được cập nhật ở nơi khác. Hãy tải lại dữ liệu.", 409);
  }
  if (current.payment_method !== "cash") {
    throw new AdminOrderError("payment_not_allowed", "Chỉ đơn COD mới có thể xác nhận đã thu tiền.", 409);
  }
  if (!new Set<OrderStatus>(["delivering", "completed"]).has(current.order_status)) {
    throw new AdminOrderError(
      "payment_not_allowed",
      "Chỉ xác nhận COD khi đơn đang giao hoặc đã hoàn tất.",
      409,
    );
  }
  if (current.payment_status === "paid") return getAdminOrderDetail(id);
  const safeNote = note.trim().slice(0, 300);
  const now = new Date().toISOString();
  const result = await database.batch([
    database.prepare(
      `UPDATE payments SET payment_status = 'paid', amount_paid = amount_due,
        paid_at = ?, updated_at = ?, message = ?
       WHERE order_id = ? AND payment_method = 'cash' AND payment_status = 'unpaid'
         AND EXISTS (
           SELECT 1 FROM orders o
           WHERE o.id = ? AND o.version = ? AND o.order_status IN ('delivering', 'completed')
         )`,
    ).bind(now, now, "COD đã được quản trị viên xác nhận thu đủ.", id, id, expectedVersion),
    database.prepare(
      `UPDATE orders SET updated_at = ?, version = version + 1
       WHERE id = ? AND version = ? AND order_status IN ('delivering', 'completed')
         AND EXISTS (
           SELECT 1 FROM payments p
           WHERE p.order_id = orders.id AND p.payment_status = 'paid' AND p.paid_at = ?
         )`,
    ).bind(now, id, expectedVersion, now),
    database.prepare(
      `INSERT INTO admin_audit_logs (
        id, admin_id, action, entity_type, entity_id, before_json, after_json,
        request_id, network_fingerprint, created_at
      )
      SELECT ?, ?, 'order.cod_confirmed', 'order', o.id, ?, ?, ?, ?, ?
      FROM orders o JOIN payments p ON p.order_id = o.id
      WHERE o.id = ? AND o.version = ? AND o.updated_at = ?
        AND p.payment_status = 'paid' AND p.paid_at = ?`,
    ).bind(
      crypto.randomUUID(),
      context.admin.id,
      JSON.stringify({ paymentStatus: current.payment_status, amountPaid: current.amount_paid }),
      JSON.stringify({ paymentStatus: "paid", amountPaid: current.amount_due, note: safeNote || null }),
      context.requestId,
      context.networkFingerprint,
      now,
      id,
      expectedVersion + 1,
      now,
      now,
    ),
  ]);
  if (result.some((entry) => (entry.meta.changes ?? 0) !== 1)) {
    throw new AdminOrderError("conflict", "Thanh toán vừa được cập nhật ở nơi khác. Hãy tải lại dữ liệu.", 409);
  }
  return getAdminOrderDetail(id);
}

export function adminOrderErrorResponse(error: unknown): Response {
  if (error instanceof AdminOrderError) {
    return Response.json(
      { error: { code: error.code, message: error.message, fields: error.fields } },
      { status: error.status, headers: { "cache-control": "no-store" } },
    );
  }
  return Response.json(
    { error: { code: "admin_order_failed", message: "Không thể xử lý dữ liệu đơn hàng lúc này." } },
    { status: 500, headers: { "cache-control": "no-store" } },
  );
}

export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === "string" && orderStatuses.has(value as OrderStatus);
}
