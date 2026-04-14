import type {
  Firestore,
  OrderByDirection,
  Query,
  QueryDocumentSnapshot,
  WhereFilterOp,
} from "firebase-admin/firestore";
import type { Paths, ValueOf, SwrAggregateSpec } from "../../util/type.js";

export type DocumentId = "id";

type QueryControls<TField> = {
  orderBy?: [TField, OrderByDirection][];
  startAt?: Parameters<Query["startAt"]>;
  startAfter?: Parameters<Query["startAfter"]>;
  endAt?: Parameters<Query["endAt"]>;
  endBefore?: Parameters<Query["endBefore"]>;
  limit?: number;
  limitToLast?: number;
};

type WhereClause<T, TField> = {
  where?: [TField, WhereFilterOp, ValueOf<T> | unknown][];
  filter?: never;
};

type BaseParams<T> = {
  // The path to the collection or document of Firestore.
  path: string;
  // Array of field names that should be parsed as dates.
  parseDates?: Paths<T>[];
  isSubscription?: boolean;
  // Optional Firestore instance. Falls back to getFirestore() if omitted.
  db?: Firestore;
};

type NonEmptyFilters<T, TField> = [
  ServerFilter<T, TField>,
  ServerFilter<T, TField>,
  ...ServerFilter<T, TField>[],
];

export type ServerFilter<T, TField> =
  | {
      type: "where";
      field: TField;
      op: WhereFilterOp;
      value: ValueOf<T> | unknown;
    }
  | {
      type: "or";
      filters: NonEmptyFilters<T, TField>;
    }
  | {
      type: "and";
      filters: NonEmptyFilters<T, TField>;
    };

type FilterClause<T, TField> = {
  where?: never;
  filter?: ServerFilter<T, TField>;
};

export type QueryParams<T> = QueryControls<Paths<T> | DocumentId> &
  (WhereClause<T, Paths<T> | DocumentId> | FilterClause<T, Paths<T> | DocumentId>);

export type QueryParamsForCollectionGroup<T> = QueryControls<Paths<T>> &
  (WhereClause<T, Paths<T>> | FilterClause<T, Paths<T>>);

export type KeyParams<T> = BaseParams<T> & QueryParams<T>;

export type KeyParamsForCollectionGroup<T> = BaseParams<T> & QueryParamsForCollectionGroup<T>;

export type KeyParamsForCount<T> = BaseParams<T> & QueryParams<T>;

export type KeyParamsForCollectionGroupCount<T> = BaseParams<T> & QueryParamsForCollectionGroup<T>;

export type DocumentData<T> = T & Pick<QueryDocumentSnapshot, "exists" | "id" | "ref">;

export type KeyParamsForAggregate<T, TSpec extends SwrAggregateSpec<T>> = Omit<
  BaseParams<T>,
  "parseDates" | "isSubscription"
> &
  QueryParams<T> & {
    aggregate: TSpec;
  };

export type KeyParamsForCollectionGroupAggregate<T, TSpec extends SwrAggregateSpec<T>> = Omit<
  BaseParams<T>,
  "parseDates" | "isSubscription"
> &
  QueryParamsForCollectionGroup<T> & {
    aggregate: TSpec;
  };
