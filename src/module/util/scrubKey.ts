import { normalizeModuleKeyParams } from "./normalizeKeyParams";

export const scrubModuleKey = <T extends Record<string, unknown>>(
  params: T | null | undefined | false,
): Record<string, unknown> | null => {
  return normalizeModuleKeyParams(params);
};
