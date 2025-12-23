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
  ...0[],
];

export type DocumentId = "id";

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
  where?: [
    Paths<T> | DocumentId,
    Parameters<typeof where>[1],
    ValueOf<T> | unknown,
  ][];
  orderBy?: [Paths<T> | DocumentId, Parameters<typeof orderBy>[1]][];
  startAt?: Parameters<typeof startAt>;
  startAfter?: Parameters<typeof startAfter>;
  endAt?: Parameters<typeof endAt>;
  endBefore?: Parameters<typeof endBefore>;
  limit?: number;
  limitToLast?: number;
};

export type QueryParamsForCollectionGroup<T> = {
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

export type KeyParamsForCollectionGroup<T> = BaseParams<T> &
  (QueryParamsForCollectionGroup<T> | QueryConstraintParams);

export type KeyParamsForCount<T> = BaseParams<T> &
  (Omit<QueryParams<T>, "parseDates"> | QueryConstraintParams);

export type KeyParamsForCollectionGroupCount<T> = BaseParams<T> &
  (
    | Omit<QueryParamsForCollectionGroup<T>, "parseDates">
    | QueryConstraintParams
  );

export type GetDocKeyParams<T> = KeyParams<T> & { useOfflineCache?: boolean };

export type DocumentData<T> = T &
  Pick<QueryDocumentSnapshot, "exists" | "id" | "ref">;

// Aggregation types

/**
 * Aggregate field specification
 * Note: Only string paths are allowed (not FieldPath) to ensure SWR key stability
 */
export type AggregateFieldSpec<T> =
  | { type: "count" }
  | { type: "sum"; field: Paths<T> }
  | { type: "average"; field: Paths<T> };

/**
 * Aggregate specification with custom keys
 */
export type SwrAggregateSpec<T> = {
  [key: string]: AggregateFieldSpec<T>;
};

/**
 * Aggregate field specification (simplified for result type)
 */
type AggregateFieldSpecBase =
  | { type: "count" }
  | { type: "sum"; field: string }
  | { type: "average"; field: string };

/**
 * Aggregate specification base (for result type)
 */
type SwrAggregateSpecBase = {
  [key: string]: AggregateFieldSpecBase;
};

/**
 * Aggregate result type
 * - count: always number
 * - sum: always number (0 if no documents)
 * - average: number | null (null if no documents)
 */
export type AggregateResult<TSpec extends SwrAggregateSpecBase> = {
  [K in keyof TSpec]: TSpec[K] extends { type: "count" }
    ? number
    : TSpec[K] extends { type: "sum" }
      ? number
      : TSpec[K] extends { type: "average" }
        ? number | null
        : never;
};

/**
 * Key params for aggregate queries on collections
 */
export type KeyParamsForAggregate<T, TSpec extends SwrAggregateSpec<T>> = Omit<
  BaseParams<T>,
  "parseDates"
> &
  (QueryParams<T> | QueryConstraintParams) & {
    aggregate: TSpec;
  };

/**
 * Key params for aggregate queries on collection groups
 */
export type KeyParamsForCollectionGroupAggregate<
  T,
  TSpec extends SwrAggregateSpec<T>,
> = Omit<BaseParams<T>, "parseDates"> &
  (QueryParamsForCollectionGroup<T> | QueryConstraintParams) & {
    aggregate: TSpec;
  };
