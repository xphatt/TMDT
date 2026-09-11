"use client";

export class AdminApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "AdminApiError";
  }
}

function csrfToken(): string {
  for (const part of document.cookie.split(";")) {
    const [name, ...rawValue] = part.trim().split("=");
    if (name === "tsn_admin_csrf") return decodeURIComponent(rawValue.join("="));
  }
  return "";
}

export async function adminFetch<T>(url: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);
  if (method !== "GET" && method !== "HEAD") {
    headers.set("x-csrf-token", csrfToken());
  }
  const response = await fetch(url, {
    ...init,
    headers,
    credentials: "same-origin",
  });
  const payload = await response.json().catch(() => ({})) as {
    error?: { code?: string; message?: string; fields?: Record<string, string> };
  };
  if (!response.ok) {
    if (response.status === 401 && !url.endsWith("/login")) {
      window.location.assign(`/admin/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`);
    }
    throw new AdminApiError(
      payload.error?.code ?? "admin_request_failed",
      payload.error?.message ?? "Không thể xử lý yêu cầu quản trị.",
      response.status,
      payload.error?.fields,
    );
  }
  return payload as T;
}

export function formatAdminVnd(value: number): string {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);
}

export function formatAdminDate(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(value));
}

export const orderStatusLabels = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  preparing: "Đang chuẩn bị",
  delivering: "Đang giao",
  completed: "Hoàn tất",
  cancelled: "Đã hủy",
  rejected: "Từ chối",
} as const;

export const paymentStatusLabels = {
  unpaid: "Chưa thanh toán",
  simulation_only: "Mô phỏng",
  paid: "Đã thu COD",
} as const;
