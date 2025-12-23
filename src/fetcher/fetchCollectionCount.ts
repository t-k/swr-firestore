import { collection, getCountFromServer, getFirestore } from "firebase/firestore";
import type { KeyParamsForCount } from "../util/type";
import { buildQueryForCollection } from "../util/buildQuery";

/**
 * Fetch count of documents in a collection (client-side).
 *
 * @example
 * ```typescript
 * interface City {
 *   name: string;
 *   population: number;
 * }
 *
 * const count = await fetchCollectionCount<City>({
 *   path: "cities",
 *   where: [["population", ">", 1000000]],
 * });
 * ```
 */
const fetchCollectionCount = async <T>(
  params: KeyParamsForCount<T>
): Promise<number> => {
  const { path } = params;
  const ref = collection(getFirestore(), path);
  const q = buildQueryForCollection(ref, params);
  const sn = await getCountFromServer(q);
  return sn.data().count;
};

export default fetchCollectionCount;
