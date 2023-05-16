import type { SWRConfiguration } from "swr";
import type { QueryConstraint } from "firebase/firestore";
import type { DocumentData, GetDocKeyParams } from "../util/type";
import useSWR from "swr";
import {
  collection,
  collectionGroup,
  endAt,
  endBefore,
  getDocs,
  getDocsFromCache,
  getFirestore,
  limit,
  limitToLast,
  orderBy,
  query,
  startAfter,
  startAt,
  where,
} from "firebase/firestore";
import { getFirestoreConverter } from "../util/getConverter";
import { isQueryConstraintParams } from "../util/typeGuard";
import serializeMiddleware from "../middleware/serializeMiddleware";

const useGetDocs = <T>(
  params: (GetDocKeyParams<T> & { isCollectionGroup?: boolean }) | null,
  swrOptions?: Omit<SWRConfiguration, "fetcher">
) => {
  const fetcher = async (): Promise<DocumentData<T>[] | undefined> => {
    if (params == null) {
      return;
    }
    const { path, parseDates, isCollectionGroup } = params;
    const converter = getFirestoreConverter<T>(parseDates);
    const ref = isCollectionGroup
      ? collectionGroup(getFirestore(), path)
      : collection(getFirestore(), path);
    let q;
    if (isQueryConstraintParams(params)) {
      q = query(ref, ...(params.queryConstraints as QueryConstraint[]));
    } else {
      const {
        where: w,
        orderBy: o,
        startAt: s,
        startAfter: sa,
        endAt: e,
        endBefore: eb,
        limit: l,
        limitToLast: ltl,
      } = params;
      q = query(
        ref,
        ...(w ? w : []).map((q) => where(...q)),
        ...(o ? o : []).map((q) => orderBy(...q)),
        ...(s ? [startAt(...(Array.isArray(s) ? s : [s]))] : []),
        ...(sa ? [startAfter(...(Array.isArray(sa) ? sa : [sa]))] : []),
        ...(e ? [endAt(...(Array.isArray(e) ? e : [e]))] : []),
        ...(eb ? [endBefore(...(Array.isArray(eb) ? eb : [eb]))] : []),
        ...(l ? [limit(l)] : []),
        ...(ltl ? [limitToLast(ltl)] : [])
      );
    }
    const getFn = params.useOfflineCache ? getDocsFromCache : getDocs;
    const sn = await getFn(q.withConverter(converter));
    return sn.docs.map((x) => x.data());
  };
  const scrubKey = (
    params: (GetDocKeyParams<T> & { isCollectionGroup?: boolean }) | null
  ) => {
    if (params == null) {
      return null;
    }
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      isCollectionGroup: _isCollectionGroup,
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
export default useGetDocs;
