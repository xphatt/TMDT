import { adminHttpErrorResponse, readAdminJson } from "../../../server/admin/admin-http";
import { requireAdminRequest } from "../../../server/auth/admin-request";
import { getAdminCatalogue, savePromotion } from "../../../server/catalogue/catalogue-service";

export async function GET(request: Request) {
  try {
    await requireAdminRequest(request);
    return Response.json({ catalogue: await getAdminCatalogue() }, { headers: { "cache-control": "no-store" } });
  } catch (error) { return adminHttpErrorResponse(error); }
}

export async function POST(request: Request) {
  try {
    await requireAdminRequest(request, { csrf: true, adminOnly: true });
    return Response.json({ catalogue: await savePromotion(await readAdminJson(request)) }, { status: 201, headers: { "cache-control": "no-store" } });
  } catch (error) { return adminHttpErrorResponse(error); }
}
