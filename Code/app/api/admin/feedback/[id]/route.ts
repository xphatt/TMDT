import { adminHttpErrorResponse, readAdminJson } from "../../../../server/admin/admin-http";
import { requireAdminRequest } from "../../../../server/auth/admin-request";
import { updateFeedbackStatus } from "../../../../server/engagement/engagement-service";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminRequest(request, { csrf: true, adminOnly: true });
    const { id } = await context.params;
    const body = await readAdminJson(request);
    return Response.json({ feedback: await updateFeedbackStatus(id, body.status) }, { headers: { "cache-control": "no-store" } });
  } catch (error) { return adminHttpErrorResponse(error); }
}
