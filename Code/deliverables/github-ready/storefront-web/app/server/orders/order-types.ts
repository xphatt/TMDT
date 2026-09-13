import type { CartItem, CheckoutDetails } from "../../types";
import type { PaymentInstruction } from "../payments/payment-provider";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "delivering"
  | "completed"
  | "cancelled"
  | "rejected";

export type OrderRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt: string | null;
  status: OrderStatus;
  customer: CheckoutDetails;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  total: number;
  payment: PaymentInstruction;
  version: number;
};
