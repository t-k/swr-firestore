import { unstable_serialize } from "swr";

import { normalizeModuleKeyParams } from "../../util/normalizeKeyParams";

const SUBSCRIPTION_PREFIX = "$sub$";

const sanitize = (value: unknown): unknown => JSON.parse(JSON.stringify(value));

const createModuleSwrKey = <T extends { db?: unknown; isSubscription?: boolean }>(params: T) => {
  const { isSubscription, ...rest } = params;
  const cleaned = normalizeModuleKeyParams(rest);
  return `${isSubscription ? SUBSCRIPTION_PREFIX : ""}${unstable_serialize(
    sanitize(cleaned) as Parameters<typeof unstable_serialize>[0],
  )}`;
};

export default createModuleSwrKey;
