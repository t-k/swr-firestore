import { describe, expect, it } from "vitest";
import { unstable_serialize } from "swr";

import { orderBy, where } from "../../src/module/query";
import createModuleSwrKey from "../../src/module/server/util/createKey";
import { scrubModuleKey } from "../../src/module/util/scrubKey";

type Post = {
  status: "draft" | "published";
  createdAt: Date;
};

describe("module useGetDocs key alignment", () => {
  it("matches module/server for the normal collection case", () => {
    const constraints = [
      where<Post>("status", "==", "published"),
      orderBy<Post>("createdAt", "desc"),
    ];
    const db = { databaseId: { database: "(default)", projectId: "project-a" } };

    const clientKey = unstable_serialize(
      scrubModuleKey({ path: "posts", constraints, db, isCollectionGroup: false }),
    );
    const serverKey = createModuleSwrKey({
      path: "posts",
      constraints,
      db,
      isCollectionGroup: false,
    });

    expect(clientKey).toBe(serverKey);
    expect(clientKey).not.toBe(
      unstable_serialize(
        scrubModuleKey({ path: "posts", constraints, db, isCollectionGroup: true }),
      ),
    );
  });

  it("keeps client keys separate for different projects with the same database name", () => {
    const constraints = [where<Post>("status", "==", "published")];
    const projectAKey = unstable_serialize(
      scrubModuleKey({
        path: "posts",
        constraints,
        db: { databaseId: { database: "(default)", projectId: "project-a" } },
        isCollectionGroup: false,
      }),
    );
    const projectBKey = unstable_serialize(
      scrubModuleKey({
        path: "posts",
        constraints,
        db: { databaseId: { database: "(default)", projectId: "project-b" } },
        isCollectionGroup: false,
      }),
    );

    expect(projectAKey).not.toBe(projectBKey);
  });
});
