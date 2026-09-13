import { adminHttpErrorResponse, readAdminJson } from "../../../../../server/admin/admin-http";
import { requireAdminRequest } from "../../../../../server/auth/admin-request";
import { saveCatalogueProduct, setCatalogueProductActive } from "../../../../../server/catalogue/catalogue-service";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminRequest(request, { csrf: true, adminOnly: true });
    const { id } = await context.params;
    return Response.json({ catalogue: await saveCatalogueProduct(await readAdminJson(request), id) }, { headers: { "cache-control": "no-store" } });
  } catch (error) { return adminHttpErrorResponse(error); }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminRequest(request, { csrf: true, adminOnly: true });
    const { id } = await context.params;
    return Response.json({ catalogue: await setCatalogueProductActive(id, false) }, { headers: { "cache-control": "no-store" } });
  } catch (error) { return adminHttpErrorResponse(error); }
}
