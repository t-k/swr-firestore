import { FieldPath, type Query } from "firebase-admin/firestore";
import { describe, expect, it, vi } from "vitest";

import { orderBy, where } from "../../../src/module/query";
import { applyModuleConstraints } from "../../../src/module/server/util/buildQuery";

type Post = {
  status: "draft" | "published";
  createdAt: Date;
};

describe("applyModuleConstraints", () => {
  it("uses FieldPath.documentId for collection id constraints", () => {
    const documentId = {} as FieldPath;
    const documentIdSpy = vi.spyOn(FieldPath, "documentId").mockReturnValue(documentId);
    const query = {
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
    } as unknown as Query;

    applyModuleConstraints<Post>(query, [
      where<Post>("id", "==", "post-1"),
      orderBy<Post>("id", "asc"),
    ]);

    expect(documentIdSpy).toHaveBeenCalledTimes(2);
    expect(query.where).toHaveBeenCalledWith(documentId, "==", "post-1");
    expect(query.orderBy).toHaveBeenCalledWith(documentId, "asc");

    documentIdSpy.mockRestore();
  });
});
