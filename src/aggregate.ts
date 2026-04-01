export type {
  DocumentData,
  SwrAggregateSpec,
  AggregateResult,
  AggregateFieldSpec,
  KeyParamsForAggregate,
  KeyParamsForCollectionGroupAggregate,
} from "./util/type";

// SWR Hooks (aggregate)
export { default as useAggregate } from "./hooks/useAggregate";
export { default as useCollectionCount } from "./hooks/useCollectionCount";
export { default as useCollectionGroupAggregate } from "./hooks/useCollectionGroupAggregate";
export { default as useCollectionGroupCount } from "./hooks/useCollectionGroupCount";

// Client-side fetchers (aggregate)
export {
  fetchAggregate,
  fetchCollectionCount,
  fetchCollectionGroupAggregate,
  fetchCollectionGroupCount,
} from "./fetcher";
