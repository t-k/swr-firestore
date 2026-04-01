import { getFirestore } from "firebase-admin/firestore";
import type { Transaction } from "firebase-admin/firestore";
import type { KeyParamsForCount } from "../util/type.js";
import { buildQueryForCollection } from "../util/buildQuery.js";

/**
 * Type-safe collection count fetcher for use within Firestore transactions.
 *
 * @example
 * ```typescript
 * await db.runTransaction(async (t) => {
 *   const count = await getCollectionCountInTx<City>(t, {
 *     path: "cities",
 *     where: [["population", ">", 1000000]],
 *   });
 *   // count is number
 * });
 * ```
 */
const getCollectionCountInTx = async <T>(
  transaction: Transaction,
  params: KeyParamsForCount<T>,
): Promise<number> => {
  const { path, db: externalDb } = params;
  const db = externalDb ?? getFirestore();
  const collectionRef = db.collection(path);
  const q = buildQueryForCollection(collectionRef, params);
  const sn = await transaction.get(q.count());
  return sn.data().count;
};

export default getCollectionCountInTx;
