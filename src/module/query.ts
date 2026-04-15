import {
  documentId,
  limit as fbLimit,
  orderBy as fbOrderBy,
  where as fbWhere,
} from "firebase/firestore";
import type { OrderByDirection } from "firebase/firestore";

import {
  MATERIALIZE_CLIENT,
  type ElementOf,
  type ModuleAggregateField,
  type ModuleQueryConstraint,
  type PathValue,
  type QueryScope,
  type SharedField,
  type CollectionField,
} from "./util/type";

type ScalarWhereOp = "<" | "<=" | "==" | "!=" | ">=" | ">";

type WhereArgs<T, P extends CollectionField<T>> = P extends "id"
  ? [field: "id", op: ScalarWhereOp | "in" | "not-in", value: string | readonly string[]]
  :
      | [field: P, op: ScalarWhereOp, value: PathValue<T, P>]
      | [field: P, op: "in" | "not-in", value: readonly PathValue<T, P>[]]
      | [field: P, op: "array-contains", value: ElementOf<PathValue<T, P>>]
      | [field: P, op: "array-contains-any", value: readonly ElementOf<PathValue<T, P>>[]];

const withMaterializer = <T extends { scope: QueryScope; doc: unknown }>(
  value: T,
  materialize: () => unknown,
): T => {
  Object.defineProperty(value, "scope", {
    enumerable: false,
    value: value.scope,
  });
  Object.defineProperty(value, "doc", {
    enumerable: false,
    value: value.doc,
  });
  return Object.defineProperty(value, MATERIALIZE_CLIENT, {
    enumerable: false,
    value: materialize,
  });
};

export function where<T, P extends CollectionField<T> = CollectionField<T>>(
  ...args: WhereArgs<T, P>
): P extends "id" ? ModuleQueryConstraint<T, "collection"> : ModuleQueryConstraint<T, "shared"> {
  const [field, op, value] = args as [CollectionField<T>, any, unknown];
  const scope = field === "id" ? "collection" : "shared";
  const constraint = {
    type: "where",
    scope,
    doc: undefined as unknown as T,
    field,
    op,
    value,
  } as unknown as ModuleQueryConstraint<T, "shared" | "collection">;

  return withMaterializer(constraint, () =>
    field === "id" ? fbWhere(documentId(), op, value) : fbWhere(field, op, value),
  ) as P extends "id" ? ModuleQueryConstraint<T, "collection"> : ModuleQueryConstraint<T, "shared">;
}

export function orderBy<T, P extends CollectionField<T> = CollectionField<T>>(
  field: P,
  direction: OrderByDirection = "asc",
): P extends "id" ? ModuleQueryConstraint<T, "collection"> : ModuleQueryConstraint<T, "shared"> {
  const scope = field === "id" ? "collection" : "shared";
  const constraint = {
    type: "orderBy",
    scope,
    doc: undefined as unknown as T,
    field,
    direction,
  } as unknown as ModuleQueryConstraint<T, "shared" | "collection">;

  return withMaterializer(constraint, () =>
    field === "id" ? fbOrderBy(documentId(), direction) : fbOrderBy(field, direction),
  ) as P extends "id" ? ModuleQueryConstraint<T, "collection"> : ModuleQueryConstraint<T, "shared">;
}

export const limit = (value: number) =>
  withMaterializer(
    {
      type: "limit",
      scope: "shared",
      doc: undefined as unknown as never,
      value,
    } as unknown as ModuleQueryConstraint<never, "shared">,
    () => fbLimit(value),
  );

export const count = (): ModuleAggregateField<never> => ({ type: "count" });

export const sum = <T, P extends SharedField<T> = SharedField<T>>(
  field: P,
): ModuleAggregateField<T> => ({
  type: "sum",
  field,
});

export const average = <T, P extends SharedField<T> = SharedField<T>>(
  field: P,
): ModuleAggregateField<T> => ({
  type: "average",
  field,
});
