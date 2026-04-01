import { getFirestore } from "firebase-admin/firestore";
import type { DocumentData, KeyParams } from "../util/type.js";
import { getFirestoreConverter } from "../util/getConverter.js";
import { buildQueryForCollection } from "../util/buildQuery.js";
import createSwrKey from "../util/createKey.js";

const getCollection = async <T>(
  params: KeyParams<T>,
): Promise<{
  key: string;
  data: DocumentData<T>[];
}> => {
  const { path, parseDates, db: externalDb } = params;
  const db = externalDb ?? getFirestore();
  const converter = getFirestoreConverter<T>(parseDates);
  const collectionRef = db.collection(path);
  const q = buildQueryForCollection(collectionRef, params);
  const sn = await q.withConverter(converter).get();
  return {
    key: createSwrKey(params),
    data: sn.docs.map((x) => x.data()),
  };
};
export default getCollection;
