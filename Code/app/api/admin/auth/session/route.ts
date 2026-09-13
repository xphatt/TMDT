import { adminAuthErrorResponse, requireAdminRequest } from "../../../../server/auth/admin-request";

export async function GET(request: Request) {
  try {
    const authenticated = await requireAdminRequest(request);
    return Response.json({
      admin: authenticated.principal,
      expiresAt: authenticated.expiresAt,
    }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    return adminAuthErrorResponse(error);
  }
}
