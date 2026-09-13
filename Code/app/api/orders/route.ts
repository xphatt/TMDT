import { createPendingOrder, OrderValidationError } from "../../server/orders/order-service";
import { isCheckoutDemoEnabled } from "../../domain/completion-rules";

const demonstratedRequestIds = new Set<string>();

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: { code: "invalid_json", message: "Dữ liệu gửi lên không phải JSON hợp lệ." } }, { status: 400 });
  }

  const buildEnvironment = (import.meta as { env?: { DEV?: boolean; DEMO_MODE?: string; DEMO_ERROR_SCENARIO?: string } }).env;
  const clientRequestId = payload && typeof payload === "object" && "clientRequestId" in payload && typeof payload.clientRequestId === "string"
    ? payload.clientRequestId
    : "anonymous-demo-request";
  const shouldDemonstrateError = isCheckoutDemoEnabled({
    isProduction: buildEnvironment?.DEV !== true,
    demoMode: buildEnvironment?.DEMO_MODE ?? process.env.DEMO_MODE,
    scenario: buildEnvironment?.DEMO_ERROR_SCENARIO ?? process.env.DEMO_ERROR_SCENARIO,
  }) && !demonstratedRequestIds.has(clientRequestId);
  if (shouldDemonstrateError) {
    demonstratedRequestIds.add(clientRequestId);
    if (demonstratedRequestIds.size > 200) demonstratedRequestIds.delete(demonstratedRequestIds.values().next().value ?? "");
    return Response.json(
      { error: { code: "demo_checkout_timeout", message: "Không thể gửi đơn hàng lúc này. Vui lòng kiểm tra kết nối và thử lại." } },
      { status: 503, headers: { "cache-control": "no-store", "retry-after": "3" } },
    );
  }

  try {
    const order = await createPendingOrder(payload);
    return Response.json({ order }, { status: 201, headers: { "cache-control": "no-store" } });
  } catch (error) {
    if (error instanceof OrderValidationError) {
      return Response.json(
        { error: { code: "invalid_order", message: error.message, fields: error.fields } },
        { status: 400, headers: { "cache-control": "no-store" } },
      );
    }
    return Response.json(
      { error: { code: "order_creation_failed", message: "Không thể tạo đơn mô phỏng lúc này. Vui lòng thử lại." } },
      { status: 500, headers: { "cache-control": "no-store" } },
    );
  }
}
