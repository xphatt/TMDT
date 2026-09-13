import { adminHttpErrorResponse } from "../../../../server/admin/admin-http";
import { getAdminOrderDetail } from "../../../../server/admin/admin-orders";
import { requireAdminRequest } from "../../../../server/auth/admin-request";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminRequest(request);
    const { id } = await context.params;
    const order = await getAdminOrderDetail(id);
    return Response.json({ order }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    return adminHttpErrorResponse(error);
  }
}
