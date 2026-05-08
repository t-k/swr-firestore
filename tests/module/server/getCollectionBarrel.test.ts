import { describe, expect, it } from "vitest";

import { getCollection } from "../../../src/module/server";

type Post = {
  content: string;
  status: "draft" | "published";
};

describe("module server barrel", () => {
  it("exposes getCollection through the local barrel", async () => {
    const db = {
      collection: () => ({
        withConverter: () => ({
          get: async () => ({
            docs: [
              {
                data: () => ({
                  content: "hello",
                  status: "published",
                }),
              },
            ],
          }),
        }),
      }),
    };

    const result = await getCollection<Post>({ path: "posts", db, isSubscription: true });

    expect(result.key).toMatch(/^\$sub\$/);
    expect(result.data).toHaveLength(1);
    expect(result.data?.[0].content).toBe("hello");
  });
});
