import { renderHook, waitFor } from "@testing-library/react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { orderBy, where } from "../../src/module/query";
import useCollection from "../../src/module/hooks/useCollection";
import { db } from "../supports/fb";
import { deleteCollection } from "../supports/fbUtil";
import type { Post } from "../supports/model";

const COLLECTION = "CollectionTest";

describe("module useCollection", () => {
  beforeAll(async () => {
    await deleteCollection(COLLECTION);
    const ref = collection(db, COLLECTION);
    await addDoc(ref, {
      content: "foo",
      status: "draft",
      createdAt: serverTimestamp(),
      sortableId: 1,
      author: {
        name: "John",
        createdAt: serverTimestamp(),
      },
    });
    await addDoc(ref, {
      content: "bar",
      status: "published",
      createdAt: serverTimestamp(),
      sortableId: 10,
      author: {
        name: "John",
        createdAt: serverTimestamp(),
      },
    });
  });

  afterAll(async () => {
    await deleteCollection(COLLECTION);
  });

  it("subscribes with typed constraints", async () => {
    const { result } = renderHook(() =>
      useCollection<Post>({
        path: COLLECTION,
        db,
        constraints: [where<Post>("status", "==", "published"), orderBy<Post>("createdAt", "desc")],
      }),
    );

    await waitFor(() => expect(result.current.data?.length).toBeGreaterThan(0));
    expect(result.current.data?.every((post) => post.status === "published")).toBe(true);
  });
});
