import { getFirestore, type Firestore } from "firebase-admin/firestore";

import type { AggregateResult, SwrAggregateSpec } from "../../../util/type.js";
import { buildModuleServerAggregateSpec } from "../util/buildAggregateSpec";
import { applyModuleConstraints } from "../util/buildQuery";
import createModuleSwrKey from "../util/createKey";
import type { ModuleQueryConstraint } from "../../util/type";

export type ModuleServerCollectionGroupAggregateParams<T, TSpec extends SwrAggregateSpec<T>> = {
  path: string;
  aggregate: TSpec;
  db?: Firestore;
  isSubscription?: boolean;
  constraints?: readonly ModuleQueryConstraint<T, "shared" | "collectionGroup">[];
};

const getCollectionGroupAggregate = async <T, TSpec extends SwrAggregateSpec<T>>(
  params: ModuleServerCollectionGroupAggregateParams<T, TSpec>,
): Promise<{
  key: string;
  data: AggregateResult<TSpec>;
}> => {
  const { path, aggregate, db: externalDb, constraints } = params;
  const db = externalDb ?? getFirestore();
  const ref = db.collectionGroup(path);
  const queryRef = applyModuleConstraints(ref, constraints);
  const aggregateSpec = buildModuleServerAggregateSpec(aggregate);
  const snapshot = await queryRef.aggregate(aggregateSpec).get();

  return {
    key: createModuleSwrKey({ ...params, db, _aggregate: true, isCollectionGroup: true }),
    data: snapshot.data() as AggregateResult<TSpec>,
  };
};

export default getCollectionGroupAggregate;
