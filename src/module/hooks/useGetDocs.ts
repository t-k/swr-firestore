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

export type ModuleGetDocsParams<T> = {
  path: string;
  parseDates?: import("../../util/type").Paths<T>[];
  db?: import("firebase/firestore").Firestore;
  isCollectionGroup?: boolean;
  useOfflineCache?: boolean;
  constraints?: readonly import("../util/type").ModuleQueryConstraint<
    T,
    "shared" | "collection" | "collectionGroup"
  >[];
};

const useGetDocs = <T>(
  params: ModuleGetDocsParams<T> | Falsy,
  swrOptions?: Omit<SWRConfiguration, "fetcher">,
) =>
  useSWR(
    scrubModuleKey(params as Record<string, unknown> | Falsy),
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

export default useGetDocs;
