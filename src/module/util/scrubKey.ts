import { normalizeModuleKeyParams } from "./normalizeKeyParams";

const sanitize = (value: unknown): Record<string, unknown> | null =>
  JSON.parse(JSON.stringify(value)) as Record<string, unknown> | null;

export const scrubModuleKey = <T extends Record<string, unknown>>(
  params: T | null | undefined | false,
): Record<string, unknown> | null => {
  return sanitize(normalizeModuleKeyParams(params));
};
