import { getFirestore } from "firebase-admin/firestore";
import type { SwrAggregateSpec, AggregateResult } from "../../util/type.js";
import type { KeyParamsForCollectionGroupAggregate } from "../util/type.js";
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
  params: KeyParamsForCollectionGroupAggregate<T, TSpec>
): Promise<{
  key: string;
  data: AggregateResult<TSpec>;
}> => {
  const { path, aggregate, db: externalDb, ...queryParams } = params;
  const db = externalDb ?? getFirestore();
  const collectionGroupRef = db.collectionGroup(path);

  const queryRef = buildQueryForCollectionGroup(collectionGroupRef, queryParams);
  const aggregateSpec = buildAggregateSpec(aggregate);

  const snapshot = await queryRef.aggregate(aggregateSpec).get();

  return {
    key: createSwrKey({ ...params, db, _aggregate: true }),
    data: snapshot.data() as AggregateResult<TSpec>,
  };
};

export default getCollectionGroupAggregate;
