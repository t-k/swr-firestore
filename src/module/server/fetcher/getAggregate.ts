import { getFirestore, type Firestore } from "firebase-admin/firestore";

import type { AggregateResult, SwrAggregateSpec } from "../../../util/type.js";
import { buildModuleServerAggregateSpec } from "../util/buildAggregateSpec";
import { applyModuleConstraints } from "../util/buildQuery";
import createModuleSwrKey from "../util/createKey";
import type { ModuleQueryConstraint } from "../../util/type";

export type ModuleServerAggregateParams<T, TSpec extends SwrAggregateSpec<T>> = {
  path: string;
  aggregate: TSpec;
  db?: Firestore;
  isSubscription?: boolean;
  constraints?: readonly ModuleQueryConstraint<T, "shared" | "collection">[];
};

const getAggregate = async <T, TSpec extends SwrAggregateSpec<T>>(
  params: ModuleServerAggregateParams<T, TSpec>,
): Promise<{
  key: string;
  data: AggregateResult<TSpec>;
}> => {
  const { path, aggregate, db: externalDb, constraints } = params;
  const db = externalDb ?? getFirestore();
  const ref = db.collection(path);
  const queryRef = applyModuleConstraints(ref, constraints);
  const aggregateSpec = buildModuleServerAggregateSpec(aggregate);
  const snapshot = await queryRef.aggregate(aggregateSpec).get();

  return {
    key: createModuleSwrKey({ ...params, db, _aggregate: true, isCollectionGroup: false }),
    data: snapshot.data() as AggregateResult<TSpec>,
  };
};

export default getAggregate;
