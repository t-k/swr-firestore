import type { SWRConfiguration } from "swr";
import type { QueryConstraint } from "firebase/firestore";
import type { DocumentData, GetDocKeyParams } from "../util/type";
import useSWR from "swr";
import {
  collection,
  getDocs,
  getDocsFromCache,
  getFirestore,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { getFirestoreConverter } from "../util/getConverter";
import { isQueryConstraintParams } from "../util/typeGuard";
import serializeMiddleware from "../middleware/serializeMiddleware";

const useGetDocs = <T>(
  params: GetDocKeyParams<T> | null,
  swrOptions?: Omit<SWRConfiguration, "fetcher">
) => {
  let swrKey = params;
  if (params != null && isQueryConstraintParams(params)) {
    swrKey = JSON.parse(JSON.stringify(params));
  }
  const fetcher = async (): Promise<DocumentData<T>[] | undefined> => {
    if (params == null) {
      return;
    }
    const { path, parseDates } = params;
    const converter = getFirestoreConverter<T>(parseDates);
    const ref = collection(getFirestore(), path);
    let q;
    if (isQueryConstraintParams(params)) {
      q = query(ref, ...(params.queryConstraints as QueryConstraint[]));
    } else {
      const { where: w, orderBy: o, limit: l } = params;
      q = query(
        ref,
        ...(w ? w : []).map((q) => where(...q)),
        ...(o ? o : []).map((q) => orderBy(...q)),
        ...(l ? [limit(l)] : [])
      );
    }
    const getFn = params.useOfflineCache ? getDocsFromCache : getDocs;
    const sn = await getFn(q.withConverter(converter));
    return sn.docs.map((x) => x.data());
  };
  return useSWR(swrKey, fetcher, {
    ...swrOptions,
    use: [serializeMiddleware, ...(swrOptions?.use ?? [])],
  });
};
export default useGetDocs;
