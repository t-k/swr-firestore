import { getFirestore, FieldPath } from "firebase-admin/firestore";
import type { Query } from "firebase-admin/firestore";
import type { KeyParamsForCount } from "../util/type.js";
import createSwrKey from "../util/createKey.js";

const getCollectionCount = async <T>(
  params: KeyParamsForCount<T>
): Promise<{
  key: string;
  data: number;
}> => {
  const { path } = params;
  const db = getFirestore();
  const collectionRef = db.collection(path);
  let queryRef: Query | null = null;
  const {
    where: w,
    orderBy: o,
    startAt: s,
    startAfter: sa,
    endAt: e,
    endBefore: eb,
    limit: l,
    limitToLast: ltl,
  } = params;
  if (w) {
    w.forEach((q) => {
      queryRef =
        q[0] === "id"
          ? (queryRef ?? collectionRef).where(
              FieldPath.documentId(),
              q[1],
              q[2]
            )
          : (queryRef ?? collectionRef).where(...q);
    });
  }
  if (o) {
    o.forEach((q) => {
      queryRef =
        q[0] === "id"
          ? (queryRef ?? collectionRef).orderBy(FieldPath.documentId(), q[1])
          : (queryRef ?? collectionRef).orderBy(...q);
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
  if (ltl) {
    queryRef = (queryRef ?? collectionRef).limitToLast(ltl);
  }
  const sn = await (queryRef ?? collectionRef).count().get();
  return {
    key: createSwrKey({ ...params, count: true }),
    data: sn.data().count,
  };
};
export default getCollectionCount;
