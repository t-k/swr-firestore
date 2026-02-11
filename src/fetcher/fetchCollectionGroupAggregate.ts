import {
  collectionGroup,
  getAggregateFromServer,
  getFirestore,
} from "firebase/firestore";
import type {
  KeyParamsForCollectionGroupAggregate,
  SwrAggregateSpec,
  AggregateResult,
} from "../util/type";
import { buildQueryForCollectionGroup } from "../util/buildQuery";
import { buildAggregateSpec } from "../util/buildAggregateSpec";

/**
 * Fetch aggregation result from a collection group (client-side).
 *
 * @example
 * ```typescript
 * interface OrderItem {
 *   productId: string;
 *   price: number;
 *   quantity: number;
 * }
 *
 * // Aggregate across all "items" subcollections
 * const result = await fetchCollectionGroupAggregate<
 *   OrderItem,
 *   {
 *     totalRevenue: { type: "sum"; field: "price" };
 *     itemCount: { type: "count" };
 *   }
 * >({
 *   path: "items",
 *   aggregate: {
 *     totalRevenue: { type: "sum", field: "price" },
 *     itemCount: { type: "count" },
 *   },
 * });
 * ```
 */
const fetchCollectionGroupAggregate = async <
  T,
  TSpec extends SwrAggregateSpec<T>,
>(
  params: KeyParamsForCollectionGroupAggregate<T, TSpec>
): Promise<AggregateResult<TSpec>> => {
  const { path, aggregate, db: externalDb, ...queryParams } = params;
  const db = externalDb ?? getFirestore();
  const ref = collectionGroup(db, path);
  const q = buildQueryForCollectionGroup(ref, queryParams);

  const aggregateSpec = buildAggregateSpec(aggregate);
  const snapshot = await getAggregateFromServer(q, aggregateSpec);

  return snapshot.data() as AggregateResult<TSpec>;
};

export default fetchCollectionGroupAggregate;
