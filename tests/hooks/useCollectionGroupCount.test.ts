import {  renderHook, waitFor } from "@testing-library/react";
import {  addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useCollectionGroupCount } from "../../src";
import { db } from "../supports/fb";
import { deleteCollection } from "../supports/fbUtil";
import type { Post } from "../supports/model";

const COLLECTION = "CollectionGroupCountTest";
const SUB_COLLECTION = "SubCollectionCountTest";

describe("useCollectionGroupCount", () => {
  beforeEach(async () => {
    await deleteCollection(COLLECTION);
    const ref = collection(db, COLLECTION);
    const doc = await addDoc(ref, {
      content: "hello",
      status: "draft",
      createdAt: serverTimestamp(),
    });
    const subRef = collection(db, `${COLLECTION}/${doc.id}/${SUB_COLLECTION}`);
    await addDoc(subRef, {
      content: "hello",
      createdAt: serverTimestamp(),
    });
  });
  afterEach(async () => {
    await deleteCollection(COLLECTION);
  });
  describe("without option", () => {
    it("should fetch data from Firestore", async () => {
      const { result, unmount } = renderHook(() => useCollectionGroupCount<Post>({ path: SUB_COLLECTION }));
      await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 });
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data != null).toBe(true);
      expect(result.current.data).toBe(1);
      unmount();
    });
  });
  describe("with where option", () => {
    it("should fetch data from Firestore", async () => {
      const ref = collection(db, COLLECTION);
      const doc = await addDoc(ref, {
        content: "hello",
        status: "draft",
        createdAt: serverTimestamp(),
      });
      const subRef = collection(db, `${COLLECTION}/${doc.id}/${SUB_COLLECTION}`);
      await addDoc(subRef, {
        content: "foo",
        createdAt: serverTimestamp(),
      });
      const { result, unmount } = renderHook(() => useCollectionGroupCount<Post>({ path: SUB_COLLECTION, where: [["content", "==", "foo"]] }));
      await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 });
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data != null).toBe(true);
      expect(result.current.data).toBe(1);
      unmount();
    });
  });
});
