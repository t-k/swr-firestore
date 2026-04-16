import { unstable_serialize } from "swr";

import { extractDatabaseId } from "../../../util/databaseId";

const SUBSCRIPTION_PREFIX = "$sub$";

const sanitize = (value: unknown): unknown => JSON.parse(JSON.stringify(value));

const createModuleSwrKey = <T extends { db?: unknown; isSubscription?: boolean }>(params: T) => {
  const { db, isSubscription, ...rest } = params;
  const databaseId = extractDatabaseId(db);
  const cleaned = databaseId != null ? { ...rest, databaseId } : rest;
  return `${isSubscription ? SUBSCRIPTION_PREFIX : ""}${unstable_serialize(
    sanitize(cleaned) as Parameters<typeof unstable_serialize>[0],
  )}`;
};

export default createModuleSwrKey;
