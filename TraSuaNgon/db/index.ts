import { drizzle } from "drizzle-orm/d1";
import { getRuntimeBindings, type RuntimeD1Database } from "../app/server/runtime-env";
import * as schema from "./schema";

export function getD1(): RuntimeD1Database {
  const database = getRuntimeBindings().DB;
  if (!database) {
    throw new Error("Cloudflare D1 binding `DB` chưa được cấu hình.");
  }
  return database;
}

export function getDb() {
  return drizzle(getD1() as never, { schema });
}
