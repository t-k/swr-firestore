import type { FirestoreDataConverter, QueryDocumentSnapshot } from "firebase/firestore";
import type { DocumentData } from "./type";
import get from "lodash/get";
import set from "lodash/fp/set";

const formatTimestamp = (obj: object, props?: string[]): object => {
  if (props == null) return obj;
  return props.reduce((result: object, prop: string) => {
    const value = get(obj, prop);
    return set(prop, value != null && value.toDate ? value.toDate() : value, result);
  }, obj);
};

export const getFirestoreConverter = <T>(
  parseDates?: Extract<keyof T, string>[]
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
