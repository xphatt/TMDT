import { adminHttpErrorResponse } from "../../../server/admin/admin-http";
import { getAdminDashboard } from "../../../server/admin/admin-orders";
import { requireAdminRequest } from "../../../server/auth/admin-request";

export async function GET(request: Request) {
  try {
    await requireAdminRequest(request);
    const url = new URL(request.url);
    const dashboard = await getAdminDashboard(url.searchParams.get("from"), url.searchParams.get("to"));
    return Response.json({ dashboard }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    return adminHttpErrorResponse(error);
  }
}
