import { completionErrorResponse } from "../../../server/completion-error";
import { deleteOwnReview, updateOwnReview } from "../../../server/engagement/engagement-service";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    return Response.json({ review: await updateOwnReview(id, await request.json()) }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    return completionErrorResponse(error, "Chưa thể cập nhật đánh giá lúc này.");
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const payload = await request.json() as { ownerToken?: unknown };
    await deleteOwnReview(id, payload.ownerToken);
    return new Response(null, { status: 204, headers: { "cache-control": "no-store" } });
  } catch (error) {
    return completionErrorResponse(error, "Chưa thể xóa đánh giá lúc này.");
  }
}
