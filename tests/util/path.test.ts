import { describe, it, expect } from "vitest";
import { getByPath, setByPath } from "../../src/util/path";

describe("getByPath", () => {
  it("returns top-level property", () => {
    expect(getByPath({ name: "alice" }, "name")).toBe("alice");
  });

  it("returns nested property via dot path", () => {
    expect(getByPath({ a: { b: { c: 42 } } }, "a.b.c")).toBe(42);
  });

  it("returns undefined for missing path", () => {
    expect(getByPath({ a: 1 }, "b")).toBeUndefined();
  });

  it("returns undefined for missing nested path", () => {
    expect(getByPath({ a: { b: 1 } }, "a.x.y")).toBeUndefined();
  });

  it("returns undefined when obj is null/undefined", () => {
    expect(getByPath(null, "a")).toBeUndefined();
    expect(getByPath(undefined, "a")).toBeUndefined();
  });
});

describe("setByPath", () => {
  it("sets top-level property", () => {
    const obj = { name: "alice" };
    setByPath(obj, "name", "bob");
    expect(obj.name).toBe("bob");
  });

  it("sets nested property via dot path", () => {
    const obj = { a: { b: { c: 1 } } };
    setByPath(obj, "a.b.c", 99);
    expect(obj.a.b.c).toBe(99);
  });

  it("creates intermediate objects when missing", () => {
    const obj: Record<string, unknown> = {};
    setByPath(obj, "a.b.c", "deep");
    expect(obj).toEqual({ a: { b: { c: "deep" } } });
  });

  it("returns the original object", () => {
    const obj = { x: 1 };
    const result = setByPath(obj, "x", 2);
    expect(result).toBe(obj);
  });
});
