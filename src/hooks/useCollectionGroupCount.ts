import type { SWRConfiguration } from "swr";
import type { QueryConstraint } from "firebase/firestore";
import type { Falsy, KeyParamsForCollectionGroupCount } from "../util/type";
import useSWR from "swr";
import {
  collectionGroup,
  endAt,
  endBefore,
  getCountFromServer,
  getFirestore,
  startAfter,
  startAt,
  limit,
  limitToLast,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { isQueryConstraintParams } from "../util/typeGuard";
import serializeMiddleware from "../middleware/serializeMiddleware";

const useCollectionGroupCount = <T>(
  params: KeyParamsForCollectionGroupCount<T> | Falsy,
  swrOptions?: Omit<SWRConfiguration, "fetcher">
) => {
  const fetcher = async () => {
    if (!params) {
      return;
    }
    const { path, db } = params;
    const ref = collectionGroup(db ?? getFirestore(), path);
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
    const sn = await getCountFromServer(q);
    return sn.data().count;
  };
  return useSWR(params && { ...params, count: true }, fetcher, {
    ...swrOptions,
    use: [serializeMiddleware, ...(swrOptions?.use ?? [])],
  });
};
export default useCollectionGroupCount;
