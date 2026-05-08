import { extractDatabaseId } from "../../util/databaseId";

export const normalizeModuleKeyParams = <T extends Record<string, unknown>>(
  params: T | null | undefined | false,
): Record<string, unknown> | null => {
  if (!params) return null;
  const { db, useOfflineCache: _useOfflineCache, ...rest } = params;
  const databaseId = extractDatabaseId(db);
  return databaseId != null ? { ...rest, databaseId } : rest;
};
