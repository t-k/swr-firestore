import {
  collection,
  getDocs,
  getDocsFromCache,
  getFirestore,
} from "firebase/firestore";
import type { DocumentData, KeyParams } from "../util/type";
import { getFirestoreConverter } from "../util/getConverter";
import { buildQueryForCollection } from "../util/buildQuery";

export type FetchCollectionParams<T> = KeyParams<T> & {
  useOfflineCache?: boolean;
};

/**
 * Fetch documents from a collection (client-side).
 *
 * @example
 * ```typescript
 * interface City {
 *   name: string;
 *   population: number;
 * }
 *
 * const cities = await fetchCollection<City>({
 *   path: "cities",
 *   where: [["population", ">", 1000000]],
 *   orderBy: [["population", "desc"]],
 *   limit: 10,
 * });
 * ```
 */
const fetchCollection = async <T>(
  params: FetchCollectionParams<T>
): Promise<DocumentData<T>[]> => {
  const { path, parseDates, useOfflineCache } = params;
  const converter = getFirestoreConverter<T>(parseDates);
  const ref = collection(getFirestore(), path);
  const q = buildQueryForCollection(ref, params);
  const getFn = useOfflineCache ? getDocsFromCache : getDocs;
  const sn = await getFn(q.withConverter(converter));
  return sn.docs.map((x) => x.data());
};

export default fetchCollection;
