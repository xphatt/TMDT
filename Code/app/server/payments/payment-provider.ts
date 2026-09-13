import type { CheckoutDetails } from "../../types";

export type PaymentStatus = "unpaid" | "simulation_only" | "paid";

export type PaymentInstruction = {
  provider: "cash_on_delivery" | "mock_qr";
  paymentStatus: PaymentStatus;
  message: string;
  reference: string | null;
  amountDue: number;
  amountPaid: number;
  paidAt: string | null;
};

export interface PaymentProvider {
  readonly method: CheckoutDetails["payment"];
  prepare(orderId: string, amountDue: number): PaymentInstruction;
  confirmSimulation(instruction: PaymentInstruction): PaymentInstruction;
}

const cashOnDeliveryProvider: PaymentProvider = {
  method: "cash",
  prepare(_orderId, amountDue) {
    return {
      provider: "cash_on_delivery",
      paymentStatus: "unpaid",
      message: "Thanh toán tiền mặt khi nhận hàng.",
      reference: null,
      amountDue,
      amountPaid: 0,
      paidAt: null,
    };
  },
  confirmSimulation(instruction) {
    return instruction;
  },
};

const mockQrProvider: PaymentProvider = {
  method: "bank",
  prepare(orderId, amountDue) {
    return {
      provider: "mock_qr",
      paymentStatus: "simulation_only",
      message: "QR chỉ dùng để mô phỏng giao diện, không tạo giao dịch thật.",
      reference: `MOCK-${orderId}`,
      amountDue,
      amountPaid: 0,
      paidAt: null,
    };
  },
  confirmSimulation(instruction) {
    return {
      ...instruction,
      paymentStatus: "simulation_only",
      message: "Đã xác nhận luồng QR mô phỏng. Không có khoản tiền nào được thu.",
    };
  },
};

export function getPaymentProvider(method: CheckoutDetails["payment"]): PaymentProvider {
  return method === "bank" ? mockQrProvider : cashOnDeliveryProvider;
}
