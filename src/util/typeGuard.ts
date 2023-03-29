import type { KeyParams, Paths, QueryConstraintParams } from "./type";

export const isQueryConstraintParams = <T>(
  params: KeyParams<T>
): params is {
  path: string;
  parseDates?: Paths<T>[];
} & QueryConstraintParams => {
  return (
    (
      params as {
        path: string;
        parseDates?: Paths<T>[];
      } & QueryConstraintParams
    ).queryConstraints != null
  );
};
