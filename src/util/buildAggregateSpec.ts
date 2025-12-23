import type { AggregateSpec } from "firebase/firestore";
import { count, sum, average } from "firebase/firestore";
import type { SwrAggregateSpec } from "./type";

/**
 * Convert SwrAggregateSpec to Firebase AggregateSpec
 */
export const buildAggregateSpec = <T>(
  spec: SwrAggregateSpec<T>
): AggregateSpec => {
  const result: AggregateSpec = {};

  for (const [key, value] of Object.entries(spec)) {
    switch (value.type) {
      case "count":
        result[key] = count();
        break;
      case "sum":
        result[key] = sum(value.field);
        break;
      case "average":
        result[key] = average(value.field);
        break;
    }
  }

  return result;
};
