import type { SWRHook } from "swr";
import { doc, getDoc, getDocFromCache, getFirestore } from "firebase/firestore";
import type { DocumentData, GetDocKeyParams } from "../util/type";
import useSWR from "swr";
import { getFirestoreConverter } from "../util/getConverter";

const useGetDoc = <T>(
  params: Omit<GetDocKeyParams<T>, "where" | "orderBy" | "limit"> | null,
  swrOptions?: Omit<Parameters<SWRHook>[2], "fetcher">
) => {
  const fetcher = async (
    key: GetDocKeyParams<T>
  ): Promise<DocumentData<T> | undefined> => {
    const { path, ...option } = key;
    const converter = getFirestoreConverter<T>(option?.parseDates);
    const ref = doc(getFirestore(), path);
    const getFn = option.useOfflineCache ? getDocFromCache : getDoc;
    const sn = await getFn(ref.withConverter(converter));
    return sn.data();
  };
  return useSWR(params, fetcher, swrOptions);
};
export default useGetDoc;
