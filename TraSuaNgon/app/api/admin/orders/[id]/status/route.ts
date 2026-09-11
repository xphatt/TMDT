import { networkFingerprint } from "../../../../../server/auth/admin-auth";
import { requireAdminRequest } from "../../../../../server/auth/admin-request";
import { adminHttpErrorResponse, readAdminJson, requestId } from "../../../../../server/admin/admin-http";
import {
  AdminOrderError,
  isOrderStatus,
  transitionAdminOrder,
} from "../../../../../server/admin/admin-orders";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const authenticated = await requireAdminRequest(request, { csrf: true, adminOnly: true });
    const body = await readAdminJson(request);
    const toStatus = body.toStatus;
    const expectedVersion = Number(body.expectedVersion);
    if (!isOrderStatus(toStatus)) {
      throw new AdminOrderError("invalid_transition", "Trạng thái đích không hợp lệ.", 400);
    }
    if (!Number.isInteger(expectedVersion) || expectedVersion < 1) {
      throw new AdminOrderError("invalid_query", "Phiên bản đơn hàng không hợp lệ.", 400);
    }
    const reason = typeof body.reason === "string" ? body.reason : "";
    const { id } = await context.params;
    const order = await transitionAdminOrder(id, toStatus, reason, expectedVersion, {
      admin: authenticated.principal,
      requestId: requestId(request),
      networkFingerprint: await networkFingerprint(request),
    });
    return Response.json({ order }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    return adminHttpErrorResponse(error);
  }
}
