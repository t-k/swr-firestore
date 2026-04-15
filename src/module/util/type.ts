import type { QueryConstraint } from "firebase/firestore";

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

export type ModuleQueryConstraint<T, TScope extends QueryScope> = {
  type:
    | "where"
    | "orderBy"
    | "limit"
    | "limitToLast"
    | "startAt"
    | "startAfter"
    | "endAt"
    | "endBefore"
    | "or"
    | "and";
  readonly doc: T;
  readonly scope: TScope;
  readonly [MATERIALIZE_CLIENT]: () => QueryConstraint;
};

export type SharedField<T> = Paths<T>;

export type CollectionField<T> = Paths<T> | "id";

export type ModuleAggregateField<T> =
  | { type: "count" }
  | { type: "sum"; field: Paths<T> }
  | { type: "average"; field: Paths<T> };
