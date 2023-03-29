import type { SWRHook } from "swr";
import type { QueryConstraint } from "firebase/firestore";
import type { KeyParamsForCount } from "../util/type";
import useSWR from "swr";
import {
  collectionGroup,
  getCountFromServer,
  getFirestore,
  limit,
  query,
  where,
} from "firebase/firestore";
import { isQueryConstraintParams } from "../util/typeGuard";

const useCollectionGroupCount = <T>(
  params: KeyParamsForCount<T> | null,
  swrOptions?: Omit<Parameters<SWRHook>[2], "fetcher">
) => {
  let swrKey = params;
  if (params != null && isQueryConstraintParams(params)) {
    swrKey = JSON.parse(JSON.stringify(params));
  }
  const fetcher = async () => {
    if (params == null) {
      return;
    }
    const { path } = params;
    const ref = collectionGroup(getFirestore(), path);
    let q;
    if (isQueryConstraintParams(params)) {
      q = query(ref, ...(params.queryConstraints as QueryConstraint[]));
    } else {
      const { where: w, limit: l } = params;
      q = query(
        ref,
        ...(w ? w : []).map((q) => where(...q)),
        ...(l ? [limit(l)] : [])
      );
    }
    const sn = await getCountFromServer(q);
    return sn.data().count;
  };
  return useSWR(swrKey, fetcher, swrOptions);
};
export default useCollectionGroupCount;
