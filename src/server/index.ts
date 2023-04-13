import type { DocumentData, KeyParams } from "./util/type";
import getCollection from "./fetcher/getCollection";
import getCollectionCount from "./fetcher/getCollectionCount";
import getCollectionGroup from "./fetcher/getCollectionGroup";
import getCollectionGroupCount from "./fetcher/getCollectionGroupCount";
import getDoc from "./fetcher/getDoc";

export type { DocumentData, KeyParams };
export {
  getCollection,
  getCollectionCount,
  getCollectionGroup,
  getCollectionGroupCount,
  getDoc,
};
