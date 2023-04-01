import type { Middleware, SWRHook } from "swr";

const serializeMiddleware: Middleware = (useSWRNext: SWRHook) => {
  return (key, fetcher, config) => {
    let swrKey = key;
    if (key != null && typeof key === "object" && "queryConstraints" in key) {
      swrKey = JSON.parse(JSON.stringify(key));
    }
    return useSWRNext(swrKey, fetcher, config);
  };
};

export default serializeMiddleware;
