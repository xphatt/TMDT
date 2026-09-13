import { products, toppings } from "../../data/products";
import type { CartItem, CheckoutDetails } from "../../types";
import type { RuntimeD1Database, RuntimeD1PreparedStatement } from "../runtime-env";
import type { PaymentInstruction, PaymentStatus } from "../payments/payment-provider";
import type { OrderRepository } from "./order-repository";
import type { OrderRecord, OrderStatus } from "./order-types";

type OrderRow = {
  id: string;
  customer_name: string;
  phone: string;
  delivery_address: string;
  note: string;
  subtotal: number;
  discount_amount: number;
  shipping_fee: number;
  total_amount: number;
  order_status: OrderStatus;
  confirmed_at: string | null;
  created_at: string;
  updated_at: string;
  version: number;
};

type ItemRow = {
  id: string;
  product_id: string;
  unit_price: number;
  size: CartItem["size"];
  sugar: CartItem["sugar"];
  ice: CartItem["ice"];
  quantity: number;
};

type ToppingRow = {
  order_item_id: string;
  topping_id: string;
};

type PaymentRow = {
  payment_method: CheckoutDetails["payment"];
  provider: PaymentInstruction["provider"];
  payment_status: PaymentStatus;
  amount_due: number;
  amount_paid: number;
  transaction_reference: string | null;
  message: string;
  paid_at: string | null;
};

export class D1OrderRepository implements OrderRepository {
  constructor(private readonly database: RuntimeD1Database) {}

  async create(order: OrderRecord): Promise<OrderRecord> {
    const statements: RuntimeD1PreparedStatement[] = [
      this.database.prepare(
        `INSERT INTO orders (
          id, order_code, customer_name, phone, delivery_address, subtotal,
          discount_amount, shipping_fee, total_amount, order_status, note,
          confirmed_at, created_at, updated_at, version
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).bind(
        order.id,
        order.id,
        order.customer.fullName,
        order.customer.phone,
        order.customer.address,
        order.subtotal,
        order.discountAmount,
        order.deliveryFee,
        order.total,
        order.status,
        order.customer.note,
        order.confirmedAt,
        order.createdAt,
        order.updatedAt,
        order.version,
      ),
      this.database.prepare(
        `INSERT INTO payments (
          id, order_id, payment_method, provider, payment_status, amount_due,
          amount_paid, transaction_reference, message, paid_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).bind(
        crypto.randomUUID(),
        order.id,
        order.customer.payment,
        order.payment.provider,
        order.payment.paymentStatus,
        order.payment.amountDue,
        order.payment.amountPaid,
        order.payment.reference,
        order.payment.message,
        order.payment.paidAt,
        order.createdAt,
        order.updatedAt,
      ),
      this.database.prepare(
        `INSERT INTO order_status_history (
          id, order_id, from_status, to_status, actor_admin_id, reason, created_at
        ) VALUES (?, ?, NULL, ?, NULL, ?, ?)`,
      ).bind(crypto.randomUUID(), order.id, order.status, "Đơn hàng được tạo từ storefront.", order.createdAt),
    ];

    for (const item of order.items) {
      const itemId = crypto.randomUUID();
      const product = products.find((entry) => entry.id === item.productId);
      if (!product) throw new Error("Sản phẩm không tồn tại khi lưu đơn hàng.");
      statements.push(this.database.prepare(
        `INSERT INTO order_items (
          id, order_id, product_id, product_name, unit_price, size, sugar, ice, quantity, line_total
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).bind(
        itemId,
        order.id,
        item.productId,
        product.name,
        item.unitPrice,
        item.size,
        item.sugar,
        item.ice,
        item.quantity,
        item.unitPrice * item.quantity,
      ));
      for (const toppingId of item.toppings) {
        const topping = toppings.find((entry) => entry.id === toppingId);
        if (!topping) throw new Error("Topping không tồn tại khi lưu đơn hàng.");
        statements.push(this.database.prepare(
          `INSERT INTO order_item_toppings (
            id, order_item_id, topping_id, topping_name, unit_price
          ) VALUES (?, ?, ?, ?, ?)`,
        ).bind(crypto.randomUUID(), itemId, topping.id, topping.name, topping.price));
      }
    }

    await this.database.batch(statements);
    return structuredClone(order);
  }

  async findById(id: string): Promise<OrderRecord | null> {
    const orderRow = await this.database.prepare(
      `SELECT id, customer_name, phone, delivery_address, note, subtotal,
        discount_amount, shipping_fee, total_amount, order_status, confirmed_at,
        created_at, updated_at, version
      FROM orders WHERE id = ?`,
    ).bind(id).first<OrderRow>();
    if (!orderRow) return null;

    const [itemResult, toppingResult, paymentRow] = await Promise.all([
      this.database.prepare(
        `SELECT id, product_id, unit_price, size, sugar, ice, quantity
         FROM order_items WHERE order_id = ? ORDER BY rowid ASC`,
      ).bind(id).all<ItemRow>(),
      this.database.prepare(
        `SELECT oit.order_item_id, oit.topping_id
         FROM order_item_toppings oit
         JOIN order_items oi ON oi.id = oit.order_item_id
         WHERE oi.order_id = ? ORDER BY oit.rowid ASC`,
      ).bind(id).all<ToppingRow>(),
      this.database.prepare(
        `SELECT payment_method, provider, payment_status, amount_due, amount_paid,
          transaction_reference, message, paid_at
         FROM payments WHERE order_id = ?`,
      ).bind(id).first<PaymentRow>(),
    ]);
    if (!paymentRow) throw new Error("Đơn hàng thiếu bản ghi thanh toán.");

    const items = itemResult.results.map((row): CartItem => {
      const toppingIds = toppingResult.results
        .filter((entry) => entry.order_item_id === row.id)
        .map((entry) => entry.topping_id);
      return {
        key: [row.product_id, row.size, row.sugar, row.ice, ...toppingIds].join("|"),
        productId: row.product_id,
        size: row.size,
        sugar: row.sugar,
        ice: row.ice,
        toppings: toppingIds,
        quantity: row.quantity,
        unitPrice: row.unit_price,
      };
    });

    return {
      id: orderRow.id,
      createdAt: orderRow.created_at,
      updatedAt: orderRow.updated_at,
      confirmedAt: orderRow.confirmed_at,
      status: orderRow.order_status,
      customer: {
        fullName: orderRow.customer_name,
        phone: orderRow.phone,
        address: orderRow.delivery_address,
        note: orderRow.note,
        payment: paymentRow.payment_method,
      },
      items,
      subtotal: orderRow.subtotal,
      discountAmount: orderRow.discount_amount,
      deliveryFee: orderRow.shipping_fee,
      total: orderRow.total_amount,
      payment: {
        provider: paymentRow.provider,
        paymentStatus: paymentRow.payment_status,
        message: paymentRow.message,
        reference: paymentRow.transaction_reference,
        amountDue: paymentRow.amount_due,
        amountPaid: paymentRow.amount_paid,
        paidAt: paymentRow.paid_at,
      },
      version: orderRow.version,
    };
  }

  async update(order: OrderRecord): Promise<OrderRecord> {
    const previousVersion = order.version - 1;
    const currentStatus = await this.database.prepare(
      "SELECT order_status FROM orders WHERE id = ?",
    ).bind(order.id).first<{ order_status: OrderStatus }>();
    if (!currentStatus) throw new Error("Không tìm thấy đơn hàng để cập nhật.");

    const statements: RuntimeD1PreparedStatement[] = [
      this.database.prepare(
        `UPDATE orders SET order_status = ?, confirmed_at = ?, updated_at = ?, version = ?
         WHERE id = ? AND version = ?`,
      ).bind(order.status, order.confirmedAt, order.updatedAt, order.version, order.id, previousVersion),
      this.database.prepare(
        `UPDATE payments SET payment_status = ?, amount_due = ?, amount_paid = ?,
          transaction_reference = ?, message = ?, paid_at = ?, updated_at = ?
         WHERE order_id = ?`,
      ).bind(
        order.payment.paymentStatus,
        order.payment.amountDue,
        order.payment.amountPaid,
        order.payment.reference,
        order.payment.message,
        order.payment.paidAt,
        order.updatedAt,
        order.id,
      ),
    ];
    if (currentStatus.order_status !== order.status) {
      statements.push(this.database.prepare(
        `INSERT INTO order_status_history (
          id, order_id, from_status, to_status, actor_admin_id, reason, created_at
        ) VALUES (?, ?, ?, ?, NULL, ?, ?)`,
      ).bind(
        crypto.randomUUID(),
        order.id,
        currentStatus.order_status,
        order.status,
        "Khách hàng xác nhận luồng đặt hàng mô phỏng.",
        order.updatedAt,
      ));
    }

    const results = await this.database.batch(statements);
    if ((results[0].meta.changes ?? 0) !== 1) {
      throw new Error("Đơn hàng đã được cập nhật bởi request khác.");
    }
    return structuredClone(order);
  }
}
