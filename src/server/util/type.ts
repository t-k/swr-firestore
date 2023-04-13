import type {
  OrderByDirection,
  Query,
  QueryDocumentSnapshot,
  WhereFilterOp,
} from "firebase-admin/firestore";
import type { Paths, ValueOf } from "../../util/type.js";

export type QueryParams<T> = {
  where?: [Paths<T>, WhereFilterOp, ValueOf<T> | unknown][];
  orderBy?: [Paths<T>, OrderByDirection][];
  startAt?: Parameters<Query["startAt"]>;
  startAfter?: Parameters<Query["startAfter"]>;
  endAt?: Parameters<Query["endAt"]>;
  endBefore?: Parameters<Query["endBefore"]>;
  limit?: number;
};

type BaseParams<T> = {
  // The path to the collection or document of Firestore.
  path: string;
  // Array of field names that should be parsed as dates.
  parseDates?: Paths<T>[];
  isSubscription?: boolean;
};

export type KeyParams<T> = BaseParams<T> & QueryParams<T>;

export type KeyParamsForCount<T> = BaseParams<T> &
  Omit<QueryParams<T>, "parseDates" | "isSubscription">;

export type GetDocKeyParams<T> = KeyParams<T> & { useOfflineCache?: boolean };

export type DocumentData<T> = T &
  Pick<QueryDocumentSnapshot, "exists" | "id" | "ref">;
