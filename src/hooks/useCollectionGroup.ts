import type {
  SWRSubscriptionOptions,
  SWRSubscriptionResponse,
} from "swr/subscription";
import type {
  FirestoreError,
  QueryConstraint,
  DocumentData as FsDocumentData,
} from "firebase/firestore";
import type { DocumentData, KeyParamsForCollectionGroup } from "../util/type";
import useSWRSubscription from "swr/subscription";
import {
  collectionGroup,
  endAt,
  endBefore,
  getFirestore,
  limit,
  limitToLast,
  onSnapshot,
  orderBy,
  query,
  startAfter,
  startAt,
  where,
} from "firebase/firestore";
import { getFirestoreConverter } from "../util/getConverter";
import { isQueryConstraintParams } from "../util/typeGuard";
import type { Key, SWRConfiguration } from "swr";
import serializeMiddleware from "../middleware/serializeMiddleware";

const useCollectionGroup = <T>(
  params: KeyParamsForCollectionGroup<T> | null,
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
        const {
          where: w,
          orderBy: o,
          startAt: s,
          startAfter: sa,
          endAt: e,
          endBefore: eb,
          limit: l,
          limitToLast: ltl,
        } = params;
        q = query(
          ref,
          ...(w ? w : []).map((q) => where(...q)),
          ...(o ? o : []).map((q) => orderBy(...q)),
          ...(s ? [startAt(...(Array.isArray(s) ? s : [s]))] : []),
          ...(sa ? [startAfter(...(Array.isArray(sa) ? sa : [sa]))] : []),
          ...(e ? [endAt(...(Array.isArray(e) ? e : [e]))] : []),
          ...(eb ? [endBefore(...(Array.isArray(eb) ? eb : [eb]))] : []),
          ...(l ? [limit(l)] : []),
          ...(ltl ? [limitToLast(ltl)] : [])
        );
      }
      const unsub = onSnapshot<DocumentData<T>, FsDocumentData>(
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
