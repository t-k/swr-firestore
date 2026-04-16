import { describe, expect, it } from "vitest";
import { unstable_serialize } from "swr";

import { orderBy, where } from "../../../src/module/query";
import getCollection from "../../../src/module/server/fetcher/getCollection";
import { scrubModuleKey } from "../../../src/module/util/scrubKey";

type Post = {
  status: "draft" | "published";
  createdAt: Date;
};

describe("module server getCollection", () => {
  it("creates a key compatible with client scrubbed params", async () => {
    const constraints = [where<Post>("status", "==", "published"), orderBy<Post>("createdAt", "desc")];
    const db = {
      databaseId: { database: "(default)", projectId: "project-a" },
      collection: () => ({
        where: () => ({
          orderBy: () => ({
            withConverter: () => ({
              get: async () => ({ docs: [{ data: () => ({ id: "post-1", exists: true, ref: {}, status: "published", createdAt: new Date("2025-01-01") }) }] }),
            }),
          }),
        }),
        orderBy: () => ({
          withConverter: () => ({
            get: async () => ({ docs: [{ data: () => ({ id: "post-1", exists: true, ref: {}, status: "published", createdAt: new Date("2025-01-01") }) }] }),
          }),
        }),
        limit: () => ({
          withConverter: () => ({
            get: async () => ({ docs: [{ data: () => ({ id: "post-1", exists: true, ref: {}, status: "published", createdAt: new Date("2025-01-01") }) }] }),
          }),
        }),
        withConverter: () => ({
          get: async () => ({ docs: [{ data: () => ({ id: "post-1", exists: true, ref: {}, status: "published", createdAt: new Date("2025-01-01") }) }] }),
        }),
      }),
    };
    const params = { path: "posts", constraints, db, isSubscription: true };
    const result = await getCollection<Post>(params);
    const expectedKey = `$sub$${unstable_serialize(scrubModuleKey({ path: "posts", constraints, db }))}`;

    expect(result.key).toBe(expectedKey);
  });
});
