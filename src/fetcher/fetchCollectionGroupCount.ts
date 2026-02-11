import {
  collectionGroup,
  getCountFromServer,
  getFirestore,
} from "firebase/firestore";
import type { KeyParamsForCollectionGroupCount } from "../util/type";
import { buildQueryForCollectionGroup } from "../util/buildQuery";

/**
 * Fetch count of documents in a collection group (client-side).
 *
 * @example
 * ```typescript
 * interface Comment {
 *   text: string;
 *   authorId: string;
 * }
 *
 * // Count all "comments" subcollections across all documents
 * const count = await fetchCollectionGroupCount<Comment>({
 *   path: "comments",
 *   where: [["status", "==", "approved"]],
 * });
 * ```
 */
const fetchCollectionGroupCount = async <T>(
  params: KeyParamsForCollectionGroupCount<T>
): Promise<number> => {
  const { path, db: externalDb } = params;
  const db = externalDb ?? getFirestore();
  const ref = collectionGroup(db, path);
  const q = buildQueryForCollectionGroup(ref, params);
  const sn = await getCountFromServer(q);
  return sn.data().count;
};

export default fetchCollectionGroupCount;
