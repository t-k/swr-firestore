import type {
  DocumentData,
  KeyParams,
  SwrAggregateSpec,
  AggregateResult,
  AggregateFieldSpec,
  KeyParamsForAggregate,
  KeyParamsForCollectionGroupAggregate,
} from "./util/type";
import useCollection from "./hooks/useCollection";
import useCollectionCount from "./hooks/useCollectionCount";
import useCollectionGroup from "./hooks/useCollectionGroup";
import useCollectionGroupCount from "./hooks/useCollectionGroupCount";
import useDoc from "./hooks/useDoc";
import useGetDoc from "./hooks/useGetDoc";
import useGetDocs from "./hooks/useGetDocs";
import useAggregate from "./hooks/useAggregate";
import useCollectionGroupAggregate from "./hooks/useCollectionGroupAggregate";
import {
  fetchDoc,
  fetchCollection,
  fetchCollectionCount,
  fetchCollectionGroup,
  fetchCollectionGroupCount,
  fetchAggregate,
  fetchCollectionGroupAggregate,
  fetchDocInTx,
} from "./fetcher";

export type {
  DocumentData,
  KeyParams,
  SwrAggregateSpec,
  AggregateResult,
  AggregateFieldSpec,
  KeyParamsForAggregate,
  KeyParamsForCollectionGroupAggregate,
};
export {
  // SWR Hooks
  useCollection,
  useCollectionCount,
  useCollectionGroup,
  useCollectionGroupCount,
  useDoc,
  useGetDoc,
  useGetDocs,
  useAggregate,
  useCollectionGroupAggregate,
  // Client-side fetchers (without SWR)
  fetchDoc,
  fetchCollection,
  fetchCollectionCount,
  fetchCollectionGroup,
  fetchCollectionGroupCount,
  fetchAggregate,
  fetchCollectionGroupAggregate,
  // Client-side transaction fetcher
  fetchDocInTx,
};
