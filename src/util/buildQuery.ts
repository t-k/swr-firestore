import type {
  Query,
  CollectionReference,
  QueryConstraint,
} from "firebase/firestore";
import {
  documentId,
  endAt,
  endBefore,
  limit,
  limitToLast,
  orderBy,
  query,
  startAfter,
  startAt,
  where,
} from "firebase/firestore";
import type {
  QueryParams,
  QueryParamsForCollectionGroup,
  QueryConstraintParams,
} from "./type";

/**
 * Type guard for QueryConstraintParams
 */
const hasQueryConstraints = <T>(
  params: QueryParams<T> | QueryParamsForCollectionGroup<T> | QueryConstraintParams
): params is QueryConstraintParams => {
  return "queryConstraints" in params && params.queryConstraints != null;
};

/**
 * Build query for Collection
 * - Converts "id" to documentId()
 */
export const buildQueryForCollection = <T>(
  ref: CollectionReference,
  params: QueryParams<T> | QueryConstraintParams
): Query => {
  if (hasQueryConstraints(params)) {
    return query(ref, ...(params.queryConstraints as QueryConstraint[]));
  }

  const {
    where: w,
    orderBy: o,
    startAt: s,
    startAfter: sa,
    endAt: e,
    endBefore: eb,
    limit: l,
    limitToLast: ltl,
  } = params as QueryParams<T>;

  return query(
    ref,
    ...(w ? w : []).map((q) =>
      q[0] === "id" ? where(documentId(), q[1], q[2]) : where(q[0], q[1], q[2])
    ),
    ...(o ? o : []).map((q) =>
      q[0] === "id" ? orderBy(documentId(), q[1]) : orderBy(q[0], q[1])
    ),
    ...(s ? [startAt(...(Array.isArray(s) ? s : [s]))] : []),
    ...(sa ? [startAfter(...(Array.isArray(sa) ? sa : [sa]))] : []),
    ...(e ? [endAt(...(Array.isArray(e) ? e : [e]))] : []),
    ...(eb ? [endBefore(...(Array.isArray(eb) ? eb : [eb]))] : []),
    ...(l ? [limit(l)] : []),
    ...(ltl ? [limitToLast(ltl)] : [])
  );
};

/**
 * Build query for CollectionGroup
 * - Does NOT convert "id" to documentId() (not supported in CollectionGroup)
 */
export const buildQueryForCollectionGroup = <T>(
  ref: Query,
  params: QueryParamsForCollectionGroup<T> | QueryConstraintParams
): Query => {
  if (hasQueryConstraints(params)) {
    return query(ref, ...(params.queryConstraints as QueryConstraint[]));
  }

  const {
    where: w,
    orderBy: o,
    startAt: s,
    startAfter: sa,
    endAt: e,
    endBefore: eb,
    limit: l,
    limitToLast: ltl,
  } = params as QueryParamsForCollectionGroup<T>;

  return query(
    ref,
    ...(w ? w : []).map((q) => where(q[0], q[1], q[2])),
    ...(o ? o : []).map((q) => orderBy(q[0], q[1])),
    ...(s ? [startAt(...(Array.isArray(s) ? s : [s]))] : []),
    ...(sa ? [startAfter(...(Array.isArray(sa) ? sa : [sa]))] : []),
    ...(e ? [endAt(...(Array.isArray(e) ? e : [e]))] : []),
    ...(eb ? [endBefore(...(Array.isArray(eb) ? eb : [eb]))] : []),
    ...(l ? [limit(l)] : []),
    ...(ltl ? [limitToLast(ltl)] : [])
  );
};
