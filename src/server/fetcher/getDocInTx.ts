import { getFirestore } from "firebase-admin/firestore";
import type { Transaction } from "firebase-admin/firestore";
import type { DocumentData, KeyParams } from "../util/type.js";
import { getFirestoreConverter } from "../util/getConverter.js";

/**
 * Type-safe document fetcher for use within Firestore transactions.
 *
 * @example
 * ```typescript
 * interface City {
 *   name: string;
 *   population: number;
 * }
 *
 * await db.runTransaction(async (t) => {
 *   const city = await getDocInTx<City>(t, {
 *     path: "cities/tokyo",
 *     parseDates: ["createdAt"],
 *   });
 *   // city is DocumentData<City> | undefined
 * });
 * ```
 */
const getDocInTx = async <T>(
  transaction: Transaction,
  params: Omit<KeyParams<T>, "where" | "orderBy" | "limit">
): Promise<DocumentData<T> | undefined> => {
  const { path, parseDates } = params;
  const db = getFirestore();
  const converter = getFirestoreConverter<T>(parseDates);
  const docRef = db.doc(path).withConverter(converter);
  const sn = await transaction.get(docRef);
  return sn.data();
};

export default getDocInTx;
