import type { SWRConfiguration, SWRResponse } from "swr";
import type { FirestoreError } from "firebase/firestore";
import useSWR from "swr";
import {
  collection,
  getAggregateFromServer,
  getFirestore,
} from "firebase/firestore";
import type {
  Falsy,
  KeyParamsForAggregate,
  SwrAggregateSpec,
  AggregateResult,
} from "../util/type";
import { buildQueryForCollection } from "../util/buildQuery";
import { buildAggregateSpec } from "../util/buildAggregateSpec";
import serializeMiddleware from "../middleware/serializeMiddleware";

const useAggregate = <T, TSpec extends SwrAggregateSpec<T>>(
  params: KeyParamsForAggregate<T, TSpec> | Falsy,
  swrOptions?: Omit<SWRConfiguration, "fetcher">
): SWRResponse<AggregateResult<TSpec> | undefined, FirestoreError> => {
  const fetcher = async (): Promise<AggregateResult<TSpec> | undefined> => {
    if (!params) return;

    const { path, aggregate, ...queryParams } = params;
    const ref = collection(getFirestore(), path);
    const q = buildQueryForCollection(ref, queryParams);

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

export default useAggregate;
