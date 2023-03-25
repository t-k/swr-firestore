import type { SWRHook } from "swr";
import {
  collection,
  getDocs,
  getDocsFromCache,
  getFirestore,
} from "firebase/firestore";
import type { DocumentData, GetDocKeyParams } from "../util/type";
import useSWR from "swr";
import { limit, orderBy, query, where } from "firebase/firestore";
import { getFirestoreConverter } from "../util/getConverter";

const useGetDocs = <T>(
  params: GetDocKeyParams<T> | null,
  swrOptions?: Omit<Parameters<SWRHook>[2], "fetcher">
) => {
  const fetcher = async (
    key: GetDocKeyParams<T>
  ): Promise<DocumentData<T>[] | undefined> => {
    const { path, ...option } = key;
    const converter = getFirestoreConverter<T>(option?.parseDates);
    const ref = collection(getFirestore(), path);
    let q;
    if (option) {
      const { where: w, orderBy: o, limit: l } = option;
      q = query(
        ref,
        ...(w ? w : []).map((q) => where(...q)),
        ...(o ? o : []).map((q) => orderBy(...q)),
        ...(l ? [limit(l)] : [])
      );
    }
    const getFn = option.useOfflineCache ? getDocsFromCache : getDocs;
    const sn = await getFn((q ?? ref).withConverter(converter));
    return sn.docs.map((x) => x.data());
  };
  return useSWR(params, fetcher, swrOptions);
};
export default useGetDocs;
