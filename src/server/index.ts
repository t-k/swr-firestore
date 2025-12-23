import type { DocumentData, KeyParams } from "./util/type";
import type {
  SwrAggregateSpec,
  AggregateResult,
  AggregateFieldSpec,
  KeyParamsForAggregate,
  KeyParamsForCollectionGroupAggregate,
} from "../util/type";
import getCollection from "./fetcher/getCollection";
import getCollectionCount from "./fetcher/getCollectionCount";
import getCollectionGroup from "./fetcher/getCollectionGroup";
import getCollectionGroupCount from "./fetcher/getCollectionGroupCount";
import getDoc from "./fetcher/getDoc";
import getAggregate from "./fetcher/getAggregate";
import getCollectionGroupAggregate from "./fetcher/getCollectionGroupAggregate";
import getDocInTx from "./fetcher/getDocInTx";
import getCollectionInTx from "./fetcher/getCollectionInTx";
import getCollectionCountInTx from "./fetcher/getCollectionCountInTx";
import getCollectionGroupInTx from "./fetcher/getCollectionGroupInTx";
import getCollectionGroupCountInTx from "./fetcher/getCollectionGroupCountInTx";

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
  getCollection,
  getCollectionCount,
  getCollectionGroup,
  getCollectionGroupCount,
  getDoc,
  getAggregate,
  getCollectionGroupAggregate,
  getDocInTx,
  getCollectionInTx,
  getCollectionCountInTx,
  getCollectionGroupInTx,
  getCollectionGroupCountInTx,
};
