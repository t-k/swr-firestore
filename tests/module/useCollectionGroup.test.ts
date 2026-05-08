import { renderHook, waitFor } from "@testing-library/react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { where } from "../../src/module/query";
import { useCollectionGroup } from "../../src/module/subscription";
import { db } from "../supports/fb";
import { deleteCollection } from "../supports/fbUtil";
import type { ModuleTestComment } from "../supports/model";

const COLLECTION = "ModuleCollectionGroupTest";
const SUB_COLLECTION = "ModuleUseCollectionGroupSub";

describe("module useCollectionGroup", () => {
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

  it("subscribes to collection group documents through the public barrel", async () => {
    const { result } = renderHook(() =>
      useCollectionGroup<ModuleTestComment>({
        path: SUB_COLLECTION,
        db,
        constraints: [where<ModuleTestComment>("content", "==", "foo")],
      }),
    );

    await waitFor(() => {
      expect(result.current.data).toHaveLength(1);
      expect(result.current.data?.[0].content).toBe("foo");
    });
  });
});
