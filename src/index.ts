import type { DocumentData, FirstoreKeyParams } from "./util/type";
import useCollection from "./hooks/useCollection";
import useCollectionCount from "./hooks/useCollectionCount";
import useCollectionGroup from "./hooks/useCollectionGroup";
import useCollectionGroupCount from "./hooks/useCollectionGroupCount";
import useDoc from "./hooks/useDoc";

export type { DocumentData, FirstoreKeyParams };
export { useCollection, useCollectionCount, useCollectionGroup, useCollectionGroupCount, useDoc };