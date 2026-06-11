import type { QueryConstraintParams } from "./type";

export const isQueryConstraintParams = <T extends object>(
  params: T,
): params is T & QueryConstraintParams => {
  return (params as QueryConstraintParams).queryConstraints != null;
};
