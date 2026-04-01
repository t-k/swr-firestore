export type {
  DocumentData,
  KeyParams,
  SwrAggregateSpec,
  AggregateResult,
  AggregateFieldSpec,
  KeyParamsForAggregate,
  KeyParamsForCollectionGroupAggregate,
} from "./util/type";

// SWR Subscription Hooks (real-time)
export { default as useCollection } from "./hooks/useCollection";
export { default as useCollectionGroup } from "./hooks/useCollectionGroup";
export { default as useDoc } from "./hooks/useDoc";

// SWR Hooks (one-time fetch)
export { default as useGetDoc } from "./hooks/useGetDoc";
export { default as useGetDocs } from "./hooks/useGetDocs";

// SWR Hooks (aggregate)
export { default as useAggregate } from "./hooks/useAggregate";
export { default as useCollectionCount } from "./hooks/useCollectionCount";
export { default as useCollectionGroupCount } from "./hooks/useCollectionGroupCount";
export { default as useCollectionGroupAggregate } from "./hooks/useCollectionGroupAggregate";

// Client-side fetchers (without SWR)
export {
  fetchDoc,
  fetchCollection,
  fetchCollectionCount,
  fetchCollectionGroup,
  fetchCollectionGroupCount,
  fetchAggregate,
  fetchCollectionGroupAggregate,
  fetchDocInTx,
} from "./fetcher";
