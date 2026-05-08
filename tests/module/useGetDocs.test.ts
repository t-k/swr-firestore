import { renderHook, waitFor } from "@testing-library/react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { where } from "../../src/module/query";
import { useGetDocs } from "../../src/module";
import { db } from "../supports/fb";
import { deleteCollection } from "../supports/fbUtil";
import type { ModuleTestComment } from "../supports/model";

const COLLECTION = "ModuleGetDocsTest";
const SUB_COLLECTION = "ModuleUseGetDocsSub";

describe("module useGetDocs", () => {
  beforeAll(async () => {
    await deleteCollection(COLLECTION, [SUB_COLLECTION]);
    const ref = collection(db, COLLECTION);
    const parent = await addDoc(ref, {
      content: "parent",
      status: "draft",
      createdAt: serverTimestamp(),
    });
    const subRef = collection(db, `${COLLECTION}/${parent.id}/${SUB_COLLECTION}`);
    await addDoc(subRef, {
      content: "foo",
      createdAt: serverTimestamp(),
      sortableId: 1,
    });
    await addDoc(subRef, {
      content: "bar",
      createdAt: serverTimestamp(),
      sortableId: 10,
    });
  });

  afterAll(async () => {
    await deleteCollection(COLLECTION, [SUB_COLLECTION]);
  });

  it("fetches collection group documents with shared constraints", async () => {
    const { result } = renderHook(() =>
      useGetDocs<ModuleTestComment>({
        path: SUB_COLLECTION,
        db,
        isCollectionGroup: true,
        constraints: [where<ModuleTestComment>("content", "==", "foo")],
      }),
    );

    await waitFor(() => {
      expect(result.current.data).toHaveLength(1);
      expect(result.current.data?.every((comment) => comment.content === "foo")).toBe(true);
    });
  });
});
