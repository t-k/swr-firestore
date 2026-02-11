import { getFirestore } from "firebase-admin/firestore";
import type { DocumentData, KeyParams } from "../util/type.js";
import { getFirestoreConverter } from "../util/getConverter.js";
import createSwrKey from "../util/createKey.js";

const getDoc = async <T>(
  params: Omit<KeyParams<T>, "where" | "orderBy" | "limit">
): Promise<{
  key: string;
  data: DocumentData<T> | undefined;
}> => {
  const { path, parseDates, db: externalDb } = params;
  const db = externalDb ?? getFirestore();
  const converter = getFirestoreConverter<T>(parseDates);
  const docRef = db.doc(path).withConverter(converter);
  const sn = await docRef.get();
  return { key: createSwrKey(params), data: sn.data() };
};
export default getDoc;
