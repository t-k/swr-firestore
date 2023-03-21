import { FirestoreError, doc, getFirestore } from "firebase/firestore";
import type { SWRSubscriptionResponse } from "swr/subscription";
import type { DocumentData, FirstoreKeyParams } from "../util/type";
import useSWRSubscription from "swr/subscription";
import { onSnapshot } from "firebase/firestore";
import { getFirestoreConverter } from "../util/getConverter";

const useDoc = <T>(
  params?: Omit<FirstoreKeyParams<T>, "where" | "orderBy" | "limit">
): SWRSubscriptionResponse<DocumentData<T>, FirestoreError> => {
  return useSWRSubscription(params, (_, { next }) => {
    if (params == null) {
      return () => {
        // do nothing
      };
    }
    const { path } = params;
    const ref = doc(getFirestore(), path);
    const converter = getFirestoreConverter<T>(params?.parseDates);
    const unsub = onSnapshot<T>(
      ref.withConverter(converter),
      (doc) => {
        next(null, doc.data());
      },
      (error) => {
        next(error);
      }
    );
    return () => unsub && unsub();
  });
};
export default useDoc;
