import type { SWRConfiguration } from "swr";
import type { CollectionReference } from "firebase/firestore";
import type {
  DocumentData,
  Falsy,
  GetDocKeyParams,
  QueryConstraintParams,
  QueryParamsForCollectionGroup,
} from "../util/type";
import useSWR from "swr";
import {
  collection,
  collectionGroup,
  getDocs,
  getDocsFromCache,
  getFirestore,
} from "firebase/firestore";
import { getFirestoreConverter } from "../util/getConverter";
import { scrubKey } from "../util/scrubKey";
import { buildQueryForCollection, buildQueryForCollectionGroup } from "../util/buildQuery";
import serializeMiddleware from "../middleware/serializeMiddleware";

const useGetDocs = <T>(
  params: (GetDocKeyParams<T> & { isCollectionGroup?: boolean }) | Falsy,
  swrOptions?: Omit<SWRConfiguration, "fetcher">,
) => {
  const fetcher = async (): Promise<DocumentData<T>[] | undefined> => {
    if (!params) {
      return;
    }
    const { path, parseDates, isCollectionGroup: isColGroup, db } = params;
    const converter = getFirestoreConverter<T>(parseDates);
    const ref = isColGroup
      ? collectionGroup(db ?? getFirestore(), path)
      : collection(db ?? getFirestore(), path);
    const q = isColGroup
      ? buildQueryForCollectionGroup(
          ref,
          params as QueryParamsForCollectionGroup<T> | QueryConstraintParams,
        )
      : buildQueryForCollection(ref as CollectionReference, params);
    const getFn = params.useOfflineCache ? getDocsFromCache : getDocs;
    const sn = await getFn(q.withConverter(converter));
    return sn.docs.map((x) => x.data());
  };
  return useSWR(scrubKey(params as Record<string, unknown> | Falsy), fetcher, {
    ...swrOptions,
    use: [serializeMiddleware, ...(swrOptions?.use ?? [])],
  });
};
export default useGetDocs;
