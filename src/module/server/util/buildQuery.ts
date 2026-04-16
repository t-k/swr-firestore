import type { Query } from "firebase-admin/firestore";

import type { ModuleQueryConstraint } from "../../util/type.js";

export const applyModuleConstraints = <T>(
  query: Query,
  constraints: readonly ModuleQueryConstraint<
    T,
    "shared" | "collection" | "collectionGroup"
  >[] = [],
): Query =>
  constraints.reduce((current, constraint) => {
    switch (constraint.type) {
      case "where":
        return current.where(
          constraint.field === "id" ? "__name__" : constraint.field,
          constraint.op,
          constraint.value,
        );
      case "orderBy":
        return current.orderBy(
          constraint.field === "id" ? "__name__" : constraint.field,
          constraint.direction,
        );
      case "limit":
        return current.limit(constraint.value);
      default:
        return current;
    }
  }, query);
