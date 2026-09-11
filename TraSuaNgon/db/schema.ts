import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  orderCode: text("order_code").notNull(),
  customerId: text("customer_id"),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  deliveryAddress: text("delivery_address").notNull(),
  subtotal: integer("subtotal").notNull(),
  discountAmount: integer("discount_amount").notNull().default(0),
  shippingFee: integer("shipping_fee").notNull(),
  totalAmount: integer("total_amount").notNull(),
  orderStatus: text("order_status").notNull(),
  note: text("note").notNull().default(""),
  confirmedAt: text("confirmed_at"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  version: integer("version").notNull().default(1),
}, (table) => [
  uniqueIndex("idx_orders_order_code").on(table.orderCode),
  index("idx_orders_created_at").on(table.createdAt),
  index("idx_orders_status_created_at").on(table.orderStatus, table.createdAt),
  index("idx_orders_phone").on(table.phone),
]);

export const orderItems = sqliteTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull(),
  productName: text("product_name").notNull(),
  unitPrice: integer("unit_price").notNull(),
  size: text("size").notNull(),
  sugar: text("sugar").notNull(),
  ice: text("ice").notNull(),
  quantity: integer("quantity").notNull(),
  lineTotal: integer("line_total").notNull(),
}, (table) => [index("idx_order_items_order_id").on(table.orderId)]);

export const orderItemToppings = sqliteTable("order_item_toppings", {
  id: text("id").primaryKey(),
  orderItemId: text("order_item_id").notNull().references(() => orderItems.id, { onDelete: "cascade" }),
  toppingId: text("topping_id").notNull(),
  toppingName: text("topping_name").notNull(),
  unitPrice: integer("unit_price").notNull(),
}, (table) => [index("idx_order_item_toppings_item_id").on(table.orderItemId)]);

export const payments = sqliteTable("payments", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  paymentMethod: text("payment_method").notNull(),
  provider: text("provider").notNull(),
  paymentStatus: text("payment_status").notNull(),
  amountDue: integer("amount_due").notNull(),
  amountPaid: integer("amount_paid").notNull().default(0),
  transactionReference: text("transaction_reference"),
  message: text("message").notNull(),
  paidAt: text("paid_at"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [
  uniqueIndex("idx_payments_order_id").on(table.orderId),
  index("idx_payments_status_method").on(table.paymentStatus, table.paymentMethod),
]);

export const adminUsers = sqliteTable("admin_users", {
  id: text("id").primaryKey(),
  loginName: text("login_name").notNull(),
  displayName: text("display_name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  failedAttempts: integer("failed_attempts").notNull().default(0),
  lockedUntil: text("locked_until"),
  lastLoginAt: text("last_login_at"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [uniqueIndex("idx_admin_users_login_name").on(table.loginName)]);

export const adminSessions = sqliteTable("admin_sessions", {
  id: text("id").primaryKey(),
  tokenHash: text("token_hash").notNull(),
  csrfTokenHash: text("csrf_token_hash").notNull(),
  adminId: text("admin_id").notNull().references(() => adminUsers.id, { onDelete: "cascade" }),
  createdAt: text("created_at").notNull(),
  lastSeenAt: text("last_seen_at").notNull(),
  expiresAt: text("expires_at").notNull(),
  revokedAt: text("revoked_at"),
}, (table) => [
  uniqueIndex("idx_admin_sessions_token_hash").on(table.tokenHash),
  index("idx_admin_sessions_admin_id").on(table.adminId),
  index("idx_admin_sessions_expires_at").on(table.expiresAt),
]);

export const adminLoginAttempts = sqliteTable("admin_login_attempts", {
  keyHash: text("key_hash").primaryKey(),
  attemptCount: integer("attempt_count").notNull().default(0),
  windowStartedAt: text("window_started_at").notNull(),
  blockedUntil: text("blocked_until"),
  updatedAt: text("updated_at").notNull(),
}, (table) => [index("idx_admin_login_attempts_updated_at").on(table.updatedAt)]);

export const orderStatusHistory = sqliteTable("order_status_history", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  fromStatus: text("from_status"),
  toStatus: text("to_status").notNull(),
  actorAdminId: text("actor_admin_id").references(() => adminUsers.id, { onDelete: "set null" }),
  reason: text("reason"),
  createdAt: text("created_at").notNull(),
}, (table) => [
  index("idx_order_status_history_order_id").on(table.orderId),
  index("idx_order_status_history_created_at").on(table.createdAt),
]);

export const adminAuditLogs = sqliteTable("admin_audit_logs", {
  id: text("id").primaryKey(),
  adminId: text("admin_id").references(() => adminUsers.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  beforeJson: text("before_json"),
  afterJson: text("after_json"),
  requestId: text("request_id"),
  networkFingerprint: text("network_fingerprint"),
  createdAt: text("created_at").notNull(),
}, (table) => [
  index("idx_admin_audit_logs_entity").on(table.entityType, table.entityId),
  index("idx_admin_audit_logs_admin_id").on(table.adminId),
  index("idx_admin_audit_logs_created_at").on(table.createdAt),
]);
