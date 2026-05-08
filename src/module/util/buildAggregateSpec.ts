import { average, count, sum, type AggregateSpec } from "firebase/firestore";

import type { ModuleAggregateField } from "./type";

export const buildModuleAggregateSpec = <T>(
  spec: Record<string, ModuleAggregateField<T>>,
): AggregateSpec => {
  const result: AggregateSpec = {};
  for (const [key, value] of Object.entries(spec)) {
    if (value.type === "count") result[key] = count();
    if (value.type === "sum") result[key] = sum(value.field);
    if (value.type === "average") result[key] = average(value.field);
  }
  return result;
};
