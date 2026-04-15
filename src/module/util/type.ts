import type { OrderByDirection, QueryConstraint, WhereFilterOp } from "firebase/firestore";

import type { Paths } from "../../util/type";

export type QueryScope = "shared" | "collection" | "collectionGroup";

export const MATERIALIZE_CLIENT = Symbol("swr-firestore.module.materializeClient");

export type PathValue<T, P extends string> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? PathValue<T[K], Rest>
    : never
  : P extends keyof T
    ? T[P]
    : never;

export type ElementOf<T> = T extends readonly (infer U)[] ? U : never;

type ModuleQueryConstraintBase<T, TScope extends QueryScope, TType extends string> = {
  type: TType;
  readonly doc: T;
  readonly scope: TScope;
  readonly [MATERIALIZE_CLIENT]: () => QueryConstraint;
};

export type ModuleWhereConstraint<
  T,
  TScope extends QueryScope,
  TField extends string = string,
  TOp extends WhereFilterOp = WhereFilterOp,
  TValue = unknown,
> = ModuleQueryConstraintBase<T, TScope, "where"> & {
  field: TField;
  op: TOp;
  value: TValue;
};

export type ModuleOrderByConstraint<
  T,
  TScope extends QueryScope,
  TField extends string = string,
  TDirection extends OrderByDirection = OrderByDirection,
> = ModuleQueryConstraintBase<T, TScope, "orderBy"> & {
  field: TField;
  direction: TDirection;
};

export type ModuleLimitConstraint<T, TScope extends QueryScope> = ModuleQueryConstraintBase<
  T,
  TScope,
  "limit"
> & {
  value: number;
};

export type ModuleQueryConstraint<T, TScope extends QueryScope> =
  | ModuleWhereConstraint<T, TScope>
  | ModuleOrderByConstraint<T, TScope>
  | ModuleLimitConstraint<T, TScope>;

export type SharedField<T> = Paths<T>;

export type CollectionField<T> = Paths<T> | "id";

export type ModuleAggregateField<T> =
  | { type: "count" }
  | { type: "sum"; field: Paths<T> }
  | { type: "average"; field: Paths<T> };
