import type { SWRConfiguration } from "swr";
import type { QueryConstraint } from "firebase/firestore";
import type { KeyParamsForCount } from "../util/type";
import useSWR from "swr";
import {
  collection,
  documentId,
  endAt,
  endBefore,
  getCountFromServer,
  getFirestore,
  limit,
  limitToLast,
  orderBy,
  query,
  startAfter,
  startAt,
  where,
} from "firebase/firestore";
import { isQueryConstraintParams } from "../util/typeGuard";
import serializeMiddleware from "../middleware/serializeMiddleware";

const useCollectionCount = <T>(
  params: KeyParamsForCount<T> | null,
  swrOptions?: Omit<SWRConfiguration, "fetcher">
) => {
  const fetcher = async () => {
    if (params == null) {
      return;
    }
    const { path } = params;
    const ref = collection(getFirestore(), path);
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
        ...(w ? w : []).map((q) =>
          q[0] === "id" ? where(documentId(), q[1], q[2]) : where(...q)
        ),
        ...(o ? o : []).map((q) =>
          q[0] === "id" ? orderBy(documentId(), q[1]) : orderBy(...q)
        ),
        ...(s ? [startAt(...(Array.isArray(s) ? s : [s]))] : []),
        ...(sa ? [startAfter(...(Array.isArray(sa) ? sa : [sa]))] : []),
        ...(e ? [endAt(...(Array.isArray(e) ? e : [e]))] : []),
        ...(eb ? [endBefore(...(Array.isArray(eb) ? eb : [eb]))] : []),
        ...(l ? [limit(l)] : []),
        ...(ltl ? [limitToLast(ltl)] : [])
      );
    }
    const sn = await getCountFromServer(q);
    return sn.data().count;
  };
  return useSWR(params != null && { ...params, count: true }, fetcher, {
    ...swrOptions,
    use: [serializeMiddleware, ...(swrOptions?.use ?? [])],
  });
};
export default useCollectionCount;
