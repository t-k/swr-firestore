import { getFirestore, type Firestore } from "firebase-admin/firestore";

import { getFirestoreConverter } from "../../../server/util/getConverter";
import type { DocumentData } from "../../../server/util/type";
import createModuleSwrKey from "../util/createKey";

export type ModuleServerDocParams<T> = {
  path: string;
  parseDates?: import("../../../util/type").Paths<T>[];
  db?: Firestore;
  isSubscription?: boolean;
};

const getDoc = async <T>(params: ModuleServerDocParams<T>) => {
  const db = params.db ?? getFirestore();
  const converter = getFirestoreConverter<T>(params.parseDates);
  const snapshot = await db.doc(params.path).withConverter(converter).get();

  return {
    key: createModuleSwrKey(params),
    data: snapshot.data() as DocumentData<T> | undefined,
  };
};

export default getDoc;
