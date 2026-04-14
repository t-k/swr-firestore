import { unstable_serialize } from "swr";
import { extractDatabaseId } from "../../util/databaseId";

// https://github.com/vercel/swr/blob/main/subscription/index.ts
const SUBSCRIPTION_PREFIX = "$sub$";

const createSwrKey = <T extends { isSubscription?: boolean; db?: unknown }>(params: T): string => {
  const { isSubscription, db, ...rest } = params;
  // Replace Firestore instance with serializable databaseId
  const databaseId = extractDatabaseId(db);
  const cleaned = databaseId != null ? { ...rest, databaseId } : rest;
  return `${isSubscription ? SUBSCRIPTION_PREFIX : ""}${unstable_serialize(
    JSON.parse(JSON.stringify(cleaned)),
  )}`;
};

export default createSwrKey;
