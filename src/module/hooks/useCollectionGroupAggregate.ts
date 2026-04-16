import type { FirestoreError } from "firebase/firestore";
import { collectionGroup, getAggregateFromServer, getFirestore, query } from "firebase/firestore";
import type { SWRConfiguration, SWRResponse } from "swr";
import useSWR from "swr";

import type { AggregateResult, Falsy, SwrAggregateSpec } from "../../util/type";
import { buildModuleAggregateSpec } from "../util/buildAggregateSpec";
import { materializeConstraints } from "../util/materializeConstraint";
import type { ModuleQueryConstraint } from "../util/type";
import { scrubModuleKey } from "../util/scrubKey";

export type ModuleCollectionGroupAggregateParams<T, TSpec extends SwrAggregateSpec<T>> = {
  path: string;
  aggregate: TSpec;
  db?: import("firebase/firestore").Firestore;
  constraints?: readonly ModuleQueryConstraint<T, "shared" | "collectionGroup">[];
};

const useCollectionGroupAggregate = <T, TSpec extends SwrAggregateSpec<T>>(
  params: ModuleCollectionGroupAggregateParams<T, TSpec> | Falsy,
  swrOptions?: Omit<SWRConfiguration, "fetcher">,
): SWRResponse<AggregateResult<TSpec> | undefined, FirestoreError> => {
  const fetcher = async (): Promise<AggregateResult<TSpec> | undefined> => {
    if (!params) return;

    const { path, aggregate, db: externalDb, constraints } = params;
    const ref = collectionGroup(externalDb ?? getFirestore(), path);
    const q = query(ref, ...materializeConstraints(constraints));
    const aggregateSpec = buildModuleAggregateSpec(aggregate);
    const snapshot = await getAggregateFromServer(q, aggregateSpec);

    return snapshot.data() as AggregateResult<TSpec>;
  };

  const swrKey = params ? { ...params, _aggregate: true, isCollectionGroup: true } : null;

  return useSWR(scrubModuleKey(swrKey as Record<string, unknown> | null), fetcher, swrOptions ?? {});
};

export default useCollectionGroupAggregate;
