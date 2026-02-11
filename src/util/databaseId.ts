/**
 * Extract database name as a plain string.
 * Firebase SDK may return a DatabaseId object instead of a string.
 */
export const toDatabaseIdString = (
  databaseId: string | { database: string }
): string =>
  typeof databaseId === "string" ? databaseId : databaseId.database;
