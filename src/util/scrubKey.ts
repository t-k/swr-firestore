import { extractDatabaseId } from "./databaseId";

/**
 * Remove runtime-only properties from SWR key params and replace db with databaseId.
 */
export const scrubKey = <T extends Record<string, unknown>>(
  params: T | null | undefined | false,
): Record<string, unknown> | null => {
  if (!params) return null;
  const { db, useOfflineCache: _uoc, isCollectionGroup: _icg, ...rest } = params;
  const databaseId = extractDatabaseId(db);
  return databaseId != null ? { ...rest, databaseId } : rest;
};
