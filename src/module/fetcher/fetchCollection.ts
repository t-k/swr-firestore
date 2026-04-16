import { collection, getDocs, getDocsFromCache, getFirestore, query } from "firebase/firestore";

import type { DocumentData } from "../../util/type";
import { getFirestoreConverter } from "../../util/getConverter";
import { materializeConstraints } from "../util/materializeConstraint";
import type { ModuleCollectionParams } from "../hooks/useCollection";

const fetchCollection = async <T>(
  params: ModuleCollectionParams<T> & { useOfflineCache?: boolean },
): Promise<DocumentData<T>[]> => {
  const ref = collection(params.db ?? getFirestore(), params.path);
  const q = query(ref, ...materializeConstraints(params.constraints));
  const converter = getFirestoreConverter<T>(params.parseDates);
  const getFn = params.useOfflineCache ? getDocsFromCache : getDocs;
  const snapshot = await getFn(q.withConverter(converter));
  return snapshot.docs.map((doc) => doc.data());
};

export default fetchCollection;
