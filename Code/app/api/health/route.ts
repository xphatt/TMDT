import { getRuntimeBindings } from "../../server/runtime-env";

export async function GET() {
  const checkedAt = new Date().toISOString();

  try {
    const database = getRuntimeBindings().DB;
    if (!database) {
      return Response.json(
        { status: "degraded", database: "not_configured", checkedAt },
        { status: 503, headers: { "cache-control": "no-store" } },
      );
    }

    await database.prepare("SELECT 1 AS healthy").first();
    return Response.json(
      { status: "ok", database: "connected", checkedAt },
      { headers: { "cache-control": "no-store" } },
    );
  } catch {
    return Response.json(
      { status: "degraded", database: "unavailable", checkedAt },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }
}
