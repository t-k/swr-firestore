import type { FirestoreDataConverter, QueryDocumentSnapshot } from "firebase-admin/firestore";
import type { DocumentData } from "./type.js";
import { getByPath, setByPath } from "../../util/path.js";

const formatTimestamp = (obj: object, props?: string[]): object => {
  if (props == null) return obj;
  return props.reduce((result: object, prop: string) => {
    const value = getByPath(obj, prop);
    return setByPath(result, prop, value != null && value.toDate ? value.toDate() : value);
  }, obj);
};

export const getFirestoreConverter = <T>(
  parseDates?: (Extract<keyof T, string> | string)[],
): FirestoreDataConverter<DocumentData<T>> => ({
  fromFirestore(snapshot: QueryDocumentSnapshot) {
    const data = snapshot.data();
    return {
      ...formatTimestamp(data, parseDates),
      ref: snapshot.ref,
      exists: snapshot.exists,
      id: snapshot.id,
    } as DocumentData<T>;
  },
  toFirestore(model: DocumentData<T>) {
    return model;
  },
});
