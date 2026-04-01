import type { SWRSubscriptionOptions, SWRSubscriptionResponse } from "swr/subscription";
import type { FirestoreError, DocumentData as FsDocumentData } from "firebase/firestore";
import type { DocumentData, Falsy, KeyParams } from "../util/type";
import { collection, getFirestore, onSnapshot } from "firebase/firestore";
import { getFirestoreConverter } from "../util/getConverter";
import useSWRSubscription from "swr/subscription";
import { buildQueryForCollection } from "../util/buildQuery";
import serializeMiddleware from "../middleware/serializeMiddleware";
import type { Key, SWRConfiguration } from "swr";

const useCollection = <T>(
  params: KeyParams<T> | Falsy,
  swrOptions?: Omit<SWRConfiguration, "fetcher">,
): SWRSubscriptionResponse<DocumentData<T>[], FirestoreError> => {
  return useSWRSubscription(
    params || null,
    (_: Key, { next }: SWRSubscriptionOptions<DocumentData<T>[], FirestoreError>) => {
      if (!params) {
        return;
      }
      const { path, parseDates, db: externalDb } = params;
      const db = externalDb ?? getFirestore();
      const converter = getFirestoreConverter<T>(parseDates);
      const ref = collection(db, path);
      const q = buildQueryForCollection(ref, params);
      const unsub = onSnapshot<DocumentData<T>, FsDocumentData>(
        q.withConverter(converter),
        (qs) => {
          next(
            null,
            qs.docs.map((x) => x.data()),
          );
        },
        (error) => {
          next(error);
        },
      );
      return () => unsub && unsub();
    },
    { ...swrOptions, use: [serializeMiddleware, ...(swrOptions?.use ?? [])] },
  );
};
export default useCollection;
