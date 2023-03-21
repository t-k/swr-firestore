import { renderHook, waitFor } from "@testing-library/react";
import {
  Timestamp,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { useCollectionGroup } from "../../src";
import { db } from "../supports/fb";
import { deleteCollection } from "../supports/fbUtil";
import type { Post } from "../supports/model";

const COLLECTION = "CollectionGroupTest";
const SUB_COLLECTION = "SubCollectionTest";

describe("useCollectionGroup", () => {
  beforeEach(async () => {
    await deleteCollection(COLLECTION, SUB_COLLECTION);
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
    await deleteCollection(COLLECTION, SUB_COLLECTION);
  });
  describe("without option", () => {
    it("should fetch data from Firestore", async () => {
      const { result, unmount } = renderHook(() =>
        useCollectionGroup<Post>({ path: SUB_COLLECTION })
      );
      await waitFor(() => expect(result.current.data != null).toBe(true), {
        timeout: 5000,
      });
      expect(result.current.data?.length).toBe(1);
      const el = result.current.data![0];
      expect(el.id).toBeDefined();
      expect(el.exists).toBeDefined();
      expect(el.ref).toBeDefined();
      expect(el.content).toBeDefined();
      expect(el.createdAt).toBeDefined();
      expect(el.createdAt instanceof Timestamp).toBe(true);
      unmount();
    });
  });
  describe("with parseDates option", () => {
    it("should fetch data from Firestore", async () => {
      const { result, unmount } = renderHook(() =>
        useCollectionGroup<Post>({
          path: SUB_COLLECTION,
          parseDates: ["createdAt"],
        })
      );
      await waitFor(() => expect(result.current.data != null).toBe(true), {
        timeout: 5000,
      });
      expect(result.current.data?.length).toBe(1);
      const el = result.current.data![0];
      expect(el.id).toBeDefined();
      expect(el.exists).toBeDefined();
      expect(el.ref).toBeDefined();
      expect(el.content).toBeDefined();
      expect(el.createdAt).toBeDefined();
      expect(el.createdAt instanceof Date).toBe(true);
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
      const subRef = collection(
        db,
        `${COLLECTION}/${doc.id}/${SUB_COLLECTION}`
      );
      await addDoc(subRef, {
        content: "foo",
        createdAt: serverTimestamp(),
      });
      const { result, unmount } = renderHook(() =>
        useCollectionGroup<Post>({
          path: SUB_COLLECTION,
          where: [["content", "==", "foo"]],
        })
      );
      await waitFor(() => expect(result.current.data != null).toBe(true), {
        timeout: 5000,
      });
      expect(result.current.data?.length).toBe(1);
      const el = result.current.data![0];
      expect(el.id).toBeDefined();
      expect(el.exists).toBeDefined();
      expect(el.ref).toBeDefined();
      unmount();
    });
  });
});
