import { extractDatabaseId } from "../../util/databaseId";

export const scrubModuleKey = <T extends Record<string, unknown>>(
  params: T | null | undefined | false,
): Record<string, unknown> | null => {
  if (!params) return null;
  const { db, useOfflineCache: _uoc, ...rest } = params;
  const databaseId = extractDatabaseId(db);
  return databaseId != null ? { ...rest, databaseId } : rest;
};
