import type { orderBy, where } from "firebase/firestore";
import type { QueryDocumentSnapshot } from "firebase/firestore";
export type ValueOf<T> = T[keyof T];

export type KeyParams<T> = {
  // The path to the collection or document of Firestore.
  path: string;
  where?: [Extract<keyof T, string>, Parameters<typeof where>[1], ValueOf<T>][];
  orderBy?: [Extract<keyof T, string>, Parameters<typeof orderBy>[1]][];
  limit?: number;
  // Array of field names that should be parsed as dates.
  parseDates?: Extract<keyof T, string>[];
};

export type GetDocKeyParams<T> = KeyParams<T> & { useOfflineCache?: boolean };

export type DocumentData<T> = T &
  Pick<QueryDocumentSnapshot, "exists" | "id" | "ref">;
