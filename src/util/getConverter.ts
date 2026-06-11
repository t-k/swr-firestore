import type {
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from "firebase/firestore";
import type { DocumentData } from "./type";
import { getByPath, setByPath } from "./path";

const formatTimestamp = (obj: object, props?: string[]): object => {
  if (props == null) return obj;
  return props.reduce((result, prop: string) => {
    const value = getByPath(result, prop);
    if (value === undefined) return result;
    const converted =
      value != null && typeof value === "object" && "toDate" in value
        ? (value as { toDate: () => Date }).toDate()
        : value;
    return setByPath(result as Record<string, unknown>, prop, converted);
  }, obj);
};

export const getFirestoreConverter = <T>(
  parseDates?: (Extract<keyof T, string> | string)[],
): FirestoreDataConverter<DocumentData<T>> => ({
  fromFirestore(snapshot: QueryDocumentSnapshot, options?: SnapshotOptions) {
    const data = snapshot.data(options);
    return {
      ...formatTimestamp(data, parseDates),
      ref: snapshot.ref,
      exists: true,
      id: snapshot.id,
    } as DocumentData<T>;
  },
  toFirestore(model: DocumentData<T>) {
    return model;
  },
});
