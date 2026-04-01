import { getFirestore } from "firebase-admin/firestore";
import type { Transaction } from "firebase-admin/firestore";
import type { DocumentData, KeyParams } from "../util/type.js";
import { getFirestoreConverter } from "../util/getConverter.js";
import { buildQueryForCollection } from "../util/buildQuery.js";

/**
 * Type-safe collection fetcher for use within Firestore transactions.
 *
 * @example
 * ```typescript
 * interface City {
 *   name: string;
 *   population: number;
 * }
 *
 * await db.runTransaction(async (t) => {
 *   const cities = await getCollectionInTx<City>(t, {
 *     path: "cities",
 *     where: [["population", ">", 1000000]],
 *     orderBy: [["population", "desc"]],
 *     limit: 10,
 *   });
 *   // cities is DocumentData<City>[]
 * });
 * ```
 */
const getCollectionInTx = async <T>(
  transaction: Transaction,
  params: KeyParams<T>,
): Promise<DocumentData<T>[]> => {
  const { path, parseDates, db: externalDb } = params;
  const db = externalDb ?? getFirestore();
  const converter = getFirestoreConverter<T>(parseDates);
  const collectionRef = db.collection(path);
  const q = buildQueryForCollection(collectionRef, params);
  const sn = await transaction.get(q.withConverter(converter));
  return sn.docs.map((x) => x.data());
};

export default getCollectionInTx;
