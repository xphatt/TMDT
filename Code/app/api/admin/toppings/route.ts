import { adminHttpErrorResponse, readAdminJson } from "../../../server/admin/admin-http";
import { requireAdminRequest } from "../../../server/auth/admin-request";
import { saveTopping } from "../../../server/catalogue/catalogue-service";

export async function POST(request: Request) {
  try {
    await requireAdminRequest(request, { csrf: true, adminOnly: true });
    const body = await readAdminJson(request);
    const id = typeof body.id === "string" ? body.id : "";
    return Response.json({ catalogue: await saveTopping(id, body) }, { status: 201, headers: { "cache-control": "no-store" } });
  } catch (error) { return adminHttpErrorResponse(error); }
}
