import { collection } from "firebase/firestore";
import { describe, expect, it } from "vitest";

import { db } from "../supports/fb";
import { buildQueryForCollection, buildQueryForCollectionGroup } from "../../src/util/buildQuery";

type Post = {
  title: string;
};

describe("buildQueryForCollection", () => {
  it("rejects zero limit values", () => {
    expect(() =>
      buildQueryForCollection<Post>(collection(db, "BuildQueryLimitTest"), {
        path: "BuildQueryLimitTest",
        limit: 0,
      } as never),
    ).toThrow("limit must be greater than 0");
  });

  it("rejects zero limitToLast values", () => {
    expect(() =>
      buildQueryForCollection<Post>(collection(db, "BuildQueryLimitTest"), {
        path: "BuildQueryLimitTest",
        limitToLast: 0,
      } as never),
    ).toThrow("limitToLast must be greater than 0");
  });
});

describe("buildQueryForCollectionGroup", () => {
  it("rejects zero limit values", () => {
    expect(() =>
      buildQueryForCollectionGroup<Post>(collection(db, "BuildQueryLimitTest"), {
        path: "BuildQueryLimitTest",
        limit: 0,
      } as never),
    ).toThrow("limit must be greater than 0");
  });
});
