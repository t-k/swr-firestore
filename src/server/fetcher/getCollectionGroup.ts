import { getFirestore } from "firebase-admin/firestore";
import type { Query } from "firebase-admin/firestore";
import type { DocumentData, KeyParams } from "../util/type.js";
import { getFirestoreConverter } from "../util/getConverter.js";
import createSwrKey from "../util/createKey.js";

const getCollectionGroup = async <T>(
  params: KeyParams<T>
): Promise<{
  key: string;
  data: DocumentData<T>[];
}> => {
  const { path, parseDates } = params;
  const db = getFirestore();
  const converter = getFirestoreConverter<T>(parseDates);
  const collectionRef = db.collectionGroup(path).withConverter(converter);
  let queryRef: Query<DocumentData<T>> | null = null;
  const {
    where: w,
    orderBy: o,
    startAt: s,
    startAfter: sa,
    endAt: e,
    endBefore: eb,
    limit: l,
  } = params;
  if (w) {
    w.forEach((q) => {
      queryRef = (queryRef ?? collectionRef).where(...q);
    });
  }
  if (o) {
    o.forEach((q) => {
      queryRef = (queryRef ?? collectionRef).orderBy(...q);
    });
  }
  if (s) {
    queryRef = (queryRef ?? collectionRef).startAt(
      ...(Array.isArray(s) ? s : [s])
    );
  }
  if (sa) {
    queryRef = (queryRef ?? collectionRef).startAfter(
      ...(Array.isArray(sa) ? sa : [sa])
    );
  }
  if (e) {
    queryRef = (queryRef ?? collectionRef).endAt(
      ...(Array.isArray(e) ? e : [e])
    );
  }
  if (eb) {
    queryRef = (queryRef ?? collectionRef).endBefore(
      ...(Array.isArray(eb) ? eb : [eb])
    );
  }
  if (l) {
    queryRef = (queryRef ?? collectionRef).limit(l);
  }
  const sn = await (queryRef ?? collectionRef).get();
  return {
    key: createSwrKey(params),
    data: sn.docs.map((x) => x.data()),
  };
};
export default getCollectionGroup;
