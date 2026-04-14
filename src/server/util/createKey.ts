import { unstable_serialize } from "swr";
import { extractDatabaseId, toDatabaseIdString } from "../../util/databaseId";

// https://github.com/vercel/swr/blob/main/subscription/index.ts
const SUBSCRIPTION_PREFIX = "$sub$";

const extractServerDatabaseId = (db: unknown): string | undefined => {
  if (db == null || typeof db !== "object") {
    return undefined;
  }
  if ("databaseId" in db) {
    const databaseId = (db as { databaseId: string | { database: string } }).databaseId;
    return toDatabaseIdString(databaseId);
  }
  return extractDatabaseId(db);
};

const createSwrKey = <T extends { isSubscription?: boolean; db?: unknown }>(params: T): string => {
  const { isSubscription, db, ...rest } = params;
  // Replace Firestore instance with serializable databaseId
  const databaseId = extractServerDatabaseId(db);
  const cleaned = databaseId != null ? { ...rest, databaseId } : rest;
  return `${isSubscription ? SUBSCRIPTION_PREFIX : ""}${unstable_serialize(
    JSON.parse(JSON.stringify(cleaned)),
  )}`;
};

export default createSwrKey;
