import {
  collection,
  getAggregateFromServer,
  getFirestore,
} from "firebase/firestore";
import type {
  KeyParamsForAggregate,
  SwrAggregateSpec,
  AggregateResult,
} from "../util/type";
import { buildQueryForCollection } from "../util/buildQuery";
import { buildAggregateSpec } from "../util/buildAggregateSpec";

/**
 * Fetch aggregation result from a collection (client-side).
 *
 * @example
 * ```typescript
 * interface Product {
 *   name: string;
 *   category: string;
 *   price: number;
 *   stock: number;
 * }
 *
 * const result = await fetchAggregate<
 *   Product,
 *   {
 *     totalStock: { type: "sum"; field: "stock" };
 *     averagePrice: { type: "average"; field: "price" };
 *     productCount: { type: "count" };
 *   }
 * >({
 *   path: "products",
 *   where: [["category", "==", "electronics"]],
 *   aggregate: {
 *     totalStock: { type: "sum", field: "stock" },
 *     averagePrice: { type: "average", field: "price" },
 *     productCount: { type: "count" },
 *   },
 * });
 *
 * console.log(result.productCount); // number
 * console.log(result.totalStock); // number
 * console.log(result.averagePrice); // number | null
 * ```
 */
const fetchAggregate = async <T, TSpec extends SwrAggregateSpec<T>>(
  params: KeyParamsForAggregate<T, TSpec>
): Promise<AggregateResult<TSpec>> => {
  const { path, aggregate, ...queryParams } = params;
  const ref = collection(getFirestore(), path);
  const q = buildQueryForCollection(ref, queryParams);

  const aggregateSpec = buildAggregateSpec(aggregate);
  const snapshot = await getAggregateFromServer(q, aggregateSpec);

  return snapshot.data() as AggregateResult<TSpec>;
};

export default fetchAggregate;
