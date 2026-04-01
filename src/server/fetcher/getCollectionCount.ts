import { getFirestore } from "firebase-admin/firestore";
import type { KeyParamsForCount } from "../util/type.js";
import { buildQueryForCollection } from "../util/buildQuery.js";
import createSwrKey from "../util/createKey.js";

const getCollectionCount = async <T>(
  params: KeyParamsForCount<T>,
): Promise<{
  key: string;
  data: number;
}> => {
  const { path, db: externalDb } = params;
  const db = externalDb ?? getFirestore();
  const collectionRef = db.collection(path);
  const q = buildQueryForCollection(collectionRef, params);
  const sn = await q.count().get();
  return {
    key: createSwrKey({ ...params, count: true }),
    data: sn.data().count,
  };
};
export default getCollectionCount;
