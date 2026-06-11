import { describe, expect, it, vi } from "vitest";

import {
  buildQueryForCollection,
  buildQueryForCollectionGroup,
} from "../../src/server/util/buildQuery";

const createQueryMock = () =>
  ({
    limit: vi.fn().mockReturnThis(),
    limitToLast: vi.fn().mockReturnThis(),
  }) as never;

type Post = {
  title: string;
};

describe("server buildQueryForCollection", () => {
  it("rejects zero limit values", () => {
    expect(() =>
      buildQueryForCollection<Post>(createQueryMock(), {
        path: "BuildQueryLimitTest",
        limit: 0,
      } as never),
    ).toThrow("limit must be greater than 0");
  });

  it("rejects zero limitToLast values", () => {
    expect(() =>
      buildQueryForCollection<Post>(createQueryMock(), {
        path: "BuildQueryLimitTest",
        limitToLast: 0,
      } as never),
    ).toThrow("limitToLast must be greater than 0");
  });
});

describe("server buildQueryForCollectionGroup", () => {
  it("rejects zero limit values", () => {
    expect(() =>
      buildQueryForCollectionGroup<Post>(createQueryMock(), {
        path: "BuildQueryLimitTest",
        limit: 0,
      } as never),
    ).toThrow("limit must be greater than 0");
  });
});
