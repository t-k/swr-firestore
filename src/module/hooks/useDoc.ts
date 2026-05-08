import type { FirestoreError, DocumentData as FsDocumentData } from "firebase/firestore";
import { doc, getFirestore, onSnapshot } from "firebase/firestore";
import type { Key, SWRConfiguration } from "swr";
import useSWRSubscription from "swr/subscription";
import type { SWRSubscriptionOptions, SWRSubscriptionResponse } from "swr/subscription";

import type { DocumentData, Falsy } from "../../util/type";
import { getFirestoreConverter } from "../../util/getConverter";
import { scrubModuleKey } from "../util/scrubKey";

export type ModuleDocParams<T> = {
  path: string;
  parseDates?: import("../../util/type").Paths<T>[];
  db?: import("firebase/firestore").Firestore;
};

const useDoc = <T>(
  params: ModuleDocParams<T> | Falsy,
  swrOptions?: Omit<SWRConfiguration, "fetcher">,
): SWRSubscriptionResponse<DocumentData<T>, FirestoreError> =>
  useSWRSubscription(
    scrubModuleKey(params as Record<string, unknown> | Falsy),
    (_: Key, { next }: SWRSubscriptionOptions<DocumentData<T>, FirestoreError>) => {
      if (!params) return;
      const ref = doc(params.db ?? getFirestore(), params.path);
      const converter = getFirestoreConverter<T>(params.parseDates);
      return onSnapshot<DocumentData<T>, FsDocumentData>(
        ref.withConverter(converter),
        (snapshot) => next(null, snapshot.data()),
        (error) => next(error),
      );
    },
    swrOptions,
  );

export default useDoc;
