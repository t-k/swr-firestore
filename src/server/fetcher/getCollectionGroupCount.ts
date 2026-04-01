import { getFirestore } from "firebase-admin/firestore";
import type { KeyParamsForCollectionGroupCount } from "../util/type.js";
import { buildQueryForCollectionGroup } from "../util/buildQuery.js";
import createSwrKey from "../util/createKey.js";

const getCollectionGroupCount = async <T>(
  params: KeyParamsForCollectionGroupCount<T>,
): Promise<{
  key: string;
  data: number;
}> => {
  const { path, db: externalDb } = params;
  const db = externalDb ?? getFirestore();
  const collectionGroupRef = db.collectionGroup(path);
  const q = buildQueryForCollectionGroup(collectionGroupRef, params);
  const sn = await q.count().get();
  return {
    key: createSwrKey({ ...params, count: true }),
    data: sn.data().count,
  };
};
export default getCollectionGroupCount;
