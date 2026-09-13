import { AsyncLocalStorage } from "node:async_hooks";

export type D1Value = null | number | string | ArrayBuffer | ArrayBufferView;

export interface RuntimeD1Result<T = unknown> {
  results: T[];
  success: boolean;
  meta: { changes?: number; [key: string]: unknown };
}

export interface RuntimeD1PreparedStatement {
  bind(...values: D1Value[]): RuntimeD1PreparedStatement;
  first<T = unknown>(columnName?: string): Promise<T | null>;
  all<T = unknown>(): Promise<RuntimeD1Result<T>>;
  run<T = unknown>(): Promise<RuntimeD1Result<T>>;
}

export interface RuntimeD1Database {
  prepare(query: string): RuntimeD1PreparedStatement;
  batch<T = unknown>(statements: RuntimeD1PreparedStatement[]): Promise<Array<RuntimeD1Result<T>>>;
  exec(query: string): Promise<{ count: number; duration: number }>;
}

export interface RuntimeAssetFetcher {
  fetch(request: Request): Promise<Response>;
}

export interface RuntimeBindings {
  ASSETS: RuntimeAssetFetcher;
  DB?: RuntimeD1Database;
  GEOAPIFY_API_KEY?: string;
  IMAGES?: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

const runtimeBindings = new AsyncLocalStorage<RuntimeBindings>();

export function withRuntimeBindings<T>(bindings: RuntimeBindings, callback: () => T): T {
  return runtimeBindings.run(bindings, callback);
}

export function getRuntimeBindings(): RuntimeBindings {
  const bindings = runtimeBindings.getStore();
  if (!bindings) {
    throw new Error("Runtime bindings chỉ khả dụng trong vòng đời của request.");
  }
  return bindings;
}
