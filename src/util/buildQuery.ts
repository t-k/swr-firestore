import type { Query, CollectionReference, QueryConstraint } from "firebase/firestore";
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
import type { QueryParams, QueryParamsForCollectionGroup, QueryConstraintParams } from "./type";

/**
 * Type guard for QueryConstraintParams
 */
const hasQueryConstraints = <T>(
  params: QueryParams<T> | QueryParamsForCollectionGroup<T> | QueryConstraintParams,
): params is QueryConstraintParams => {
  return "queryConstraints" in params && params.queryConstraints != null;
};

const assertPositiveLimit = (name: "limit" | "limitToLast", value: number | undefined): void => {
  if (value != null && value <= 0) {
    throw new RangeError(`${name} must be greater than 0`);
  }
};

/**
 * Build query for Collection
 * - Converts "id" to documentId()
 */
export const buildQueryForCollection = <T>(
  ref: CollectionReference,
  params: QueryParams<T> | QueryConstraintParams,
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

  assertPositiveLimit("limit", l);
  assertPositiveLimit("limitToLast", ltl);

  return query(
    ref,
    ...(w ? w : []).map((q) =>
      q[0] === "id" ? where(documentId(), q[1], q[2]) : where(q[0], q[1], q[2]),
    ),
    ...(o ? o : []).map((q) => (q[0] === "id" ? orderBy(documentId(), q[1]) : orderBy(q[0], q[1]))),
    ...(s ? [startAt(...(Array.isArray(s) ? s : [s]))] : []),
    ...(sa ? [startAfter(...(Array.isArray(sa) ? sa : [sa]))] : []),
    ...(e ? [endAt(...(Array.isArray(e) ? e : [e]))] : []),
    ...(eb ? [endBefore(...(Array.isArray(eb) ? eb : [eb]))] : []),
    ...(l != null ? [limit(l)] : []),
    ...(ltl != null ? [limitToLast(ltl)] : []),
  );
};

/**
 * Build query for CollectionGroup
 * - Does NOT convert "id" to documentId() (not supported in CollectionGroup)
 */
export const buildQueryForCollectionGroup = <T>(
  ref: Query,
  params: QueryParamsForCollectionGroup<T> | QueryConstraintParams,
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

  assertPositiveLimit("limit", l);
  assertPositiveLimit("limitToLast", ltl);

  return query(
    ref,
    ...(w ? w : []).map((q) => where(q[0], q[1], q[2])),
    ...(o ? o : []).map((q) => orderBy(q[0], q[1])),
    ...(s ? [startAt(...(Array.isArray(s) ? s : [s]))] : []),
    ...(sa ? [startAfter(...(Array.isArray(sa) ? sa : [sa]))] : []),
    ...(e ? [endAt(...(Array.isArray(e) ? e : [e]))] : []),
    ...(eb ? [endBefore(...(Array.isArray(eb) ? eb : [eb]))] : []),
    ...(l != null ? [limit(l)] : []),
    ...(ltl != null ? [limitToLast(ltl)] : []),
  );
};
