import { AdminAuthError } from "../auth/admin-auth";
import { adminAuthErrorResponse } from "../auth/admin-request";
import { AdminOrderError, adminOrderErrorResponse } from "./admin-orders";

export function adminHttpErrorResponse(error: unknown): Response {
  if (error instanceof AdminAuthError) return adminAuthErrorResponse(error);
  if (error instanceof AdminOrderError) return adminOrderErrorResponse(error);
  return Response.json(
    { error: { code: "admin_request_failed", message: "Không thể xử lý yêu cầu quản trị lúc này." } },
    { status: 500, headers: { "cache-control": "no-store" } },
  );
}

export async function readAdminJson(request: Request): Promise<Record<string, unknown>> {
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    throw new AdminOrderError("invalid_query", "Yêu cầu cần dùng định dạng JSON.", 400);
  }
  try {
    const value = await request.json() as unknown;
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("invalid object");
    }
    return value as Record<string, unknown>;
  } catch {
    throw new AdminOrderError("invalid_query", "Dữ liệu JSON không hợp lệ.", 400);
  }
}

export function requestId(request: Request): string {
  const candidate = request.headers.get("cf-ray") ?? request.headers.get("x-request-id");
  return candidate && /^[a-zA-Z0-9._:-]{1,100}$/u.test(candidate) ? candidate : crypto.randomUUID();
}
