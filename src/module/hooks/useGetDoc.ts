import { doc, getDoc, getDocFromCache, getFirestore } from "firebase/firestore";
import type { SWRConfiguration } from "swr";
import useSWR from "swr";

import type { Falsy } from "../../util/type";
import { getFirestoreConverter } from "../../util/getConverter";
import { scrubModuleKey } from "../util/scrubKey";

export type ModuleGetDocParams<T> = {
  path: string;
  parseDates?: import("../../util/type").Paths<T>[];
  db?: import("firebase/firestore").Firestore;
  useOfflineCache?: boolean;
};

const useGetDoc = <T>(
  params: ModuleGetDocParams<T> | Falsy,
  swrOptions?: Omit<SWRConfiguration, "fetcher">,
) =>
  useSWR(
    scrubModuleKey(params as Record<string, unknown> | Falsy),
    async () => {
      if (!params) return;
      const ref = doc(params.db ?? getFirestore(), params.path);
      const converter = getFirestoreConverter<T>(params.parseDates);
      const getFn = params.useOfflineCache ? getDocFromCache : getDoc;
      const snapshot = await getFn(ref.withConverter(converter));
      return snapshot.data();
    },
    swrOptions ?? {},
  );

export default useGetDoc;
