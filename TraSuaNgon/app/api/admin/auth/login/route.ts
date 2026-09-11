import { AdminAuthError, loginAdmin, networkFingerprint } from "../../../../server/auth/admin-auth";
import {
  adminAuthErrorResponse,
  appendAdminCookies,
  validateSameOrigin,
} from "../../../../server/auth/admin-request";

export async function POST(request: Request) {
  try {
    validateSameOrigin(request);
    if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
      throw new AdminAuthError("invalid_credentials", "Yêu cầu đăng nhập không hợp lệ.", 400);
    }
    const payload = await request.json() as { loginName?: unknown; password?: unknown };
    const loginName = typeof payload.loginName === "string" ? payload.loginName : "";
    const password = typeof payload.password === "string" ? payload.password : "";
    if (!loginName || !password || loginName.length > 100 || password.length > 200) {
      throw new AdminAuthError("invalid_credentials", "Tên đăng nhập hoặc mật khẩu chưa đúng.", 401);
    }

    const result = await loginAdmin(loginName, password, await networkFingerprint(request));
    const headers = new Headers({ "cache-control": "no-store" });
    appendAdminCookies(headers, request, result.sessionToken, result.csrfToken);
    return Response.json({
      admin: result.principal,
      expiresAt: result.expiresAt,
    }, { headers });
  } catch (error) {
    return adminAuthErrorResponse(error);
  }
}
