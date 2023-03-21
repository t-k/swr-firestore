import type { SWRHook } from "swr";
import { collectionGroup, getFirestore } from "firebase/firestore";
import type { FirstoreKeyParams } from "../util/type";
import useSWR from "swr";
import { getCountFromServer, limit, orderBy, query, where } from "firebase/firestore";

const useCollectionGroupCount = <T>(
  params?: FirstoreKeyParams<T>,
  swrOptions?: Omit<Parameters<SWRHook>[2], "fetcher">
) => {
  const fetcher = (key: FirstoreKeyParams<T>) => {
    const { path, ...option } = key;
    const ref = collectionGroup(getFirestore(), path);
    let q;
    if (option) {
      const { where: w, orderBy: o, limit: l } = option;
      q = query(
        ref,
        ...(w ? w : []).map((q) => where(...q)),
        ...(o ? o : []).map((q) => orderBy(...q)),
        ...(l ? [limit(l)] : [])
      );
    }
    return getCountFromServer(q ?? ref).then((sn) => {
      return sn.data().count;
    });
  };
  return useSWR(params, fetcher, swrOptions);
};
export default useCollectionGroupCount;
