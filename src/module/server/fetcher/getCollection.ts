import { getFirestore, type Firestore } from "firebase-admin/firestore";

import { getFirestoreConverter } from "../../../server/util/getConverter";
import type { DocumentData } from "../../../server/util/type";
import { applyModuleConstraints } from "../util/buildQuery";
import createModuleSwrKey from "../util/createKey";
import type { ModuleQueryConstraint } from "../../util/type";

export type ModuleServerCollectionParams<T> = {
  path: string;
  parseDates?: import("../../../util/type").Paths<T>[];
  db?: Firestore;
  isSubscription?: boolean;
  constraints?: readonly ModuleQueryConstraint<T, "shared" | "collection">[];
};

const getCollection = async <T>(params: ModuleServerCollectionParams<T>) => {
  const db = params.db ?? getFirestore();
  const converter = getFirestoreConverter<T>(params.parseDates);
  const ref = db.collection(params.path);
  const snapshot = await applyModuleConstraints(ref, params.constraints).withConverter(converter).get();

  return {
    key: createModuleSwrKey({ ...params, isCollectionGroup: false }),
    data: snapshot.docs.map((doc) => doc.data() as DocumentData<T>),
  };
};

export default getCollection;
