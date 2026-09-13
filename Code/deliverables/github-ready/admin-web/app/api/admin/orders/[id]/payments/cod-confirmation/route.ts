import { networkFingerprint } from "../../../../../../server/auth/admin-auth";
import { requireAdminRequest } from "../../../../../../server/auth/admin-request";
import {
  adminHttpErrorResponse,
  readAdminJson,
  requestId,
} from "../../../../../../server/admin/admin-http";
import { AdminOrderError, confirmCodPayment } from "../../../../../../server/admin/admin-orders";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const authenticated = await requireAdminRequest(request, { csrf: true, adminOnly: true });
    const body = await readAdminJson(request);
    const expectedVersion = Number(body.expectedVersion);
    if (!Number.isInteger(expectedVersion) || expectedVersion < 1) {
      throw new AdminOrderError("invalid_query", "Phiên bản đơn hàng không hợp lệ.", 400);
    }
    const note = typeof body.note === "string" ? body.note : "";
    const { id } = await context.params;
    const order = await confirmCodPayment(id, expectedVersion, note, {
      admin: authenticated.principal,
      requestId: requestId(request),
      networkFingerprint: await networkFingerprint(request),
    });
    return Response.json({ order }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    return adminHttpErrorResponse(error);
  }
}
