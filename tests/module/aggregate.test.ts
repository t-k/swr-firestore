import { renderHook, waitFor } from "@testing-library/react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { useCollectionCount, useCollectionGroupCount } from "../../src/module/aggregate";
import { db } from "../supports/fb";
import { deleteCollection } from "../supports/fbUtil";

type Post = {
  status: "draft" | "published";
};

const COLLECTION = "FetchCollectionCountTest";
const GROUP_PARENT = "FetchCollectionGroupCountParent";
const GROUP_SUB_COLLECTION = "FetchSubCollectionGroupCountTest";

describe("module aggregate barrel", () => {
  beforeAll(async () => {
    await deleteCollection(COLLECTION);
    await deleteCollection(GROUP_PARENT, [GROUP_SUB_COLLECTION]);

    const collectionRef = collection(db, COLLECTION);
    await addDoc(collectionRef, { status: "draft", createdAt: serverTimestamp() });
    await addDoc(collectionRef, { status: "published", createdAt: serverTimestamp() });
    await addDoc(collectionRef, { status: "draft", createdAt: serverTimestamp() });

    const parentRef = collection(db, GROUP_PARENT);
    const parent = await addDoc(parentRef, { title: "parent", createdAt: serverTimestamp() });
    const groupRef = collection(db, `${GROUP_PARENT}/${parent.id}/${GROUP_SUB_COLLECTION}`);
    await addDoc(groupRef, { status: "draft", createdAt: serverTimestamp() });
    await addDoc(groupRef, { status: "published", createdAt: serverTimestamp() });
  });

  afterAll(async () => {
    await deleteCollection(COLLECTION);
    await deleteCollection(GROUP_PARENT, [GROUP_SUB_COLLECTION]);
  });

  it("fetches collection counts through the local aggregate barrel", async () => {
    const { result } = renderHook(() =>
      useCollectionCount<Post>({
        path: COLLECTION,
        db,
      }),
    );

    await waitFor(() => expect(result.current.data).toBe(3));
  });

  it("fetches collection group counts through the local aggregate barrel", async () => {
    const { result } = renderHook(() =>
      useCollectionGroupCount<Post>({
        path: GROUP_SUB_COLLECTION,
        db,
      }),
    );

    await waitFor(() => expect(result.current.data).toBe(2));
  });
});
