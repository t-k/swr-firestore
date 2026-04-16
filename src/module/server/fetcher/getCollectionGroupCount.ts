import { getFirestore, type Firestore } from "firebase-admin/firestore";

import { applyModuleConstraints } from "../util/buildQuery";
import createModuleSwrKey from "../util/createKey";
import type { ModuleQueryConstraint } from "../../util/type";

export type ModuleServerCollectionGroupCountParams<T> = {
  path: string;
  db?: Firestore;
  isSubscription?: boolean;
  constraints?: readonly ModuleQueryConstraint<T, "shared" | "collectionGroup">[];
};

const getCollectionGroupCount = async <T>(params: ModuleServerCollectionGroupCountParams<T>) => {
  const { path, db: externalDb, constraints } = params;
  const db = externalDb ?? getFirestore();
  const ref = db.collectionGroup(path);
  const snapshot = await applyModuleConstraints(ref, constraints).count().get();

  return {
    key: createModuleSwrKey({ ...params, count: true, isCollectionGroup: true }),
    data: snapshot.data().count,
  };
};

export default getCollectionGroupCount;
