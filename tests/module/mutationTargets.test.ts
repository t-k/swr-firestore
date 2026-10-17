import { describe, expect, it } from "vitest";
import { limit as fbLimit, orderBy as fbOrderBy, where as fbWhere } from "firebase/firestore";
import { limit, orderBy, where } from "../../src/module/query";
import { materializeConstraints } from "../../src/module/util/materializeConstraint";
import { normalizeModuleKeyParams } from "../../src/module/util/normalizeKeyParams";

describe("materializeConstraints", () => {
  it("preserves the order and arguments of all constraints", () => {
    type Post = { price: number };
    expect(
      materializeConstraints([
        where<Post>("price", ">=", 7),
        orderBy<Post>("price", "desc"),
        limit(3),
      ]),
    ).toEqual([fbWhere("price", ">=", 7), fbOrderBy("price", "desc"), fbLimit(3)]);
  });

  it("accepts an omitted or empty constraint array", () => {
    expect(materializeConstraints()).toEqual([]);
    expect(materializeConstraints([])).toEqual([]);
  });
});

describe("normalizeModuleKeyParams", () => {
  it.each([null, undefined, false] as const)("preserves disabled key %s", (params) => {
    expect(normalizeModuleKeyParams(params)).toBeNull();
  });

  it("removes db and offline flags while preserving query params", () => {
    const params = {
      path: "posts",
      db: { databaseId: "secondary", projectId: "p" },
      useOfflineCache: true,
      count: 3,
    };
    expect(normalizeModuleKeyParams(params)).toEqual({
      path: "posts",
      count: 3,
      databaseId: "p/secondary",
    });
    expect(params.useOfflineCache).toBe(true);
  });

  it("does not invent a database identity", () => {
    expect(normalizeModuleKeyParams({ path: "posts", db: {}, useOfflineCache: false })).toEqual({
      path: "posts",
    });
    expect(normalizeModuleKeyParams({})).toStrictEqual({});
  });
});
