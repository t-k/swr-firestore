import { extractDatabaseIdentity } from "../../util/databaseId";

export const normalizeModuleKeyParams = <T extends Record<string, unknown>>(
  params: T | null | undefined | false,
): Record<string, unknown> | null => {
  if (!params) return null;
  const { db, useOfflineCache: _useOfflineCache, ...rest } = params;
  const databaseId = extractDatabaseIdentity(db);
  return databaseId != null ? { ...rest, databaseId } : rest;
};
