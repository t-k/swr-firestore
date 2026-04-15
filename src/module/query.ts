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
  type ModuleLimitConstraint,
  type ModuleOrderByConstraint,
  type ModuleWhereConstraint,
  type PathValue,
  type QueryScope,
  type SharedField,
} from "./util/type";

type ScalarWhereOp = "<" | "<=" | "==" | "!=" | ">=" | ">";

type SharedWhereArgs<T> = {
  [P in SharedField<T>]:
    | [field: P, op: ScalarWhereOp, value: PathValue<T, P>]
    | [field: P, op: "in" | "not-in", value: readonly PathValue<T, P>[]]
    | [field: P, op: "array-contains", value: ElementOf<PathValue<T, P>>]
    | [field: P, op: "array-contains-any", value: readonly ElementOf<PathValue<T, P>>[]];
}[SharedField<T>];

type SharedWhereOp<T> = SharedWhereArgs<T>[1];
type SharedWhereValue<T> = SharedWhereArgs<T>[2];

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

export function where<T>(
  ...args: SharedWhereArgs<T>
): ModuleWhereConstraint<T, "shared", SharedField<T>, SharedWhereOp<T>, SharedWhereValue<T>>;
export function where<T>(
  field: "id",
  op: ScalarWhereOp | "in" | "not-in",
  value: string | readonly string[],
): ModuleWhereConstraint<
  T,
  "collection",
  "id",
  ScalarWhereOp | "in" | "not-in",
  string | readonly string[]
>;
export function where<T>(field: any, op: any, value: any): any {
  const scope = field === "id" ? "collection" : "shared";
  const constraint = {
    type: "where",
    scope,
    doc: undefined as unknown as T,
    field,
    op,
    value,
  } as unknown as ModuleWhereConstraint<T, "shared" | "collection">;

  return withMaterializer(constraint, () =>
    field === "id" ? fbWhere(documentId(), op, value) : fbWhere(field, op, value),
  );
}

export function orderBy<T>(
  field: SharedField<T>,
  direction?: OrderByDirection,
): ModuleOrderByConstraint<T, "shared", SharedField<T>, OrderByDirection>;
export function orderBy<T>(
  field: "id",
  direction?: OrderByDirection,
): ModuleOrderByConstraint<T, "collection", "id", OrderByDirection>;
export function orderBy<T>(field: any, direction: OrderByDirection = "asc"): any {
  const resolvedDirection = direction;
  const scope = field === "id" ? "collection" : "shared";
  const constraint = {
    type: "orderBy",
    scope,
    doc: undefined as unknown as T,
    field,
    direction: resolvedDirection,
  } as unknown as ModuleOrderByConstraint<T, "shared" | "collection">;

  return withMaterializer(constraint, () =>
    field === "id"
      ? fbOrderBy(documentId(), resolvedDirection)
      : fbOrderBy(field, resolvedDirection),
  );
}

export const limit = (value: number): ModuleLimitConstraint<never, "shared"> =>
  withMaterializer(
    {
      type: "limit",
      scope: "shared",
      doc: undefined as unknown as never,
      value,
    } as ModuleLimitConstraint<never, "shared">,
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
