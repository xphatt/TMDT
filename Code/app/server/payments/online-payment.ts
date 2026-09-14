export type OnlinePaymentStatus = "pending" | "paid" | "failed" | "cancelled" | "expired";

export type OnlinePaymentAttempt = {
  id: string;
  orderId: string;
  provider: string;
  merchantReference: string;
  providerTransactionId: string | null;
  amount: number;
  currency: "VND";
  status: OnlinePaymentStatus;
  processedEventIds: string[];
  updatedAt: string;
};

export type VerifiedPaymentEvent = {
  eventId: string;
  orderId: string;
  provider: string;
  merchantReference: string;
  providerTransactionId: string | null;
  amount: number;
  currency: string;
  status: OnlinePaymentStatus;
  occurredAt: string;
  signatureVerified: boolean;
};

export type PrepareOnlinePaymentInput = {
  orderId: string;
  merchantReference: string;
  amount: number;
  currency: "VND";
  returnUrl: string;
  webhookUrl: string;
};

export type PreparedOnlinePayment = {
  provider: string;
  merchantReference: string;
  providerTransactionId: string | null;
  checkoutUrl: string;
  expiresAt: string | null;
};

export interface OnlinePaymentGateway {
  readonly provider: string;
  prepare(input: PrepareOnlinePaymentInput): Promise<PreparedOnlinePayment>;
  verifyWebhook(request: Request): Promise<VerifiedPaymentEvent>;
}

export class PaymentProtocolError extends Error {
  readonly code: "invalid_signature" | "transaction_mismatch" | "amount_mismatch" | "currency_mismatch" | "invalid_transition";

  constructor(code: PaymentProtocolError["code"], message: string) {
    super(message);
    this.name = "PaymentProtocolError";
    this.code = code;
  }
}

function decodeSignature(value: string, encoding: "hex" | "base64"): Uint8Array | null {
  try {
    if (encoding === "hex") {
      if (!/^[0-9a-f]+$/iu.test(value) || value.length % 2 !== 0) return null;
      return Uint8Array.from(value.match(/.{2}/gu) ?? [], (part) => Number.parseInt(part, 16));
    }
    const normalized = value.replace(/-/gu, "+").replace(/_/gu, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
  } catch {
    return null;
  }
}

export async function verifyHmacSha256(input: { secret: string; payload: string; signature: string; encoding: "hex" | "base64" }): Promise<boolean> {
  const signature = decodeSignature(input.signature.trim(), input.encoding);
  if (!signature || !input.secret) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(input.secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  return crypto.subtle.verify("HMAC", key, Uint8Array.from(signature).buffer, new TextEncoder().encode(input.payload));
}

export function canRetryPayment(status: OnlinePaymentStatus): boolean {
  return status === "failed" || status === "cancelled" || status === "expired";
}

export function applyVerifiedPaymentEvent(attempt: OnlinePaymentAttempt, event: VerifiedPaymentEvent): { attempt: OnlinePaymentAttempt; duplicate: boolean } {
  if (!event.signatureVerified) {
    throw new PaymentProtocolError("invalid_signature", "Chữ ký webhook không hợp lệ.");
  }
  if (attempt.processedEventIds.includes(event.eventId)) {
    return { attempt, duplicate: true };
  }
  if (
    event.provider !== attempt.provider
    || event.orderId !== attempt.orderId
    || event.merchantReference !== attempt.merchantReference
    || (attempt.providerTransactionId && event.providerTransactionId !== attempt.providerTransactionId)
  ) {
    throw new PaymentProtocolError("transaction_mismatch", "Giao dịch webhook không khớp với lần thanh toán.");
  }
  if (!Number.isSafeInteger(event.amount) || event.amount !== attempt.amount) {
    throw new PaymentProtocolError("amount_mismatch", "Số tiền webhook không khớp với đơn hàng.");
  }
  if (event.currency !== attempt.currency) {
    throw new PaymentProtocolError("currency_mismatch", "Đơn vị tiền tệ webhook không khớp với đơn hàng.");
  }
  if (attempt.status === "paid" && event.status !== "paid") {
    throw new PaymentProtocolError("invalid_transition", "Không thể hạ trạng thái của giao dịch đã thanh toán.");
  }
  if (attempt.status !== "pending" && attempt.status !== event.status) {
    throw new PaymentProtocolError("invalid_transition", "Webhook đến sai thứ tự cho trạng thái thanh toán hiện tại.");
  }

  return {
    duplicate: false,
    attempt: {
      ...attempt,
      providerTransactionId: attempt.providerTransactionId ?? event.providerTransactionId,
      status: event.status,
      processedEventIds: [...attempt.processedEventIds, event.eventId],
      updatedAt: event.occurredAt,
    },
  };
}
