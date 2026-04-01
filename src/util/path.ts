export const getByPath = (obj: unknown, path: string): unknown =>
  path.split(".").reduce<unknown>((acc, key) => {
    if (acc != null && typeof acc === "object")
      return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);

export const setByPath = <T extends Record<string, unknown>>(
  obj: T,
  path: string,
  value: unknown,
): T => {
  const keys = path.split(".");
  let current: Record<string, unknown> = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (current[keys[i]] == null || typeof current[keys[i]] !== "object") {
      current[keys[i]] = {};
    }
    current = current[keys[i]] as Record<string, unknown>;
  }
  current[keys[keys.length - 1]] = value;
  return obj;
};
