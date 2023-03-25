import type { DocumentData, KeyParams } from "./util/type";
import useCollection from "./hooks/useCollection";
import useCollectionCount from "./hooks/useCollectionCount";
import useCollectionGroup from "./hooks/useCollectionGroup";
import useCollectionGroupCount from "./hooks/useCollectionGroupCount";
import useDoc from "./hooks/useDoc";
import useGetDoc from "./hooks/useGetDoc";
import useGetDocs from "./hooks/useGetDocs";

export type { DocumentData, KeyParams };
export {
  useCollection,
  useCollectionCount,
  useCollectionGroup,
  useCollectionGroupCount,
  useDoc,
  useGetDoc,
  useGetDocs,
};
