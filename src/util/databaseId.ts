/**
 * Extract database name as a plain string.
 * Firebase SDK may return a DatabaseId object instead of a string.
 */
export const toDatabaseIdString = (databaseId: string | { database: string }): string =>
  typeof databaseId === "string" ? databaseId : databaseId.database;

const extractDatabaseIdValue = (databaseId: unknown): string | undefined => {
  if (typeof databaseId === "string") return databaseId;
  if (databaseId == null || typeof databaseId !== "object") return undefined;
  if (!("database" in databaseId)) return undefined;
  return toDatabaseIdString((databaseId as { database: string }).database);
};

/**
 * Safely extract databaseId from a Firestore-like object.
 * Returns undefined if the object doesn't have the expected shape.
 */
export const extractDatabaseId = (db: unknown): string | undefined => {
  if (db == null || typeof db !== "object") return undefined;
  if ("databaseId" in db) {
    return extractDatabaseIdValue((db as { databaseId?: unknown }).databaseId);
  }
  if (!("toJSON" in db) || typeof (db as Record<string, unknown>).toJSON !== "function")
    return undefined;
  const json = (db as { toJSON: () => unknown }).toJSON();
  if (json == null || typeof json !== "object" || !("databaseId" in (json as object)))
    return undefined;
  return extractDatabaseIdValue((json as { databaseId: unknown }).databaseId);
};
