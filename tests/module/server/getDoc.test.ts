import { describe, expect, it } from "vitest";
import { unstable_serialize } from "swr";

import { getDoc } from "../../../src/module/server";
import { scrubModuleKey } from "../../../src/module/util/scrubKey";

type Post = {
  content: string;
  status: "draft" | "published";
};

describe("module server getDoc", () => {
  it("returns a public getDoc result with a stable key", async () => {
    const db = {
      doc: () => ({
        withConverter: () => ({
          get: async () => ({
            data: () => ({
              content: "hello",
              status: "published",
            }),
          }),
        }),
      }),
    };

    const result = await getDoc<Post>({ path: "posts/post-1", db, isSubscription: true });

    expect(result.key).toBe(`$sub$${unstable_serialize(scrubModuleKey({ path: "posts/post-1", db }))}`);
    expect(result.data?.content).toBe("hello");
    expect(result.data?.status).toBe("published");
  });
});
