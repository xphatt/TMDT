import { completionErrorResponse } from "../../server/completion-error";
import { createFeedback } from "../../server/engagement/engagement-service";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    return Response.json({ feedback: await createFeedback(payload) }, { status: 201, headers: { "cache-control": "no-store" } });
  } catch (error) {
    return completionErrorResponse(error, "Chưa thể lưu phản hồi lúc này.");
  }
}
