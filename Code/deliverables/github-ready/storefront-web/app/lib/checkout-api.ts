import type { CartItem, CheckoutDetails } from "../types";

export type AddressSuggestion = {
  label: string;
  province: string;
  district: string;
  latitude: number;
  longitude: number;
};

export type ApiOrder = {
  id: string;
  createdAt: string;
  confirmedAt: string | null;
  status: "pending" | "confirmed";
  customer: CheckoutDetails;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  payment: {
    provider: "cash_on_delivery" | "mock_qr";
    paymentStatus: "unpaid" | "simulation_only";
    message: string;
    reference: string | null;
  };
};

export class CheckoutApiError extends Error {
  constructor(message: string, public readonly fields: Record<string, string> = {}) {
    super(message);
    this.name = "CheckoutApiError";
  }
}

async function readJson<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null) as { error?: { message?: string; fields?: Record<string, string> } } | null;
  if (!response.ok) {
    throw new CheckoutApiError(
      payload?.error?.message ?? "Yêu cầu chưa hoàn tất. Vui lòng thử lại.",
      payload?.error?.fields,
    );
  }
  return payload as T;
}

export async function getAddressSuggestions(query: string, signal: AbortSignal): Promise<AddressSuggestion[]> {
  const response = await fetch(`/api/address-suggestions?q=${encodeURIComponent(query)}`, {
    headers: { accept: "application/json" },
    signal,
  });
  const payload = await readJson<{ suggestions: AddressSuggestion[] }>(response);
  return payload.suggestions;
}

export async function createOrder(customer: CheckoutDetails, items: CartItem[]): Promise<ApiOrder> {
  const response = await fetch("/api/orders", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ customer, items }),
  });
  return (await readJson<{ order: ApiOrder }>(response)).order;
}

export async function confirmOrder(orderId: string): Promise<ApiOrder> {
  const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}/confirm`, {
    method: "POST",
    headers: { accept: "application/json" },
  });
  return (await readJson<{ order: ApiOrder }>(response)).order;
}
