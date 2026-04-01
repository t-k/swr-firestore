/**
 * Extract database name as a plain string.
 * Firebase SDK may return a DatabaseId object instead of a string.
 */
export const toDatabaseIdString = (databaseId: string | { database: string }): string =>
  typeof databaseId === "string" ? databaseId : databaseId.database;

/**
 * Safely extract databaseId from a Firestore-like object.
 * Returns undefined if the object doesn't have the expected shape.
 */
export const extractDatabaseId = (db: unknown): string | undefined => {
  if (db == null || typeof db !== "object") return undefined;
  if (!("toJSON" in db) || typeof (db as Record<string, unknown>).toJSON !== "function")
    return undefined;
  const json = (db as { toJSON: () => unknown }).toJSON();
  if (json == null || typeof json !== "object" || !("databaseId" in (json as object)))
    return undefined;
  return toDatabaseIdString((json as { databaseId: string | { database: string } }).databaseId);
};
