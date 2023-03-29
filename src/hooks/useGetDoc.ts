import type { SWRHook } from "swr";
import { doc, getDoc, getDocFromCache, getFirestore } from "firebase/firestore";
import type { DocumentData, GetDocKeyParams } from "../util/type";
import useSWR from "swr";
import { getFirestoreConverter } from "../util/getConverter";

const useGetDoc = <T>(
  params: Omit<GetDocKeyParams<T>, "where" | "orderBy" | "limit"> | null,
  swrOptions?: Omit<Parameters<SWRHook>[2], "fetcher">
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
  return useSWR(params, fetcher, swrOptions);
};
export default useGetDoc;
