import { revokeAdminSession } from "../../../../server/auth/admin-auth";
import {
  adminAuthErrorResponse,
  appendClearedAdminCookies,
  requireAdminRequest,
} from "../../../../server/auth/admin-request";

export async function POST(request: Request) {
  try {
    const authenticated = await requireAdminRequest(request, { csrf: true });
    await revokeAdminSession(authenticated.sessionId);
    const headers = new Headers({ "cache-control": "no-store" });
    appendClearedAdminCookies(headers, request);
    return Response.json({ ok: true }, { headers });
  } catch (error) {
    return adminAuthErrorResponse(error);
  }
}
