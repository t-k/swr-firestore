import {
  collection,
  collectionGroup,
  getDocs,
  getDocsFromCache,
  getFirestore,
  query,
} from "firebase/firestore";
import type { SWRConfiguration } from "swr";
import useSWR from "swr";

import type { DocumentData, Falsy } from "../../util/type";
import { getFirestoreConverter } from "../../util/getConverter";
import { materializeConstraints } from "../util/materializeConstraint";
import { scrubModuleKey } from "../util/scrubKey";

type ModuleGetDocsBaseParams<T> = {
  path: string;
  parseDates?: import("../../util/type").Paths<T>[];
  db?: import("firebase/firestore").Firestore;
  useOfflineCache?: boolean;
};

type ModuleCollectionGetDocsParams<T> = ModuleGetDocsBaseParams<T> & {
  isCollectionGroup?: false;
  constraints?: readonly import("../util/type").ModuleQueryConstraint<T, "shared" | "collection">[];
};

type ModuleCollectionGroupGetDocsParams<T> = ModuleGetDocsBaseParams<T> & {
  isCollectionGroup: true;
  constraints?: readonly import("../util/type").ModuleQueryConstraint<
    T,
    "shared" | "collectionGroup"
  >[];
};

export type ModuleGetDocsParams<T> =
  | ModuleCollectionGetDocsParams<T>
  | ModuleCollectionGroupGetDocsParams<T>;

function useGetDocs<T>(
  params: ModuleCollectionGroupGetDocsParams<T> | Falsy,
  swrOptions?: Omit<SWRConfiguration, "fetcher">,
): import("swr").SWRResponse<DocumentData<T>[] | undefined, unknown, SWRConfiguration>;

function useGetDocs<T>(
  params: ModuleCollectionGetDocsParams<T> | Falsy,
  swrOptions?: Omit<SWRConfiguration, "fetcher">,
): import("swr").SWRResponse<DocumentData<T>[] | undefined, unknown, SWRConfiguration>;

function useGetDocs<T>(
  params: ModuleGetDocsParams<T> | Falsy,
  swrOptions?: Omit<SWRConfiguration, "fetcher">,
): import("swr").SWRResponse<DocumentData<T>[] | undefined, unknown, SWRConfiguration> {
  return useSWR(
    scrubModuleKey(
      params ? ({ ...params, isCollectionGroup: params.isCollectionGroup ?? false } as Record<string, unknown>) : params,
    ),
    async () => {
      if (!params) return;
      const db = params.db ?? getFirestore();
      const ref = params.isCollectionGroup
        ? collectionGroup(db, params.path)
        : collection(db, params.path);
      const q = query(ref, ...materializeConstraints(params.constraints));
      const converter = getFirestoreConverter<T>(params.parseDates);
      const getFn = params.useOfflineCache ? getDocsFromCache : getDocs;
      const snapshot = await getFn(q.withConverter(converter));
      return snapshot.docs.map((doc) => doc.data() as DocumentData<T>);
    },
    swrOptions ?? {},
  );
}

export default useGetDocs;
