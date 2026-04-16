import { describe, expect, it } from "vitest";
import { average, orderBy, where } from "../../../src/module/query";
import createModuleSwrKey from "../../../src/module/server/util/createKey";

import { scrubModuleKey } from "../../../src/module/util/scrubKey";

type Post = {
  status: "draft" | "published";
  createdAt: Date;
  price: number;
};

describe("createModuleSwrKey", () => {
  it("normalizes db to databaseId and does not serialize the db object itself", () => {
    const constraints = [where<Post>("status", "==", "published"), orderBy<Post>("createdAt", "desc")];
    const aggregate = { avgPrice: average<Post>("price") };
    const db = {
      databaseId: { database: "(default)", projectId: "project-a" },
      toJSON: () => ({ databaseId: { database: "(default)", projectId: "project-a" } }),
    };

    const key = createModuleSwrKey({ path: "posts", constraints, aggregate, db, isSubscription: true });

    expect(key).toMatch(/^\$sub\$/);
    expect(key).toContain("databaseId");
    expect(key).toContain("(default)");
    expect(key).not.toContain("[object Object]");
    expect(key).not.toContain("project-a");
    expect(key).not.toContain("toJSON");
    expect(key).not.toContain("materializeClient");
  });

  it("keeps the normalized key stable for equivalent db objects", () => {
    const constraints = [where<Post>("status", "==", "published"), orderBy<Post>("createdAt", "desc")];
    const aggregate = { avgPrice: average<Post>("price") };

    const keyA = createModuleSwrKey({
      path: "posts",
      constraints,
      aggregate,
      db: { databaseId: { database: "(default)", projectId: "project-a" } },
    });
    const keyB = createModuleSwrKey({
      path: "posts",
      constraints,
      aggregate,
      db: { databaseId: { database: "(default)", projectId: "project-b" } },
    });
    const keyC = createModuleSwrKey({
      path: "posts",
      constraints,
      aggregate,
      db: { databaseId: { database: "secondary", projectId: "project-c" } },
    });

    expect(keyA).toBe(keyB);
    expect(keyA).not.toBe(keyC);
  });

  it("keeps collection and collection-group keys separate", () => {
    const constraints = [where<Post>("status", "==", "published"), orderBy<Post>("createdAt", "desc")];
    const db = { databaseId: { database: "(default)", projectId: "project-a" } };

    const collectionKey = createModuleSwrKey({ path: "posts", constraints, db, isCollectionGroup: false });
    const collectionGroupKey = createModuleSwrKey({ path: "posts", constraints, db, isCollectionGroup: true });

    expect(collectionKey).not.toBe(collectionGroupKey);
    expect(collectionKey).toContain("isCollectionGroup");
    expect(collectionGroupKey).toContain("isCollectionGroup");
    expect(collectionKey).toBe(
      createModuleSwrKey({
        ...scrubModuleKey({ path: "posts", constraints, db, isCollectionGroup: false }),
        isCollectionGroup: false,
      }),
    );
    expect(collectionGroupKey).toBe(
      createModuleSwrKey({
        ...scrubModuleKey({ path: "posts", constraints, db, isCollectionGroup: true }),
        isCollectionGroup: true,
      }),
    );
  });
});
