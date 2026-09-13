import { adminHttpErrorResponse } from "../../../server/admin/admin-http";
import { requireAdminRequest } from "../../../server/auth/admin-request";
import { listAdminReviews } from "../../../server/engagement/engagement-service";

export async function GET(request: Request) {
  try {
    await requireAdminRequest(request);
    return Response.json({ reviews: await listAdminReviews() }, { headers: { "cache-control": "no-store" } });
  } catch (error) { return adminHttpErrorResponse(error); }
}
