import { completionErrorResponse } from "../../server/completion-error";
import { createReview, listReviews } from "../../server/engagement/engagement-service";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const reviews = await listReviews(url.searchParams.get("productId") ?? "", request.headers.get("x-review-owner") ?? "");
    return Response.json({ reviews }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    return completionErrorResponse(error, "Chưa thể tải đánh giá lúc này.");
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    return Response.json({ review: await createReview(payload) }, { status: 201, headers: { "cache-control": "no-store" } });
  } catch (error) {
    return completionErrorResponse(error, "Chưa thể lưu đánh giá lúc này.");
  }
}
