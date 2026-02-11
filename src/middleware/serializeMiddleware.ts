import type { Middleware, SWRHook } from "swr";
import { toDatabaseIdString } from "../util/databaseId";

const serializeMiddleware: Middleware = (useSWRNext: SWRHook) => {
  return (key, fetcher, config) => {
    let swrKey = key;
    if (key != null && typeof key === "object") {
      const keyObj = key as Record<string, unknown>;
      const hasDb = "db" in keyObj;
      const hasSpecial = "queryConstraints" in keyObj || "aggregate" in keyObj;

      if (hasDb || hasSpecial) {
        const { db, ...rest } = keyObj;
        // Replace Firestore instance with serializable databaseId
        const cleaned =
          db != null
            ? {
                ...rest,
                databaseId: toDatabaseIdString(
                  (
                    db as {
                      toJSON: () => {
                        databaseId: string | { database: string };
                      };
                    }
                  ).toJSON().databaseId
                ),
              }
            : rest;
        swrKey = hasSpecial ? JSON.parse(JSON.stringify(cleaned)) : cleaned;
      }
    }
    return useSWRNext(swrKey, fetcher, config);
  };
};

export default serializeMiddleware;
