import { act, renderHook, waitFor } from "@testing-library/react";
import {
  CollectionReference,
  Timestamp,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { useCollection } from "../../src";
import { db } from "../supports/fb";
import { deleteCollection } from "../supports/fbUtil";
import type { Post } from "../supports/model";

const COLLECTION = "CollectionTest";

describe("useCollection", () => {
  beforeEach(async () => {
    await deleteCollection(COLLECTION);
  });
  afterEach(async () => {
    await deleteCollection(COLLECTION);
  });
  describe("without option", () => {
    it("should fetch data from Firestore", async () => {
      const ref = collection(db, COLLECTION) as CollectionReference<Post>;
      const { result, unmount } = renderHook(() =>
        useCollection<Post>({ path: COLLECTION })
      );
      await act(async () => {
        await addDoc(ref, {
          content: "hello",
          status: "draft",
          createdAt: serverTimestamp(),
        });
        return;
      });
      await waitFor(() => expect(result.current.data != null).toBe(true), {
        timeout: 5000,
      });
      expect(result.current.data?.length).toBe(1);
      const el = result.current.data![0];
      expect(el.id).toBeDefined();
      expect(el.exists).toBeDefined();
      expect(el.ref).toBeDefined();
      expect(el.content).toBeDefined();
      expect(el.status).toBeDefined();
      expect(el.createdAt).toBeDefined();
      expect(el.createdAt instanceof Timestamp).toBe(true);
      unmount();
    });
  });
  describe("with parseDates option", () => {
    it("should fetch data from Firestore", async () => {
      const ref = collection(db, COLLECTION) as CollectionReference<Post>;
      await addDoc(ref, {
        content: "hello",
        status: "published",
        createdAt: serverTimestamp(),
      });
      await addDoc(ref, {
        content: "hello",
        status: "draft",
        createdAt: serverTimestamp(),
      });
      const { result, unmount } = renderHook(() =>
        useCollection<Post>({ path: COLLECTION, parseDates: ["createdAt"] })
      );
      await waitFor(() => expect(result.current.data != null).toBe(true), {
        timeout: 5000,
      });
      const el = result.current.data![0];
      expect(el.createdAt).toBeDefined();
      expect(el.createdAt instanceof Date).toBe(true);
      unmount();
    });
  });
  describe("with where option", () => {
    it("should fetch data from Firestore", async () => {
      const ref = collection(db, COLLECTION) as CollectionReference<Post>;
      await addDoc(ref, {
        content: "hello",
        status: "published",
        createdAt: serverTimestamp(),
      });
      await addDoc(ref, {
        content: "hello",
        status: "draft",
        createdAt: serverTimestamp(),
      });
      const { result, unmount } = renderHook(() =>
        useCollection<Post>({
          path: COLLECTION,
          where: [["status", "==", "published"]],
        })
      );
      await waitFor(() => expect(result.current.data != null).toBe(true), {
        timeout: 5000,
      });
      unmount();
    });
  });
});
