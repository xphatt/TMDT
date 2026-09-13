import { adminHttpErrorResponse, readAdminJson } from "../../../../server/admin/admin-http";
import { requireAdminRequest } from "../../../../server/auth/admin-request";
import { saveCategory } from "../../../../server/catalogue/catalogue-service";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminRequest(request, { csrf: true, adminOnly: true });
    const { id } = await context.params;
    return Response.json({ catalogue: await saveCategory(id, await readAdminJson(request)) }, { headers: { "cache-control": "no-store" } });
  } catch (error) { return adminHttpErrorResponse(error); }
}
