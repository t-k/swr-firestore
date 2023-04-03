import type {
  SWRSubscriptionOptions,
  SWRSubscriptionResponse,
} from "swr/subscription";
import type { FirestoreError, QueryConstraint } from "firebase/firestore";
import type { DocumentData, KeyParams } from "../util/type";
import useSWRSubscription from "swr/subscription";
import {
  collectionGroup,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { getFirestoreConverter } from "../util/getConverter";
import { isQueryConstraintParams } from "../util/typeGuard";
import type { Key, SWRConfiguration } from "swr";
import serializeMiddleware from "../middleware/serializeMiddleware";

const useCollectionGroup = <T>(
  params: KeyParams<T> | null,
  swrOptions?: Omit<SWRConfiguration, "fetcher">
): SWRSubscriptionResponse<DocumentData<T>[], FirestoreError> => {
  return useSWRSubscription(
    params,
    (
      _: Key,
      { next }: SWRSubscriptionOptions<DocumentData<T>[], FirestoreError>
    ) => {
      if (params == null) {
        return;
      }
      const { path, parseDates } = params;
      const converter = getFirestoreConverter<T>(parseDates);
      const ref = collectionGroup(getFirestore(), path);
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
      const unsub = onSnapshot<DocumentData<T>>(
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
export default useCollectionGroup;
