import type { FirestoreError } from "firebase/firestore";
import { collectionGroup, getCountFromServer, getFirestore, query } from "firebase/firestore";
import type { SWRConfiguration, SWRResponse } from "swr";
import useSWR from "swr";

import type { Falsy } from "../../util/type";
import { materializeConstraints } from "../util/materializeConstraint";
import type { ModuleQueryConstraint } from "../util/type";
import { scrubModuleKey } from "../util/scrubKey";

export type ModuleCollectionGroupCountParams<T> = {
  path: string;
  db?: import("firebase/firestore").Firestore;
  constraints?: readonly ModuleQueryConstraint<T, "shared" | "collectionGroup">[];
};

const useCollectionGroupCount = <T>(
  params: ModuleCollectionGroupCountParams<T> | Falsy,
  swrOptions?: Omit<SWRConfiguration, "fetcher">,
): SWRResponse<number | undefined, FirestoreError> => {
  const fetcher = async (): Promise<number | undefined> => {
    if (!params) return;

    const ref = collectionGroup(params.db ?? getFirestore(), params.path);
    const q = query(ref, ...materializeConstraints(params.constraints));
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  };

  const swrKey = params ? { ...params, count: true, isCollectionGroup: true } : null;

  return useSWR(
    scrubModuleKey(swrKey as Record<string, unknown> | null),
    fetcher,
    swrOptions ?? {},
  );
};

export default useCollectionGroupCount;
