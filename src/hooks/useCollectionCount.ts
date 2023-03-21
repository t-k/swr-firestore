import type { SWRHook } from "swr";
import { collection, getFirestore } from "firebase/firestore";
import type { KeyParams } from "../util/type";
import useSWR from "swr";
import {
  getCountFromServer,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";

const useCollectionCount = <T>(
  params: Omit<KeyParams<T>, "orderBy" | "parseDates"> | null,
  swrOptions?: Omit<Parameters<SWRHook>[2], "fetcher">
) => {
  const fetcher = (key: KeyParams<T>) => {
    const { path, ...option } = key;
    const ref = collection(getFirestore(), path);
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
export default useCollectionCount;
