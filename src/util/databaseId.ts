/**
 * Extract database name as a plain string.
 * Firebase SDK may return a DatabaseId object instead of a string.
 */
export const toDatabaseIdString = (databaseId: string | { database: string }): string =>
  typeof databaseId === "string" ? databaseId : databaseId.database;

const hasDatabase = (value: unknown): value is { database: string; projectId?: string } => {
  return (
    value != null &&
    typeof value === "object" &&
    "database" in value &&
    typeof (value as { database?: unknown }).database === "string"
  );
};

/**
 * Extract a stable cache identity for a Firestore database.
 * Includes projectId when Firebase exposes it to avoid cross-project SWR cache collisions.
 */
export const toDatabaseIdentityString = (
  databaseId: string | { database: string; projectId?: string },
): string => {
  if (typeof databaseId === "string") return databaseId;
  return databaseId.projectId != null
    ? `${databaseId.projectId}/${databaseId.database}`
    : databaseId.database;
};

const extractDatabaseIdValue = (databaseId: unknown): string | undefined => {
  if (typeof databaseId === "string") return databaseId;
  if (!hasDatabase(databaseId)) return undefined;
  return toDatabaseIdString(databaseId);
};

const extractDatabaseIdentityValue = (databaseId: unknown): string | undefined => {
  if (typeof databaseId === "string") return databaseId;
  if (!hasDatabase(databaseId)) return undefined;
  return toDatabaseIdentityString(databaseId);
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

/**
 * Safely extract a project-aware database cache identity from a Firestore-like object.
 * Falls back to the database name when projectId is not available.
 */
export const extractDatabaseIdentity = (db: unknown): string | undefined => {
  if (db == null || typeof db !== "object") return undefined;
  if ("databaseId" in db) {
    return extractDatabaseIdentityValue((db as { databaseId?: unknown }).databaseId);
  }
  if (!("toJSON" in db) || typeof (db as Record<string, unknown>).toJSON !== "function")
    return undefined;
  const json = (db as { toJSON: () => unknown }).toJSON();
  if (json == null || typeof json !== "object" || !("databaseId" in (json as object)))
    return undefined;
  return extractDatabaseIdentityValue((json as { databaseId: unknown }).databaseId);
};
