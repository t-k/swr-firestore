import { collectionGroup, getCountFromServer, getFirestore, query } from "firebase/firestore";

import type { ModuleCollectionGroupCountParams } from "../hooks/useCollectionGroupCount";
import { materializeConstraints } from "../util/materializeConstraint";

const fetchCollectionGroupCount = async <T>(
  params: ModuleCollectionGroupCountParams<T>,
): Promise<number> => {
  const ref = collectionGroup(params.db ?? getFirestore(), params.path);
  const q = query(ref, ...materializeConstraints(params.constraints));
  const snapshot = await getCountFromServer(q);
  return snapshot.data().count;
};

export default fetchCollectionGroupCount;
