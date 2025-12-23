import { doc, getFirestore } from "firebase/firestore";
import type { Transaction } from "firebase/firestore";
import type { DocumentData, KeyParams } from "../util/type";
import { getFirestoreConverter } from "../util/getConverter";

/**
 * Type-safe document fetcher for use within Firestore transactions (client-side).
 *
 * @example
 * ```typescript
 * import { getFirestore, runTransaction } from "firebase/firestore";
 *
 * interface City {
 *   name: string;
 *   population: number;
 * }
 *
 * const db = getFirestore();
 * await runTransaction(db, async (t) => {
 *   const city = await fetchDocInTx<City>(t, {
 *     path: "cities/tokyo",
 *     parseDates: ["createdAt"],
 *   });
 *   // city is DocumentData<City> | undefined
 * });
 * ```
 */
const fetchDocInTx = async <T>(
  transaction: Transaction,
  params: Omit<KeyParams<T>, "where" | "orderBy" | "limit">
): Promise<DocumentData<T> | undefined> => {
  const { path, parseDates } = params;
  const db = getFirestore();
  const converter = getFirestoreConverter<T>(parseDates);
  const docRef = doc(db, path).withConverter(converter);
  const sn = await transaction.get(docRef);
  return sn.data();
};

export default fetchDocInTx;
