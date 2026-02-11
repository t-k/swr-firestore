import { doc, getDoc, getDocFromCache, getFirestore } from "firebase/firestore";
import type { DocumentData, KeyParams } from "../util/type";
import { getFirestoreConverter } from "../util/getConverter";

export type FetchDocParams<T> = Omit<
  KeyParams<T>,
  "where" | "orderBy" | "limit"
> & {
  useOfflineCache?: boolean;
};

/**
 * Fetch a single document from Firestore (client-side).
 *
 * @example
 * ```typescript
 * interface City {
 *   name: string;
 *   population: number;
 * }
 *
 * const city = await fetchDoc<City>({
 *   path: "cities/tokyo",
 *   parseDates: ["createdAt"],
 * });
 * ```
 */
const fetchDoc = async <T>(
  params: FetchDocParams<T>
): Promise<DocumentData<T> | undefined> => {
  const { path, parseDates, useOfflineCache, db: externalDb } = params;
  const db = externalDb ?? getFirestore();
  const converter = getFirestoreConverter<T>(parseDates);
  const ref = doc(db, path);
  const getFn = useOfflineCache ? getDocFromCache : getDoc;
  const sn = await getFn(ref.withConverter(converter));
  return sn.data();
};

export default fetchDoc;
