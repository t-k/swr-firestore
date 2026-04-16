import { FieldPath, type Query } from "firebase-admin/firestore";
import { describe, expect, it, vi } from "vitest";

import { orderBy, where } from "../../../src/module/query";
import { applyModuleConstraints } from "../../../src/module/server/util/buildQuery";
import type { ModuleQueryConstraint } from "../../../src/module/util/type";

type Post = {
  status: "draft" | "published";
  createdAt: Date;
};

const createQueryMock = () =>
  ({
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
  }) as unknown as Query;

describe("applyModuleConstraints", () => {
  it("uses FieldPath.documentId for collection id constraints", () => {
    const documentId = {} as FieldPath;
    const documentIdSpy = vi.spyOn(FieldPath, "documentId").mockReturnValue(documentId);
    const query = createQueryMock();

    applyModuleConstraints<Post>(query, [
      where<Post>("id", "==", "post-1"),
      orderBy<Post>("id", "asc"),
    ]);

    expect(documentIdSpy).toHaveBeenCalledTimes(2);
    expect(query.where).toHaveBeenCalledWith(documentId, "==", "post-1");
    expect(query.orderBy).toHaveBeenCalledWith(documentId, "asc");

    documentIdSpy.mockRestore();
  });

  it("passes through shared fields and limit handling", () => {
    const documentIdSpy = vi.spyOn(FieldPath, "documentId");
    const query = createQueryMock();

    applyModuleConstraints<Post>(query, [
      where<Post>("status", "==", "published"),
      orderBy<Post>("createdAt", "desc"),
      { type: "limit", scope: "shared", doc: undefined as never, value: 5 } as never,
    ]);

    expect(documentIdSpy).not.toHaveBeenCalled();
    expect(query.where).toHaveBeenCalledWith("status", "==", "published");
    expect(query.orderBy).toHaveBeenCalledWith("createdAt", "desc");
    expect(query.limit).toHaveBeenCalledWith(5);

    documentIdSpy.mockRestore();
  });

  it("keeps collection-group non-id constraints on field paths", () => {
    const documentIdSpy = vi.spyOn(FieldPath, "documentId");
    const query = createQueryMock();
    const constraints = [
      {
        type: "where",
        scope: "collectionGroup",
        doc: undefined as never,
        field: "status",
        op: "==",
        value: "published",
      },
      {
        type: "orderBy",
        scope: "collectionGroup",
        doc: undefined as never,
        field: "createdAt",
        direction: "asc",
      },
    ] as unknown as readonly ModuleQueryConstraint<Post, "collectionGroup">[];

    applyModuleConstraints<Post>(query, constraints);

    expect(documentIdSpy).not.toHaveBeenCalled();
    expect(query.where).toHaveBeenCalledWith("status", "==", "published");
    expect(query.orderBy).toHaveBeenCalledWith("createdAt", "asc");

    documentIdSpy.mockRestore();
  });
});
