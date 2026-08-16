import { deliveryFee, sizeSurcharge } from "../../data/pricing";
import { products, toppings } from "../../data/products";
import type { CartItem, CheckoutDetails, DrinkSize, IceLevel, SugarLevel } from "../../types";
import { getPaymentProvider, type PaymentInstruction } from "../payments/payment-provider";
import { orderRepository } from "./order-repository";

export type OrderStatus = "pending" | "confirmed";

export type OrderRecord = {
  id: string;
  createdAt: string;
  confirmedAt: string | null;
  status: OrderStatus;
  customer: CheckoutDetails;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  payment: PaymentInstruction;
};

export class OrderValidationError extends Error {
  constructor(public readonly fields: Record<string, string>) {
    super("Dữ liệu đơn hàng chưa hợp lệ.");
    this.name = "OrderValidationError";
  }
}

export class OrderNotFoundError extends Error {
  constructor() {
    super("Không tìm thấy đơn hàng mô phỏng.");
    this.name = "OrderNotFoundError";
  }
}

const sugarLevels = new Set<SugarLevel>(["0%", "30%", "50%", "70%", "100%"]);
const iceLevels = new Set<IceLevel>(["Không đá", "Ít đá", "Vừa", "Nhiều đá"]);
const sizes = new Set<DrinkSize>(["M", "L"]);

function sanitizeCustomer(value: unknown): CheckoutDetails {
  const input = value && typeof value === "object" ? value as Partial<CheckoutDetails> : {};
  return {
    fullName: typeof input.fullName === "string" ? input.fullName.trim().slice(0, 100) : "",
    phone: typeof input.phone === "string" ? input.phone.replace(/\s/g, "").slice(0, 16) : "",
    address: typeof input.address === "string" ? input.address.trim().slice(0, 240) : "",
    note: typeof input.note === "string" ? input.note.trim().slice(0, 500) : "",
    payment: input.payment === "bank" ? "bank" : "cash",
  };
}

function validateCustomer(customer: CheckoutDetails) {
  const fields: Record<string, string> = {};
  if (customer.fullName.length < 2) fields.fullName = "Nhập họ tên có ít nhất 2 ký tự.";
  if (!/^(0|\+84)(3|5|7|8|9)\d{8}$/.test(customer.phone)) fields.phone = "Nhập số điện thoại Việt Nam hợp lệ.";
  if (customer.address.length < 10) fields.address = "Nhập địa chỉ nhận hàng cụ thể hơn.";
  return fields;
}

function normalizeItems(value: unknown): CartItem[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > 50) {
    throw new OrderValidationError({ items: "Đơn hàng cần có từ 1 đến 50 dòng sản phẩm." });
  }

  return value.map((raw, index) => {
    const input = raw && typeof raw === "object" ? raw as Partial<CartItem> : {};
    const product = products.find((item) => item.id === input.productId);
    if (!product) throw new OrderValidationError({ [`items.${index}`]: "Sản phẩm không tồn tại trong menu nội bộ." });

    const quantity = Number.isInteger(input.quantity) ? Number(input.quantity) : 0;
    if (quantity < 1 || quantity > 20) throw new OrderValidationError({ [`items.${index}.quantity`]: "Số lượng phải từ 1 đến 20." });

    const isStandaloneTopping = product.category === "topping";
    const size = isStandaloneTopping ? "M" : input.size;
    const sugar = isStandaloneTopping ? "0%" : input.sugar;
    const ice = isStandaloneTopping ? "Không đá" : input.ice;
    if (!size || !sizes.has(size)) throw new OrderValidationError({ [`items.${index}.size`]: "Size không hợp lệ." });
    if (!sugar || !sugarLevels.has(sugar)) throw new OrderValidationError({ [`items.${index}.sugar`]: "Mức đường không hợp lệ." });
    if (!ice || !iceLevels.has(ice)) throw new OrderValidationError({ [`items.${index}.ice`]: "Mức đá không hợp lệ." });

    const toppingIds = isStandaloneTopping ? [] : Array.isArray(input.toppings) ? [...new Set(input.toppings)] : [];
    const selectedToppings = toppingIds.map((id) => toppings.find((item) => item.id === id));
    if (selectedToppings.some((item) => !item)) throw new OrderValidationError({ [`items.${index}.toppings`]: "Topping không tồn tại trong dữ liệu nội bộ." });

    const unitPrice = product.price + (isStandaloneTopping ? 0 : sizeSurcharge[size]) + selectedToppings.reduce((sum, item) => sum + (item?.price ?? 0), 0);
    return {
      key: [product.id, size, sugar, ice, ...toppingIds].join("|"),
      productId: product.id,
      size,
      sugar,
      ice,
      toppings: toppingIds,
      quantity,
      unitPrice,
    };
  });
}

export async function createPendingOrder(payload: unknown): Promise<OrderRecord> {
  const input = payload && typeof payload === "object" ? payload as { customer?: unknown; items?: unknown } : {};
  const rawCustomer = input.customer && typeof input.customer === "object" ? input.customer as { payment?: unknown } : {};
  if (rawCustomer.payment !== "cash" && rawCustomer.payment !== "bank") {
    throw new OrderValidationError({ payment: "Phương thức thanh toán không được hỗ trợ." });
  }
  const customer = sanitizeCustomer(input.customer);
  const fields = validateCustomer(customer);
  if (Object.keys(fields).length) throw new OrderValidationError(fields);

  const items = normalizeItems(input.items);
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const id = `TSN${Date.now().toString().slice(-7)}${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
  const provider = getPaymentProvider(customer.payment);
  const order: OrderRecord = {
    id,
    createdAt: new Date().toISOString(),
    confirmedAt: null,
    status: "pending",
    customer,
    items,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    payment: provider.prepare(id),
  };
  return orderRepository.create(order);
}

export async function confirmSimulatedOrder(id: string): Promise<OrderRecord> {
  const current = await orderRepository.findById(id);
  if (!current) throw new OrderNotFoundError();
  if (current.status === "confirmed") return current;

  const provider = getPaymentProvider(current.customer.payment);
  return orderRepository.update({
    ...current,
    status: "confirmed",
    confirmedAt: new Date().toISOString(),
    payment: provider.confirmSimulation(current.payment),
  });
}
