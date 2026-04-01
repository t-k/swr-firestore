import { getFirestore } from "firebase-admin/firestore";
import type { Transaction } from "firebase-admin/firestore";
import type { DocumentData, KeyParamsForCollectionGroup } from "../util/type.js";
import { getFirestoreConverter } from "../util/getConverter.js";
import { buildQueryForCollectionGroup } from "../util/buildQuery.js";

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
  params: KeyParamsForCollectionGroup<T>,
): Promise<DocumentData<T>[]> => {
  const { path, parseDates, db: externalDb } = params;
  const db = externalDb ?? getFirestore();
  const converter = getFirestoreConverter<T>(parseDates);
  const collectionGroupRef = db.collectionGroup(path);
  const q = buildQueryForCollectionGroup(collectionGroupRef, params);
  const sn = await transaction.get(q.withConverter(converter));
  return sn.docs.map((x) => x.data());
};

export default getCollectionGroupInTx;
