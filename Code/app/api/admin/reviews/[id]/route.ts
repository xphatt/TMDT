import { adminHttpErrorResponse, readAdminJson } from "../../../../server/admin/admin-http";
import { requireAdminRequest } from "../../../../server/auth/admin-request";
import { deleteAdminReview, setReviewStatus } from "../../../../server/engagement/engagement-service";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminRequest(request, { csrf: true, adminOnly: true });
    const { id } = await context.params;
    const body = await readAdminJson(request);
    return Response.json({ review: await setReviewStatus(id, body.status) }, { headers: { "cache-control": "no-store" } });
  } catch (error) { return adminHttpErrorResponse(error); }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminRequest(request, { csrf: true, adminOnly: true });
    const { id } = await context.params;
    await deleteAdminReview(id);
    return new Response(null, { status: 204, headers: { "cache-control": "no-store" } });
  } catch (error) { return adminHttpErrorResponse(error); }
}
