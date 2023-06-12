import type {
  endAt,
  endBefore,
  orderBy,
  QueryCompositeFilterConstraint,
  QueryConstraint,
  QueryNonFilterConstraint,
  startAfter,
  startAt,
  where,
} from "firebase/firestore";
import type { QueryDocumentSnapshot } from "firebase/firestore";

// Typescript: deep keyof of a nested object
// https://stackoverflow.com/a/58436959
type Join<K, P> = K extends string | number
  ? P extends string | number
    ? `${K}${"" extends P ? "" : "."}${P}`
    : never
  : never;

type Prev = [
  never,
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  ...0[]
];

export type Paths<T, D extends number = 3> = [D] extends [never]
  ? never
  : T extends object
  ? {
      [K in keyof T]-?: K extends string | number
        ? `${K}` | Join<K, Paths<T[K], Prev[D]>>
        : never;
    }[keyof T]
  : "";

export type ValueOf<T> = T[keyof T];

export type QueryParams<T> = {
  where?: [Paths<T>, Parameters<typeof where>[1], ValueOf<T> | unknown][];
  orderBy?: [Paths<T>, Parameters<typeof orderBy>[1]][];
  startAt?: Parameters<typeof startAt>;
  startAfter?: Parameters<typeof startAfter>;
  endAt?: Parameters<typeof endAt>;
  endBefore?: Parameters<typeof endBefore>;
  limit?: number;
  limitToLast?: number;
};

export type QueryConstraintParams = {
  queryConstraints?:
    | [QueryCompositeFilterConstraint, ...Array<QueryNonFilterConstraint>]
    | QueryConstraint[];
};

type BaseParams<T> = {
  // The path to the collection or document of Firestore.
  path: string;
  // Array of field names that should be parsed as dates.
  parseDates?: Paths<T>[];
};

export type KeyParams<T> = BaseParams<T> &
  (QueryParams<T> | QueryConstraintParams);

export type KeyParamsForCount<T> = BaseParams<T> &
  (Omit<QueryParams<T>, "parseDates"> | QueryConstraintParams);

export type GetDocKeyParams<T> = KeyParams<T> & { useOfflineCache?: boolean };

export type DocumentData<T> = T &
  Pick<QueryDocumentSnapshot, "exists" | "id" | "ref">;

// ChildKeys<Keys> extracts the child key from the path specified in Keys.
// e.g.
// ChildKeys<"foo.bar.baz"> is "bar.baz"
type ChildKeys<Keys> = Keys extends `${infer _}.${infer ChildKey}` ? ChildKey : never

// ParseDate<T, Keys> converts the type of the fields specified in Keys to Date.
// e.g.
// ParseDate<{ a: string, foo: { bar: { baz: string } } }, "a" | "foo.bar.baz"> is
// { a: Date, foo: { bar: { baz: Date } } }
export type ParseDate<T, Keys extends Paths<T> = never> = keyof T extends never ? T : {
  [key in keyof T]: key extends Keys ?
    Date :
    T[key] extends object ?
      ChildKeys<Keys> extends Paths<T[key]> ? ParseDate<T[key], ChildKeys<Keys>> : never :
      T[key];
};
