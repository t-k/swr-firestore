import type { SWRConfiguration } from "swr";
import { doc, getDoc, getDocFromCache, getFirestore } from "firebase/firestore";
import type { DocumentData, GetDocKeyParams } from "../util/type";
import useSWR from "swr";
import { getFirestoreConverter } from "../util/getConverter";
import serializeMiddleware from "../middleware/serializeMiddleware";

const useGetDoc = <T>(
  params: Omit<GetDocKeyParams<T>, "where" | "orderBy" | "limit"> | null,
  swrOptions?: Omit<SWRConfiguration, "fetcher">
) => {
  const fetcher = async (): Promise<DocumentData<T> | undefined> => {
    if (params == null) {
      return;
    }
    const { path, parseDates, ...options } = params;
    const converter = getFirestoreConverter<T>(parseDates);
    const ref = doc(getFirestore(), path);
    const getFn = options.useOfflineCache ? getDocFromCache : getDoc;
    const sn = await getFn(ref.withConverter(converter));
    return sn.data();
  };
  const scrubKey = (params: GetDocKeyParams<T> | null) => {
    if (params == null) {
      return null;
    }
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      useOfflineCache: _useOfflineCache,
      ...rest
    } = params;
    return rest;
  };
  return useSWR(scrubKey(params), fetcher, {
    ...swrOptions,
    use: [serializeMiddleware, ...(swrOptions?.use ?? [])],
  });
};
export default useGetDoc;
