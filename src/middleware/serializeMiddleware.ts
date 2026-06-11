import type { Key, Middleware, SWRHook } from "swr";
import { extractDatabaseIdentity } from "../util/databaseId";

const sanitize = (value: unknown): unknown => JSON.parse(JSON.stringify(value));

const serializeMiddleware: Middleware = (useSWRNext: SWRHook) => {
  return (key, fetcher, config) => {
    let swrKey = key;
    if (key != null && typeof key === "object") {
      const keyObj = key as Record<string, unknown>;
      const hasDb = "db" in keyObj;

      if (hasDb) {
        const { db, ...rest } = keyObj;
        const databaseId = extractDatabaseIdentity(db);
        const cleaned = databaseId != null ? { ...rest, databaseId } : rest;
        swrKey = sanitize(cleaned) as Key;
      } else {
        swrKey = sanitize(keyObj) as Key;
      }
    }
    return useSWRNext(swrKey, fetcher, config);
  };
};

export default serializeMiddleware;
