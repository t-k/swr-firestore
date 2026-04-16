export type { AggregateResult, AggregateFieldSpec, SwrAggregateSpec } from "../util/type";
export type { ModuleAggregateField } from "./util/type";

export { default as useAggregate } from "./hooks/useAggregate";
export { default as useCollectionCount } from "./hooks/useCollectionCount";
export { default as useCollectionGroupCount } from "./hooks/useCollectionGroupCount";
export { default as useCollectionGroupAggregate } from "./hooks/useCollectionGroupAggregate";

export {
  fetchAggregate,
  fetchCollectionCount,
  fetchCollectionGroupCount,
  fetchCollectionGroupAggregate,
} from "./fetcher";
