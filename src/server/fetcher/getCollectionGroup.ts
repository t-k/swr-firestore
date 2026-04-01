import { getFirestore } from "firebase-admin/firestore";
import type { DocumentData, KeyParamsForCollectionGroup } from "../util/type.js";
import { getFirestoreConverter } from "../util/getConverter.js";
import { buildQueryForCollectionGroup } from "../util/buildQuery.js";
import createSwrKey from "../util/createKey.js";

const getCollectionGroup = async <T>(
  params: KeyParamsForCollectionGroup<T>,
): Promise<{
  key: string;
  data: DocumentData<T>[];
}> => {
  const { path, parseDates, db: externalDb } = params;
  const db = externalDb ?? getFirestore();
  const converter = getFirestoreConverter<T>(parseDates);
  const collectionGroupRef = db.collectionGroup(path);
  const q = buildQueryForCollectionGroup(collectionGroupRef, params);
  const sn = await q.withConverter(converter).get();
  return {
    key: createSwrKey(params),
    data: sn.docs.map((x) => x.data()),
  };
};
export default getCollectionGroup;
