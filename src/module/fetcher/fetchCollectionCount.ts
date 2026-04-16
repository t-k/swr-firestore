import { collection, getCountFromServer, getFirestore, query } from "firebase/firestore";

import type { ModuleCollectionCountParams } from "../hooks/useCollectionCount";
import { materializeConstraints } from "../util/materializeConstraint";

const fetchCollectionCount = async <T>(
  params: ModuleCollectionCountParams<T>,
): Promise<number> => {
  const ref = collection(params.db ?? getFirestore(), params.path);
  const q = query(ref, ...materializeConstraints(params.constraints));
  const snapshot = await getCountFromServer(q);
  return snapshot.data().count;
};

export default fetchCollectionCount;
