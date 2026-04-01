// biome-ignore lint: internal helper for dot-path property access
export const getByPath = (obj: any, path: string): any =>
  path.split(".").reduce((acc, key) => acc?.[key], obj);

// biome-ignore lint: internal helper for dot-path property setting
export const setByPath = (obj: any, path: string, value: any): any => {
  const keys = path.split(".");
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (current[keys[i]] == null) current[keys[i]] = {};
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
  return obj;
};
