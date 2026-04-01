import type { SWRConfiguration } from "swr";
import { doc, getDoc, getDocFromCache, getFirestore } from "firebase/firestore";
import type { DocumentData, Falsy, GetDocKeyParams } from "../util/type";
import useSWR from "swr";
import { getFirestoreConverter } from "../util/getConverter";
import { scrubKey } from "../util/scrubKey";
import serializeMiddleware from "../middleware/serializeMiddleware";

const useGetDoc = <T>(
  params: Omit<GetDocKeyParams<T>, "where" | "orderBy" | "limit"> | Falsy,
  swrOptions?: Omit<SWRConfiguration, "fetcher">,
) => {
  const fetcher = async (): Promise<DocumentData<T> | undefined> => {
    if (!params) {
      return;
    }
    const { path, parseDates, db, ...options } = params;
    const converter = getFirestoreConverter<T>(parseDates);
    const ref = doc(db ?? getFirestore(), path);
    const getFn = options.useOfflineCache ? getDocFromCache : getDoc;
    const sn = await getFn(ref.withConverter(converter));
    return sn.data();
  };
  return useSWR(scrubKey(params as Record<string, unknown> | Falsy), fetcher, {
    ...swrOptions,
    use: [serializeMiddleware, ...(swrOptions?.use ?? [])],
  });
};
export default useGetDoc;
