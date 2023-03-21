import type { SWRSubscriptionResponse } from "swr/subscription";
import type { FirestoreError } from "firebase/firestore";
import type { DocumentData, KeyParams } from "../util/type";
import {
  collection,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { getFirestoreConverter } from "../util/getConverter";
import useSWRSubscription from "swr/subscription";

const useCollection = <T>(
  params: KeyParams<T> | null
): SWRSubscriptionResponse<DocumentData<T>[], FirestoreError | Error> => {
  return useSWRSubscription(params, (_, { next }) => {
    if (params == null) {
      return () => {
        // do nothing
      };
    }
    const { path, ...options } = params;
    const converter = getFirestoreConverter<T>(options?.parseDates);
    const ref = collection(getFirestore(), path);
    let q;
    if (options != null) {
      const { where: w, orderBy: o, limit: l } = options;
      q = query(
        ref,
        ...(w ? w : []).map((q) => where(...q)),
        ...(o ? o : []).map((q) => orderBy(...q)),
        ...(l ? [limit(l)] : [])
      );
    }
    const unsub = onSnapshot<T>(
      (q ?? ref).withConverter(converter),
      (qs) => {
        next(
          null,
          qs.docs.map((x) => x.data())
        );
      },
      (error) => {
        next(error);
      }
    );
    return () => unsub && unsub();
  });
};
export default useCollection;
