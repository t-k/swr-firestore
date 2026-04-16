import { AggregateField, type AggregateSpec } from "firebase-admin/firestore";

import type { ModuleAggregateField } from "../../util/type.js";

export const buildModuleServerAggregateSpec = <T>(
  spec: Record<string, ModuleAggregateField<T>>,
): AggregateSpec => {
  const result: AggregateSpec = {};
  for (const [key, value] of Object.entries(spec)) {
    if (value.type === "count") result[key] = AggregateField.count();
    if (value.type === "sum") result[key] = AggregateField.sum(value.field);
    if (value.type === "average") result[key] = AggregateField.average(value.field);
  }
  return result;
};
