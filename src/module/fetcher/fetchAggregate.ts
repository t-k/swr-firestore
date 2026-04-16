import { collection, getAggregateFromServer, getFirestore, query } from "firebase/firestore";

import type { AggregateResult, SwrAggregateSpec } from "../../util/type";
import { buildModuleAggregateSpec } from "../util/buildAggregateSpec";
import { materializeConstraints } from "../util/materializeConstraint";
import type { ModuleAggregateParams } from "../hooks/useAggregate";

const fetchAggregate = async <T, TSpec extends SwrAggregateSpec<T>>(
  params: ModuleAggregateParams<T, TSpec>,
): Promise<AggregateResult<TSpec>> => {
  const { path, aggregate, db: externalDb, constraints } = params;
  const ref = collection(externalDb ?? getFirestore(), path);
  const q = query(ref, ...materializeConstraints(constraints));
  const aggregateSpec = buildModuleAggregateSpec(aggregate);
  const snapshot = await getAggregateFromServer(q, aggregateSpec);

  return snapshot.data() as AggregateResult<TSpec>;
};

export default fetchAggregate;
