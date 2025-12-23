import { FieldPath } from "firebase-admin/firestore";
import type {
  CollectionReference,
  CollectionGroup,
  Query,
} from "firebase-admin/firestore";
import type {
  QueryParams,
  QueryParamsForCollectionGroup,
} from "./type.js";

/**
 * Build query for Collection (Admin SDK)
 * - Converts "id" to FieldPath.documentId()
 */
export const buildQueryForCollection = <T>(
  collectionRef: CollectionReference,
  params: QueryParams<T>
): Query => {
  let queryRef: Query | null = null;
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

  if (w) {
    w.forEach((q) => {
      queryRef =
        q[0] === "id"
          ? (queryRef ?? collectionRef).where(
              FieldPath.documentId(),
              q[1],
              q[2]
            )
          : (queryRef ?? collectionRef).where(...q);
    });
  }
  if (o) {
    o.forEach((q) => {
      queryRef =
        q[0] === "id"
          ? (queryRef ?? collectionRef).orderBy(FieldPath.documentId(), q[1])
          : (queryRef ?? collectionRef).orderBy(...q);
    });
  }
  if (s) {
    queryRef = (queryRef ?? collectionRef).startAt(
      ...(Array.isArray(s) ? s : [s])
    );
  }
  if (sa) {
    queryRef = (queryRef ?? collectionRef).startAfter(
      ...(Array.isArray(sa) ? sa : [sa])
    );
  }
  if (e) {
    queryRef = (queryRef ?? collectionRef).endAt(
      ...(Array.isArray(e) ? e : [e])
    );
  }
  if (eb) {
    queryRef = (queryRef ?? collectionRef).endBefore(
      ...(Array.isArray(eb) ? eb : [eb])
    );
  }
  if (l) {
    queryRef = (queryRef ?? collectionRef).limit(l);
  }
  if (ltl) {
    queryRef = (queryRef ?? collectionRef).limitToLast(ltl);
  }

  return queryRef ?? collectionRef;
};

/**
 * Build query for CollectionGroup (Admin SDK)
 * - Does NOT convert "id" to documentId()
 */
export const buildQueryForCollectionGroup = <T>(
  collectionGroupRef: CollectionGroup,
  params: QueryParamsForCollectionGroup<T>
): Query => {
  let queryRef: Query | null = null;
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

  if (w) {
    w.forEach((q) => {
      queryRef = (queryRef ?? collectionGroupRef).where(...q);
    });
  }
  if (o) {
    o.forEach((q) => {
      queryRef = (queryRef ?? collectionGroupRef).orderBy(...q);
    });
  }
  if (s) {
    queryRef = (queryRef ?? collectionGroupRef).startAt(
      ...(Array.isArray(s) ? s : [s])
    );
  }
  if (sa) {
    queryRef = (queryRef ?? collectionGroupRef).startAfter(
      ...(Array.isArray(sa) ? sa : [sa])
    );
  }
  if (e) {
    queryRef = (queryRef ?? collectionGroupRef).endAt(
      ...(Array.isArray(e) ? e : [e])
    );
  }
  if (eb) {
    queryRef = (queryRef ?? collectionGroupRef).endBefore(
      ...(Array.isArray(eb) ? eb : [eb])
    );
  }
  if (l) {
    queryRef = (queryRef ?? collectionGroupRef).limit(l);
  }
  if (ltl) {
    queryRef = (queryRef ?? collectionGroupRef).limitToLast(ltl);
  }

  return queryRef ?? collectionGroupRef;
};
