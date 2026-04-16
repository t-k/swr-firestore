import { describe, expect, it } from "vitest";
import { average, orderBy, where } from "../../../src/module/query";
import createModuleSwrKey from "../../../src/module/server/util/createKey";

type Post = {
  status: "draft" | "published";
  createdAt: Date;
  price: number;
};

describe("createModuleSwrKey", () => {
  it("serializes constraints and aggregate without materializer noise", () => {
    const key = createModuleSwrKey({
      path: "posts",
      constraints: [where<Post>("status", "==", "published"), orderBy<Post>("createdAt", "desc")],
      aggregate: { avgPrice: average<Post>("price") },
      isSubscription: true,
    });

    expect(key).toMatch(/^\$sub\$/);
    expect(key).toContain('field:"status"');
    expect(key).toContain("avgPrice");
    expect(key).not.toContain("materializeClient");
  });
});
