import { doc, getDoc, getDocFromCache, getFirestore } from "firebase/firestore";

import type { DocumentData } from "../../util/type";
import { getFirestoreConverter } from "../../util/getConverter";
import type { ModuleDocParams } from "../hooks/useDoc";

const fetchDoc = async <T>(
  params: ModuleDocParams<T> & { useOfflineCache?: boolean },
): Promise<DocumentData<T> | undefined> => {
  const ref = doc(params.db ?? getFirestore(), params.path);
  const converter = getFirestoreConverter<T>(params.parseDates);
  const getFn = params.useOfflineCache ? getDocFromCache : getDoc;
  const snapshot = await getFn(ref.withConverter(converter));
  return snapshot.data();
};

export default fetchDoc;
