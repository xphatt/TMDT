import type { CheckoutDetails } from "../../types";

export type PaymentStatus = "unpaid" | "simulation_only";

export type PaymentInstruction = {
  provider: "cash_on_delivery" | "mock_qr";
  paymentStatus: PaymentStatus;
  message: string;
  reference: string | null;
};

export interface PaymentProvider {
  readonly method: CheckoutDetails["payment"];
  prepare(orderId: string): PaymentInstruction;
  confirmSimulation(instruction: PaymentInstruction): PaymentInstruction;
}

const cashOnDeliveryProvider: PaymentProvider = {
  method: "cash",
  prepare() {
    return {
      provider: "cash_on_delivery",
      paymentStatus: "unpaid",
      message: "Thanh toán tiền mặt khi nhận hàng.",
      reference: null,
    };
  },
  confirmSimulation(instruction) {
    return instruction;
  },
};

const mockQrProvider: PaymentProvider = {
  method: "bank",
  prepare(orderId) {
    return {
      provider: "mock_qr",
      paymentStatus: "simulation_only",
      message: "QR chỉ dùng để mô phỏng giao diện, không tạo giao dịch thật.",
      reference: `MOCK-${orderId}`,
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
