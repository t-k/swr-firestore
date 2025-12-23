import { getFirestore } from "firebase-admin/firestore";
import type { Query, Transaction } from "firebase-admin/firestore";
import type { KeyParamsForCollectionGroupCount } from "../util/type.js";

/**
 * Type-safe collection group count fetcher for use within Firestore transactions.
 *
 * @example
 * ```typescript
 * await db.runTransaction(async (t) => {
 *   const count = await getCollectionGroupCountInTx<Comment>(t, {
 *     path: "comments",
 *     where: [["status", "==", "approved"]],
 *   });
 *   // count is number
 * });
 * ```
 */
const getCollectionGroupCountInTx = async <T>(
  transaction: Transaction,
  params: KeyParamsForCollectionGroupCount<T>
): Promise<number> => {
  const { path } = params;
  const db = getFirestore();
  const collectionRef = db.collectionGroup(path);
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
      queryRef = (queryRef ?? collectionRef).where(...q);
    });
  }
  if (o) {
    o.forEach((q) => {
      queryRef = (queryRef ?? collectionRef).orderBy(...q);
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
  const sn = await transaction.get((queryRef ?? collectionRef).count());
  return sn.data().count;
};

export default getCollectionGroupCountInTx;
