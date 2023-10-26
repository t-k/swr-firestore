import type { SWRConfiguration } from "swr";
import type { QueryConstraint } from "firebase/firestore";
import type { KeyParamsForCollectionGroupAggregate } from "../util/type";
import useSWR from "swr";
import {
  collectionGroup,
  endAt,
  endBefore,
  getAggregateFromServer,
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

const useCollectionGroupAggregation = <T>(
  params: KeyParamsForCollectionGroupAggregate<T> | null,
  swrOptions?: Omit<SWRConfiguration, "fetcher">
) => {
  const fetcher = async () => {
    if (params == null) {
      return;
    }
    const { path } = params;
    const ref = collectionGroup(getFirestore(), path);
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
    const sn = await getAggregateFromServer(q, params.aggregateSpec);
    return sn.data();
  };
  return useSWR(params != null && { ...params, aggregate: true }, fetcher, {
    ...swrOptions,
    use: [serializeMiddleware, ...(swrOptions?.use ?? [])],
  });
};
export default useCollectionGroupAggregation;
