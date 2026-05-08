import { describe, expect, it } from "vitest";
import { unstable_serialize } from "swr";

import { orderBy, where } from "../../src/module/query";
import { scrubModuleKey } from "../../src/module/util/scrubKey";
import { db } from "../supports/fb";
import type { ModuleTestComment } from "../supports/model";

describe("module collection key discriminator", () => {
  it("keeps collection and collection-group cache entries separate", () => {
    const constraints = [
      where<ModuleTestComment>("content", "==", "shared"),
      orderBy<ModuleTestComment>("createdAt", "desc"),
    ];

    const collectionKey = unstable_serialize(
      scrubModuleKey({
        path: "comments",
        db,
        constraints,
        isCollectionGroup: false,
      }),
    );
    const collectionGroupKey = unstable_serialize(
      scrubModuleKey({
        path: "comments",
        db,
        constraints,
        isCollectionGroup: true,
      }),
    );

    expect(collectionKey).not.toBe(collectionGroupKey);
    expect(collectionKey).toContain("isCollectionGroup");
    expect(collectionGroupKey).toContain("isCollectionGroup");
  });
});
