import type { QueryConstraint } from "firebase/firestore";

import { MATERIALIZE_CLIENT, type ModuleQueryConstraint } from "./type";

export const materializeConstraints = <T>(
  constraints: readonly ModuleQueryConstraint<
    T,
    "shared" | "collection" | "collectionGroup"
  >[] = [],
): QueryConstraint[] => constraints.map((constraint) => constraint[MATERIALIZE_CLIENT]());
