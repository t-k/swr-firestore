import type { SWRConfiguration, SWRResponse } from "swr";
import type { FirestoreError } from "firebase/firestore";
import useSWR from "swr";
import {
  collectionGroup,
  getAggregateFromServer,
  getFirestore,
} from "firebase/firestore";
import type {
  Falsy,
  KeyParamsForCollectionGroupAggregate,
  SwrAggregateSpec,
  AggregateResult,
} from "../util/type";
import { buildQueryForCollectionGroup } from "../util/buildQuery";
import { buildAggregateSpec } from "../util/buildAggregateSpec";
import serializeMiddleware from "../middleware/serializeMiddleware";

const useCollectionGroupAggregate = <T, TSpec extends SwrAggregateSpec<T>>(
  params: KeyParamsForCollectionGroupAggregate<T, TSpec> | Falsy,
  swrOptions?: Omit<SWRConfiguration, "fetcher">
): SWRResponse<AggregateResult<TSpec> | undefined, FirestoreError> => {
  const fetcher = async (): Promise<AggregateResult<TSpec> | undefined> => {
    if (!params) return;

    const { path, aggregate, ...queryParams } = params;
    const ref = collectionGroup(getFirestore(), path);
    const q = buildQueryForCollectionGroup(ref, queryParams);

    const aggregateSpec = buildAggregateSpec(aggregate);
    const snapshot = await getAggregateFromServer(q, aggregateSpec);

    return snapshot.data() as AggregateResult<TSpec>;
  };

  const swrKey = params ? { ...params, _aggregate: true } : null;

  return useSWR(swrKey, fetcher, {
    ...swrOptions,
    use: [serializeMiddleware, ...(swrOptions?.use ?? [])],
  });
};

export default useCollectionGroupAggregate;
