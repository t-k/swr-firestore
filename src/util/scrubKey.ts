import { extractDatabaseIdentity } from "./databaseId";

const sanitize = (value: unknown): Record<string, unknown> | null =>
  JSON.parse(JSON.stringify(value)) as Record<string, unknown> | null;

/**
 * Remove runtime-only properties from SWR key params and replace db with databaseId.
 */
export const scrubKey = <T extends Record<string, unknown>>(
  params: T | null | undefined | false,
): Record<string, unknown> | null => {
  if (!params) return null;
  const { db, useOfflineCache: _uoc, ...rest } = params;
  const databaseId = extractDatabaseIdentity(db);
  return sanitize(databaseId != null ? { ...rest, databaseId } : rest);
};
