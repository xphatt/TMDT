import { confirmSimulatedOrder, OrderNotFoundError } from "../../../../server/orders/order-service";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const order = await confirmSimulatedOrder(id);
    return Response.json({ order }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    if (error instanceof OrderNotFoundError) {
      return Response.json({ error: { code: "order_not_found", message: error.message } }, { status: 404 });
    }
    return Response.json(
      { error: { code: "order_confirmation_failed", message: "Không thể xác nhận đơn mô phỏng lúc này. Vui lòng thử lại." } },
      { status: 500 },
    );
  }
}
