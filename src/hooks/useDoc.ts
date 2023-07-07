import type { FirestoreError } from "firebase/firestore";
import type { SWRSubscriptionResponse } from "swr/subscription";
import type { DocumentData, KeyParams } from "../util/type";
import useSWRSubscription from "swr/subscription";
import {
  doc,
  getFirestore,
  onSnapshot,
  DocumentData as FsDocumentData,
} from "firebase/firestore";
import { getFirestoreConverter } from "../util/getConverter";
import type { SWRConfiguration } from "swr";
import serializeMiddleware from "../middleware/serializeMiddleware";

const useDoc = <T>(
  params: Omit<KeyParams<T>, "where" | "orderBy" | "limit"> | null,
  swrOptions?: Omit<SWRConfiguration, "fetcher">
): SWRSubscriptionResponse<DocumentData<T>, FirestoreError> => {
  return useSWRSubscription(
    params,
    (_, { next }) => {
      if (params == null) {
        return () => {
          // do nothing
        };
      }
      const { path } = params;
      const ref = doc(getFirestore(), path);
      const converter = getFirestoreConverter<T>(params?.parseDates);
      const unsub = onSnapshot<DocumentData<T>, FsDocumentData>(
        ref.withConverter(converter),
        (doc) => {
          next(null, doc.data());
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
export default useDoc;
