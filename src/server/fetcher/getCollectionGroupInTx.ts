import { getFirestore } from "firebase-admin/firestore";
import type { Query, Transaction } from "firebase-admin/firestore";
import type {
  DocumentData,
  KeyParamsForCollectionGroup,
} from "../util/type.js";
import { getFirestoreConverter } from "../util/getConverter.js";

/**
 * Type-safe collection group fetcher for use within Firestore transactions.
 *
 * @example
 * ```typescript
 * interface Comment {
 *   text: string;
 *   authorId: string;
 * }
 *
 * await db.runTransaction(async (t) => {
 *   const comments = await getCollectionGroupInTx<Comment>(t, {
 *     path: "comments",
 *     where: [["authorId", "==", "user123"]],
 *     limit: 10,
 *   });
 *   // comments is DocumentData<Comment>[]
 * });
 * ```
 */
const getCollectionGroupInTx = async <T>(
  transaction: Transaction,
  params: KeyParamsForCollectionGroup<T>
): Promise<DocumentData<T>[]> => {
  const { path, parseDates } = params;
  const db = getFirestore();
  const converter = getFirestoreConverter<T>(parseDates);
  const collectionRef = db.collectionGroup(path).withConverter(converter);
  let queryRef: Query<DocumentData<T>> | null = null;
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
  const sn = await transaction.get(queryRef ?? collectionRef);
  return sn.docs.map((x) => x.data());
};

export default getCollectionGroupInTx;
