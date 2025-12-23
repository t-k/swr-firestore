import {
  collectionGroup,
  getDocs,
  getDocsFromCache,
  getFirestore,
} from "firebase/firestore";
import type { DocumentData, KeyParamsForCollectionGroup } from "../util/type";
import { getFirestoreConverter } from "../util/getConverter";
import { buildQueryForCollectionGroup } from "../util/buildQuery";

export type FetchCollectionGroupParams<T> = KeyParamsForCollectionGroup<T> & {
  useOfflineCache?: boolean;
};

/**
 * Fetch documents from a collection group (client-side).
 *
 * @example
 * ```typescript
 * interface Comment {
 *   text: string;
 *   authorId: string;
 * }
 *
 * // Fetch all "comments" subcollections across all documents
 * const comments = await fetchCollectionGroup<Comment>({
 *   path: "comments",
 *   where: [["authorId", "==", "user123"]],
 *   limit: 10,
 * });
 * ```
 */
const fetchCollectionGroup = async <T>(
  params: FetchCollectionGroupParams<T>
): Promise<DocumentData<T>[]> => {
  const { path, parseDates, useOfflineCache } = params;
  const converter = getFirestoreConverter<T>(parseDates);
  const ref = collectionGroup(getFirestore(), path);
  const q = buildQueryForCollectionGroup(ref, params);
  const getFn = useOfflineCache ? getDocsFromCache : getDocs;
  const sn = await getFn(q.withConverter(converter));
  return sn.docs.map((x) => x.data());
};

export default fetchCollectionGroup;
