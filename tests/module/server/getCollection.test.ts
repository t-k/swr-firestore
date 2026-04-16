import { describe, expect, it } from "vitest";
import { unstable_serialize } from "swr";

import { orderBy, where } from "../../../src/module/query";
import getCollection from "../../../src/module/server/fetcher/getCollection";
import getCollectionGroup from "../../../src/module/server/fetcher/getCollectionGroup";
import { scrubModuleKey } from "../../../src/module/util/scrubKey";

type Post = {
  status: "draft" | "published";
  createdAt: Date;
};

const createQueryStub = (docId: string) => ({
  where: () => createQueryStub(docId),
  orderBy: () => createQueryStub(docId),
  limit: () => createQueryStub(docId),
  withConverter: () => createQueryStub(docId),
  get: async () => ({
    docs: [
      {
        data: () => ({
          id: docId,
          exists: true,
          ref: {},
          status: "published",
          createdAt: new Date("2025-01-01"),
        }),
      },
    ],
  }),
});

describe("module server getCollection", () => {
  it("creates a key compatible with client collection scrubbed params", async () => {
    const constraints = [where<Post>("status", "==", "published"), orderBy<Post>("createdAt", "desc")];
    const db = {
      databaseId: { database: "(default)", projectId: "project-a" },
      collection: () => createQueryStub("post-1"),
      collectionGroup: () => createQueryStub("group-1"),
    };
    const params = { path: "posts", constraints, db, isSubscription: true };
    const result = await getCollection<Post>(params);
    const expectedKey = `$sub$${unstable_serialize(
      scrubModuleKey({ path: "posts", constraints, db, isCollectionGroup: false }),
    )}`;

    expect(result.key).toBe(expectedKey);
  });

  it("creates a distinct key for collectionGroup fallback compatibility", async () => {
    const constraints = [where<Post>("status", "==", "published"), orderBy<Post>("createdAt", "desc")];
    const db = {
      databaseId: { database: "(default)", projectId: "project-a" },
      collection: () => createQueryStub("post-1"),
      collectionGroup: () => createQueryStub("group-1"),
    };

    const collectionResult = await getCollection<Post>({ path: "posts", constraints, db, isSubscription: true });
    const collectionGroupResult = await getCollectionGroup<Post>({
      path: "posts",
      constraints,
      db,
      isSubscription: true,
    });

    expect(collectionResult.key).not.toBe(collectionGroupResult.key);
    expect(collectionGroupResult.key).toBe(
      `$sub$${unstable_serialize(
        scrubModuleKey({ path: "posts", constraints, db, isCollectionGroup: true }),
      )}`,
    );
  });
});
