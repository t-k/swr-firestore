import { Middleware, SWRHook } from "swr";

const emptyMiddleware: Middleware = (useSWRNext: SWRHook) => {
  return (key, fetcher, config) => {
    return useSWRNext(key, fetcher, config);
  };
};
export default emptyMiddleware;
