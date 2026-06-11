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
  type ModuleAverageAggregateField,
  type ModuleCountAggregateField,
  type ModuleLimitConstraint,
  type ModuleOrderByConstraint,
  type ModuleSumAggregateField,
  type ModuleWhereConstraint,
  type PathValue,
  type QueryScope,
  type ScalarWhereOp,
  type SharedField,
} from "./util/type";

type SharedWhereArgs<T> = {
  [P in SharedField<T>]:
    | [field: P, op: ScalarWhereOp, value: PathValue<T, P>]
    | [field: P, op: "in" | "not-in", value: readonly PathValue<T, P>[]]
    | [field: P, op: "array-contains", value: ElementOf<PathValue<T, P>>]
    | [field: P, op: "array-contains-any", value: readonly ElementOf<PathValue<T, P>>[]];
}[SharedField<T>];

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

const assertPositiveLimit = (value: number): void => {
  if (value <= 0) {
    throw new RangeError("limit must be greater than 0");
  }
};

export function where<T>(...args: SharedWhereArgs<T>): ModuleWhereConstraint<T, "shared">;
export function where<T, O extends ScalarWhereOp = ScalarWhereOp>(
  field: "id",
  op: O,
  value: string,
): Extract<ModuleWhereConstraint<T, "collection">, { field: "id"; op: O }>;
export function where<T>(
  field: "id",
  op: "in" | "not-in",
  value: readonly string[],
): Extract<ModuleWhereConstraint<T, "collection">, { field: "id"; op: "in" | "not-in" }>;
export function where<T>(field: any, op: any, value: any): any {
  const scope = field === "id" ? "collection" : "shared";
  const constraint = {
    type: "where",
    scope,
    doc: undefined as unknown as T,
    field,
    op,
    value,
  } as ModuleWhereConstraint<T, "shared" | "collection">;

  return withMaterializer(constraint, () =>
    field === "id" ? fbWhere(documentId(), op, value) : fbWhere(field, op, value),
  );
}

export function orderBy<T>(
  field: SharedField<T>,
  direction?: OrderByDirection,
): ModuleOrderByConstraint<T, "shared">;
export function orderBy<T>(
  field: "id",
  direction?: OrderByDirection,
): Extract<ModuleOrderByConstraint<T, "collection">, { field: "id" }>;
export function orderBy<T>(field: any, direction: OrderByDirection = "asc"): any {
  const resolvedDirection = direction;
  const scope = field === "id" ? "collection" : "shared";
  const constraint = {
    type: "orderBy",
    scope,
    doc: undefined as unknown as T,
    field,
    direction: resolvedDirection,
  } as ModuleOrderByConstraint<T, "shared" | "collection">;

  return withMaterializer(constraint, () =>
    field === "id"
      ? fbOrderBy(documentId(), resolvedDirection)
      : fbOrderBy(field, resolvedDirection),
  );
}

export const limit = (value: number): ModuleLimitConstraint<never, "shared"> => {
  assertPositiveLimit(value);
  return withMaterializer(
    {
      type: "limit",
      scope: "shared",
      doc: undefined as unknown as never,
      value,
    } as ModuleLimitConstraint<never, "shared">,
    () => fbLimit(value),
  );
};

export const count = (): ModuleCountAggregateField => ({ type: "count" });

export const sum = <T, P extends SharedField<T> = SharedField<T>>(
  field: P,
): ModuleSumAggregateField<T, P> => ({
  type: "sum",
  field,
});

export const average = <T, P extends SharedField<T> = SharedField<T>>(
  field: P,
): ModuleAverageAggregateField<T, P> => ({
  type: "average",
  field,
});
