import type { SWRConfiguration } from "swr";
import type { QueryConstraint } from "firebase/firestore";
import type { DocumentData, Falsy, GetDocKeyParams } from "../util/type";
import useSWR from "swr";
import {
  collection,
  collectionGroup,
  documentId,
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
import { scrubKey } from "../util/scrubKey";
import { isQueryConstraintParams } from "../util/typeGuard";
import serializeMiddleware from "../middleware/serializeMiddleware";

const useGetDocs = <T>(
  params: (GetDocKeyParams<T> & { isCollectionGroup?: boolean }) | Falsy,
  swrOptions?: Omit<SWRConfiguration, "fetcher">,
) => {
  const fetcher = async (): Promise<DocumentData<T>[] | undefined> => {
    if (!params) {
      return;
    }
    const { path, parseDates, isCollectionGroup, db } = params;
    const converter = getFirestoreConverter<T>(parseDates);
    const ref = isCollectionGroup
      ? collectionGroup(db ?? getFirestore(), path)
      : collection(db ?? getFirestore(), path);
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
        ...(w ? w : []).map((q) => (q[0] === "id" ? where(documentId(), q[1], q[2]) : where(...q))),
        ...(o ? o : []).map((q) => (q[0] === "id" ? orderBy(documentId(), q[1]) : orderBy(...q))),
        ...(s ? [startAt(...(Array.isArray(s) ? s : [s]))] : []),
        ...(sa ? [startAfter(...(Array.isArray(sa) ? sa : [sa]))] : []),
        ...(e ? [endAt(...(Array.isArray(e) ? e : [e]))] : []),
        ...(eb ? [endBefore(...(Array.isArray(eb) ? eb : [eb]))] : []),
        ...(l ? [limit(l)] : []),
        ...(ltl ? [limitToLast(ltl)] : []),
      );
    }
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
