import { getFirestore } from "firebase-admin/firestore";
import type {
  KeyParamsForCollectionGroupAggregate,
  SwrAggregateSpec,
  AggregateResult,
} from "../../util/type.js";
import { buildQueryForCollectionGroup } from "../util/buildQuery.js";
import { buildAggregateSpec } from "../util/buildAggregateSpec.js";
import createSwrKey from "../util/createKey.js";

/**
 * Server-side fetcher for aggregate queries on a collection group.
 *
 * Note: `queryConstraints` is explicitly excluded from params.
 * The Firebase Admin SDK uses a different query builder API than the client SDK,
 * making it impossible to directly pass client-side QueryConstraint objects.
 * Use the typed query params (where, orderBy, etc.) instead.
 */
const getCollectionGroupAggregate = async <
  T,
  TSpec extends SwrAggregateSpec<T>,
>(
  params: Omit<KeyParamsForCollectionGroupAggregate<T, TSpec>, "queryConstraints">
): Promise<{
  key: string;
  data: AggregateResult<TSpec>;
}> => {
  const { path, aggregate, ...queryParams } = params;
  const db = getFirestore();
  const collectionGroupRef = db.collectionGroup(path);

  const queryRef = buildQueryForCollectionGroup(collectionGroupRef, queryParams);
  const aggregateSpec = buildAggregateSpec(aggregate);

  const snapshot = await queryRef.aggregate(aggregateSpec).get();

  return {
    key: createSwrKey({ ...params, _aggregate: true }),
    data: snapshot.data() as AggregateResult<TSpec>,
  };
};

export default getCollectionGroupAggregate;
