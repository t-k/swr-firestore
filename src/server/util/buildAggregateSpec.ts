import { AggregateField } from "firebase-admin/firestore";
import type { SwrAggregateSpec } from "../../util/type.js";

/**
 * Admin SDK aggregate field type
 */
type AdminAggregateFieldType =
  | ReturnType<typeof AggregateField.count>
  | ReturnType<typeof AggregateField.sum>
  | ReturnType<typeof AggregateField.average>;

/**
 * Convert SwrAggregateSpec to Admin SDK aggregate spec
 */
export const buildAggregateSpec = <T>(
  spec: SwrAggregateSpec<T>
): Record<string, AdminAggregateFieldType> => {
  const result: Record<string, AdminAggregateFieldType> = {};

  for (const [key, value] of Object.entries(spec)) {
    switch (value.type) {
      case "count":
        result[key] = AggregateField.count();
        break;
      case "sum":
        result[key] = AggregateField.sum(value.field);
        break;
      case "average":
        result[key] = AggregateField.average(value.field);
        break;
    }
  }

  return result;
};
