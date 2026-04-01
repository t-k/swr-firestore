import type { Middleware, SWRHook } from "swr";
import { extractDatabaseId } from "../util/databaseId";

const serializeMiddleware: Middleware = (useSWRNext: SWRHook) => {
  return (key, fetcher, config) => {
    let swrKey = key;
    if (key != null && typeof key === "object") {
      const keyObj = key as Record<string, unknown>;
      const hasDb = "db" in keyObj;
      const hasSpecial = "queryConstraints" in keyObj || "aggregate" in keyObj;

      if (hasDb || hasSpecial) {
        const { db, ...rest } = keyObj;
        const databaseId = extractDatabaseId(db);
        const cleaned = databaseId != null ? { ...rest, databaseId } : rest;
        swrKey = hasSpecial ? JSON.parse(JSON.stringify(cleaned)) : cleaned;
      }
    }
    return useSWRNext(swrKey, fetcher, config);
  };
};

export default serializeMiddleware;
