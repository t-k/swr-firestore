const unsafePathSegments = new Set(["__proto__", "constructor", "prototype"]);

const isSafePathSegment = (key: string): boolean => !unsafePathSegments.has(key);

export const getByPath = (obj: unknown, path: string): unknown =>
  path.split(".").reduce<unknown>((acc, key) => {
    if (!isSafePathSegment(key)) return undefined;
    if (acc != null && typeof acc === "object" && Object.hasOwn(acc, key)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);

export const setByPath = <T extends Record<string, unknown>>(
  obj: T,
  path: string,
  value: unknown,
): T => {
  const keys = path.split(".");
  if (keys.some((key) => !isSafePathSegment(key))) return obj;
  let current: Record<string, unknown> = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (current[key] == null) {
      current[key] = {};
    } else if (typeof current[key] !== "object") {
      return obj;
    }
    current = current[key] as Record<string, unknown>;
  }
  current[keys[keys.length - 1]] = value;
  return obj;
};
