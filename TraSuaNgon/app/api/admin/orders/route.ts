import { adminHttpErrorResponse } from "../../../server/admin/admin-http";
import { listAdminOrders, parseOrderListQuery } from "../../../server/admin/admin-orders";
import { requireAdminRequest } from "../../../server/auth/admin-request";

export async function GET(request: Request) {
  try {
    await requireAdminRequest(request);
    const orders = await listAdminOrders(parseOrderListQuery(new URL(request.url)));
    return Response.json({ orders }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    return adminHttpErrorResponse(error);
  }
}
