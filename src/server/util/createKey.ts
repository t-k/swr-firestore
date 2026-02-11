import type { KeyParams } from "./type";
import { unstable_serialize } from "swr";
import { toDatabaseIdString } from "../../util/databaseId";

// https://github.com/vercel/swr/blob/main/subscription/index.ts
const SUBSCRIPTION_PREFIX = "$sub$";

const createSwrKey = <T>(
  params: KeyParams<T> & { count?: boolean; _aggregate?: boolean }
): string => {
  const { isSubscription, db, ...rest } = params;
  // Replace Firestore instance with serializable databaseId
  const cleaned =
    db != null
      ? { ...rest, databaseId: toDatabaseIdString(db.databaseId) }
      : rest;
  return `${isSubscription ? SUBSCRIPTION_PREFIX : ""}${unstable_serialize(
    JSON.parse(JSON.stringify(cleaned))
  )}`;
};

export default createSwrKey;
