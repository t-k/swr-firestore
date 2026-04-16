import { describe, expect, it } from "vitest";

import { orderBy, where } from "../../../src/module/query";
import getCollection from "../../../src/module/server/fetcher/getCollection";
import { scrubModuleKey } from "../../../src/module/util/scrubKey";

type Post = {
  status: "draft" | "published";
  createdAt: Date;
};

const createQueryStub = () => {
  const queryStub = {
    where: () => queryStub,
    orderBy: () => queryStub,
    limit: () => queryStub,
    withConverter: () => queryStub,
    get: async () => ({
      docs: [
        {
          data: () => ({
            id: "post-1",
            exists: true,
            ref: {},
            status: "published",
            createdAt: new Date("2025-01-01"),
          }),
        },
      ],
    }),
  };

  return queryStub;
};

describe("module server getCollection", () => {
  it("creates a key compatible with client scrubbed params", async () => {
    const constraints = [where<Post>("status", "==", "published"), orderBy<Post>("createdAt", "desc")];
    const db = {
      databaseId: { database: "(default)", projectId: "project-a" },
      collection: () => createQueryStub(),
    };
    const params = { path: "posts", constraints, db, isSubscription: true };
    const result = await getCollection<Post>(params);

    expect(result.key).toContain("constraints");
    expect(JSON.stringify(scrubModuleKey(params))).toContain("constraints");
  });
});
