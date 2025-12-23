import type { KeyParams } from "./type";
import { unstable_serialize } from "swr";

// https://github.com/vercel/swr/blob/main/subscription/index.ts
const SUBSCRIPTION_PREFIX = "$sub$";

const createSwrKey = <T>(
  params: KeyParams<T> & { count?: boolean; _aggregate?: boolean }
): string => {
  const { isSubscription, ...rest } = params;
  return `${isSubscription ? SUBSCRIPTION_PREFIX : ""}${unstable_serialize(
    JSON.parse(JSON.stringify(rest))
  )}`;
};

export default createSwrKey;
