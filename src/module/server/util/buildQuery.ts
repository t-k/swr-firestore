import { FieldPath } from "firebase-admin/firestore";
import type { Query } from "firebase-admin/firestore";

import type { ModuleQueryConstraint } from "../../util/type.js";

const mapDocumentIdField = (scope: "shared" | "collection" | "collectionGroup", field: string) => {
  switch (scope) {
    case "collection":
      return FieldPath.documentId();
    default:
      return field;
  }
};

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
          constraint.field === "id"
            ? mapDocumentIdField(constraint.scope, constraint.field)
            : constraint.field,
          constraint.op,
          constraint.value,
        );
      case "orderBy":
        return current.orderBy(
          constraint.field === "id"
            ? mapDocumentIdField(constraint.scope, constraint.field)
            : constraint.field,
          constraint.direction,
        );
      case "limit":
        return current.limit(constraint.value);
      default:
        return current;
    }
  }, query);
