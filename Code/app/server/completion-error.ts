export class CompletionError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "CompletionError";
  }
}

export function completionErrorResponse(error: unknown, fallback = "Không thể xử lý yêu cầu lúc này."): Response {
  if (error instanceof CompletionError) {
    return Response.json(
      { error: { code: error.code, message: error.message, fields: error.fields } },
      { status: error.status, headers: { "cache-control": "no-store" } },
    );
  }
  return Response.json(
    { error: { code: "request_failed", message: fallback } },
    { status: 500, headers: { "cache-control": "no-store" } },
  );
}
