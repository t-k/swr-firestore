import { getFirestore, type Firestore } from "firebase-admin/firestore";

import { applyModuleConstraints } from "../util/buildQuery";
import createModuleSwrKey from "../util/createKey";
import type { ModuleQueryConstraint } from "../../util/type";

export type ModuleServerCollectionCountParams<T> = {
  path: string;
  db?: Firestore;
  constraints?: readonly ModuleQueryConstraint<T, "shared" | "collection">[];
};

const getCollectionCount = async <T>(params: ModuleServerCollectionCountParams<T>) => {
  const { path, db: externalDb, constraints } = params;
  const { isSubscription: _ignoredIsSubscription, ...keyParams } = params as ModuleServerCollectionCountParams<T> & {
    isSubscription?: boolean;
  };
  const db = externalDb ?? getFirestore();
  const ref = db.collection(path);
  const snapshot = await applyModuleConstraints(ref, constraints).count().get();

  return {
    key: createModuleSwrKey({ ...keyParams, count: true, isCollectionGroup: false }),
    data: snapshot.data().count,
  };
};

export default getCollectionCount;
