import type { SWRSubscriptionResponse } from "swr/subscription";
import type { FirestoreError, QueryConstraint } from "firebase/firestore";
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
import { isQueryConstraintParams } from "../util/typeGuard";
import serializeMiddleware from "../middleware/serializeMiddleware";
import type { SWRConfiguration } from "swr";

const useCollection = <T>(
  params: KeyParams<T> | null,
  swrOptions?: Omit<SWRConfiguration, "fetcher">
): SWRSubscriptionResponse<DocumentData<T>[], FirestoreError> => {
  return useSWRSubscription(
    params,
    (p, { next }) => {
      console.log({ p });
      if (params == null) {
        return () => {
          // do nothing
        };
      }
      const { path, parseDates } = params;
      const converter = getFirestoreConverter<T>(parseDates);
      const ref = collection(getFirestore(), path);
      let q;
      if (isQueryConstraintParams(params)) {
        q = query(ref, ...(params.queryConstraints as QueryConstraint[]));
      } else {
        const { where: w, orderBy: o, limit: l } = params;
        q = query(
          ref,
          ...(w ? w : []).map((q) => where(...q)),
          ...(o ? o : []).map((q) => orderBy(...q)),
          ...(l ? [limit(l)] : [])
        );
      }
      const unsub = onSnapshot<T>(
        q.withConverter(converter),
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
    },
    { ...swrOptions, use: [serializeMiddleware, ...(swrOptions?.use ?? [])] }
  );
};
export default useCollection;
