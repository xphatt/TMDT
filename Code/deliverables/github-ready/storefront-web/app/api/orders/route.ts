import { createPendingOrder, OrderValidationError } from "../../server/orders/order-service";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: { code: "invalid_json", message: "Dữ liệu gửi lên không phải JSON hợp lệ." } }, { status: 400 });
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
