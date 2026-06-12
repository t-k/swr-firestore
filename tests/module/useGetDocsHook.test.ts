import { createElement } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SWRConfig } from "swr";
import { unstable_serialize } from "swr";

import { orderBy, where } from "../../src/module/query";
import { useGetDocs } from "../../src/module";
import { useCollection } from "../../src/module/subscription";
import createModuleSwrKey from "../../src/module/server/util/createKey";
import { scrubModuleKey } from "../../src/module/util/scrubKey";
import { db } from "../supports/fb";

type Post = {
  status: "draft" | "published";
  createdAt: Date;
};

const createQueryStub = () => ({
  withConverter: () => createQueryStub(),
  get: async () => ({
    docs: [
      {
        data: () => ({
          id: "post-1",
          exists: true,
          ref: {},
          status: "published" as const,
          createdAt: new Date("2025-01-01"),
        }),
      },
    ],
  }),
});

describe("module useGetDocs hook key path", () => {
  it("stores the normal collection key with an explicit false collection-group discriminator", async () => {
    const cache = new Map();
    const wrapper = ({ children }: { children: unknown }) =>
      createElement(SWRConfig, { value: { provider: () => cache } }, children as never);

    const constraints = [
      where<Post>("status", "==", "published"),
      orderBy<Post>("createdAt", "desc"),
    ];
    const db = {
      databaseId: { database: "(default)", projectId: "project-a" },
      collection: () => createQueryStub(),
    };

    renderHook(
      () =>
        useGetDocs<Post>({
          path: "posts",
          db,
          constraints,
        }),
      { wrapper },
    );

    const expectedKey = unstable_serialize(
      scrubModuleKey({ path: "posts", db, constraints, isCollectionGroup: false }),
    );

    await waitFor(() => {
      expect(cache.has(expectedKey)).toBe(true);
    });
  });

  it("stores the subscription key compatible with module/server getCollection", async () => {
    const cache = new Map();
    const wrapper = ({ children }: { children: unknown }) =>
      createElement(SWRConfig, { value: { provider: () => cache } }, children as never);

    const constraints = [where<Post>("status", "==", "published")];
    const expectedKey = createModuleSwrKey({
      path: "posts",
      db,
      constraints,
      isSubscription: true,
      isCollectionGroup: false,
    });

    const { unmount } = renderHook(
      () =>
        useCollection<Post>({
          path: "posts",
          db,
          constraints,
        }),
      { wrapper },
    );

    await waitFor(() => {
      expect(cache.has(expectedKey)).toBe(true);
    });
    unmount();
  });
});
