import { getFirestore } from "firebase-admin/firestore";
import type { Transaction } from "firebase-admin/firestore";
import type { KeyParamsForCollectionGroupCount } from "../util/type.js";
import { buildQueryForCollectionGroup } from "../util/buildQuery.js";

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
  params: KeyParamsForCollectionGroupCount<T>,
): Promise<number> => {
  const { path, db: externalDb } = params;
  const db = externalDb ?? getFirestore();
  const collectionGroupRef = db.collectionGroup(path);
  const q = buildQueryForCollectionGroup(collectionGroupRef, params);
  const sn = await transaction.get(q.count());
  return sn.data().count;
};

export default getCollectionGroupCountInTx;
