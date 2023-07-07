import type {
  SWRSubscriptionOptions,
  SWRSubscriptionResponse,
} from "swr/subscription";
import type {
  FirestoreError,
  QueryConstraint,
  DocumentData as FsDocumentData,
} from "firebase/firestore";
import type { DocumentData, KeyParams } from "../util/type";
import {
  collection,
  documentId,
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
import useSWRSubscription from "swr/subscription";
import { isQueryConstraintParams } from "../util/typeGuard";
import serializeMiddleware from "../middleware/serializeMiddleware";
import type { Key, SWRConfiguration } from "swr";

const useCollection = <T>(
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
      const ref = collection(getFirestore(), path);
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
          ...(w ? w : []).map((q) =>
            q[0] === "id" ? where(documentId(), q[1], q[2]) : where(...q)
          ),
          ...(o ? o : []).map((q) =>
            q[0] === "id" ? orderBy(documentId(), q[1]) : orderBy(...q)
          ),
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
export default useCollection;
