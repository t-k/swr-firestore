import type { FirestoreError, DocumentData as FsDocumentData } from "firebase/firestore";
import { collectionGroup, getFirestore, onSnapshot, query } from "firebase/firestore";
import type { Key, SWRConfiguration } from "swr";
import useSWRSubscription from "swr/subscription";
import type { SWRSubscriptionOptions, SWRSubscriptionResponse } from "swr/subscription";

import type { DocumentData, Falsy } from "../../util/type";
import { getFirestoreConverter } from "../../util/getConverter";
import { materializeConstraints } from "../util/materializeConstraint";
import { scrubModuleKey } from "../util/scrubKey";

export type ModuleCollectionGroupParams<T> = {
  path: string;
  parseDates?: import("../../util/type").Paths<T>[];
  db?: import("firebase/firestore").Firestore;
  constraints?: readonly import("../util/type").ModuleQueryConstraint<
    T,
    "shared" | "collectionGroup"
  >[];
};

const useCollectionGroup = <T>(
  params: ModuleCollectionGroupParams<T> | Falsy,
  swrOptions?: Omit<SWRConfiguration, "fetcher">,
): SWRSubscriptionResponse<DocumentData<T>[], FirestoreError> =>
  useSWRSubscription(
    scrubModuleKey(params as Record<string, unknown> | Falsy),
    (_: Key, { next }: SWRSubscriptionOptions<DocumentData<T>[], FirestoreError>) => {
      if (!params) return;
      const ref = collectionGroup(params.db ?? getFirestore(), params.path);
      const q = query(ref, ...materializeConstraints(params.constraints));
      const converter = getFirestoreConverter<T>(params.parseDates);
      return onSnapshot<DocumentData<T>, FsDocumentData>(
        q.withConverter(converter),
        (snapshot) =>
          next(
            null,
            snapshot.docs.map((doc) => doc.data()),
          ),
        (error) => next(error),
      );
    },
    swrOptions,
  );

export default useCollectionGroup;
