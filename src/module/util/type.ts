import type { OrderByDirection, QueryConstraint } from "firebase/firestore";

import type { Paths } from "../../util/type";

export type QueryScope = "shared" | "collection" | "collectionGroup";

export const MATERIALIZE_CLIENT = Symbol("swr-firestore.module.materializeClient");

export type ScalarWhereOp = "<" | "<=" | "==" | "!=" | ">=" | ">";

export type PathValue<T, P extends string> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? PathValue<T[K], Rest>
    : never
  : P extends keyof T
    ? T[P]
    : never;

export type ElementOf<T> = T extends readonly (infer U)[] ? U : never;

type ArrayField<T> = {
  [P in Paths<T>]: PathValue<T, P> extends readonly unknown[] ? P : never;
}[Paths<T>];

type ModuleQueryConstraintBase<T, TScope extends QueryScope, TType extends string> = {
  type: TType;
  readonly doc: T;
  readonly scope: TScope;
  readonly [MATERIALIZE_CLIENT]: () => QueryConstraint;
};

export type ModuleWhereConstraint<T, TScope extends QueryScope> = Extract<
  | {
      [P in SharedField<T>]:
        | (ModuleQueryConstraintBase<T, "shared", "where"> & {
            field: P;
            op: ScalarWhereOp;
            value: PathValue<T, P>;
          })
        | (ModuleQueryConstraintBase<T, "shared", "where"> & {
            field: P;
            op: "in" | "not-in";
            value: readonly PathValue<T, P>[];
          });
    }[SharedField<T>]
  | {
      [P in ArrayField<T>]:
        | (ModuleQueryConstraintBase<T, "shared", "where"> & {
            field: P;
            op: "array-contains";
            value: ElementOf<PathValue<T, P>>;
          })
        | (ModuleQueryConstraintBase<T, "shared", "where"> & {
            field: P;
            op: "array-contains-any";
            value: readonly ElementOf<PathValue<T, P>>[];
          });
    }[ArrayField<T>]
  | (ModuleQueryConstraintBase<T, "collection", "where"> & {
      field: "id";
      op: ScalarWhereOp;
      value: string;
    })
  | (ModuleQueryConstraintBase<T, "collection", "where"> & {
      field: "id";
      op: "in" | "not-in";
      value: readonly string[];
    }),
  { scope: TScope }
>;

export type ModuleOrderByConstraint<T, TScope extends QueryScope> = Extract<
  | {
      [P in SharedField<T>]: ModuleQueryConstraintBase<T, "shared", "orderBy"> & {
        field: P;
        direction: OrderByDirection;
      };
    }[SharedField<T>]
  | (ModuleQueryConstraintBase<T, "collection", "orderBy"> & {
      field: "id";
      direction: OrderByDirection;
    }),
  { scope: TScope }
>;

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

export type ModuleCountAggregateField = { type: "count" };

export type ModuleSumAggregateField<T, P extends Paths<T> = Paths<T>> = {
  type: "sum";
  field: P;
};

export type ModuleAverageAggregateField<T, P extends Paths<T> = Paths<T>> = {
  type: "average";
  field: P;
};

export type ModuleAggregateField<T> =
  | ModuleCountAggregateField
  | ModuleSumAggregateField<T>
  | ModuleAverageAggregateField<T>;
