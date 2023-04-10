import { renderHook, waitFor } from "@testing-library/react";
import { FirebaseError } from "firebase/app";
import {
  addDoc,
  collection,
  or,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { useCollectionGroupCount } from "../../src";
import emptyMiddleware from "../supports/emptyMiddleware";
import { db } from "../supports/fb";
import { deleteCollection } from "../supports/fbUtil";
import type { Comment } from "../supports/model";

const COLLECTION = "CollectionGroupCountTest";
const SUB_COLLECTION = "SubCollectionCountTest";
const ERR_SUB_COLLECTION = "SubCollectionCountErrTest";

describe("useCollectionGroupCount", () => {
  beforeEach(async () => {
    await deleteCollection(COLLECTION, [SUB_COLLECTION, ERR_SUB_COLLECTION]);
    const ref = collection(db, COLLECTION);
    const doc = await addDoc(ref, {
      content: "hello",
      status: "draft",
      createdAt: serverTimestamp(),
    });
    const subRef = collection(db, `${COLLECTION}/${doc.id}/${SUB_COLLECTION}`);
    await Promise.all(
      [1, 10, 100, 1000].map((x) => {
        return addDoc(subRef, {
          content: "hello",
          createdAt: serverTimestamp(),
          sortableId: x,
        });
      })
    );
  });
  afterEach(async () => {
    await deleteCollection(COLLECTION, [SUB_COLLECTION, ERR_SUB_COLLECTION]);
  });
  describe("without option", () => {
    it("should fetch data from Firestore", async () => {
      const { result, unmount } = renderHook(() =>
        useCollectionGroupCount<Comment>({ path: SUB_COLLECTION })
      );
      await waitFor(() => expect(result.current.isLoading).toBe(false), {
        timeout: 5000,
      });
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data != null).toBe(true);
      expect(result.current.data).toBe(4);
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
        useCollectionGroupCount<Comment>({
          path: SUB_COLLECTION,
          where: [["content", "==", "foo"]],
        })
      );
      await waitFor(() => expect(result.current.isLoading).toBe(false), {
        timeout: 5000,
      });
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data != null).toBe(true);
      expect(result.current.data).toBe(1);
      unmount();
    });
  });

  describe("with limit option", () => {
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
        useCollectionGroupCount<Comment>({
          path: SUB_COLLECTION,
          limit: 1,
        })
      );
      await waitFor(() => expect(result.current.isLoading).toBe(false), {
        timeout: 5000,
      });
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data != null).toBe(true);
      expect(result.current.data).toBe(1);
      unmount();
    });
  });

  describe("with query cursor", () => {
    describe("with startAt", () => {
      it("should fetch data from Firestore", async () => {
        const { result, unmount } = renderHook(() =>
          useCollectionGroupCount<Comment>({
            path: SUB_COLLECTION,
            orderBy: [["sortableId", "asc"]],
            startAt: [10],
          })
        );
        await waitFor(() => expect(result.current.isLoading).toBe(false), {
          timeout: 5000,
        });
        expect(result.current.isLoading).toBe(false);
        expect(result.current.data).toBe(3);
        unmount();
      });
    });
    describe("with startAfter", () => {
      it("should fetch data from Firestore", async () => {
        const { result, unmount } = renderHook(() =>
          useCollectionGroupCount<Comment>({
            path: SUB_COLLECTION,
            orderBy: [["sortableId", "asc"]],
            startAfter: [10],
          })
        );
        await waitFor(() => expect(result.current.isLoading).toBe(false), {
          timeout: 5000,
        });
        expect(result.current.isLoading).toBe(false);
        expect(result.current.data).toBe(2);
        unmount();
      });
    });
    describe("with endAt", () => {
      it("should fetch data from Firestore", async () => {
        const { result, unmount } = renderHook(() =>
          useCollectionGroupCount<Comment>({
            path: SUB_COLLECTION,
            orderBy: [["sortableId", "asc"]],
            endAt: [100],
          })
        );
        await waitFor(() => expect(result.current.isLoading).toBe(false), {
          timeout: 5000,
        });
        expect(result.current.isLoading).toBe(false);
        expect(result.current.data).toBe(3);
        unmount();
      });
    });
    describe("with endBefore", () => {
      it("should fetch data from Firestore", async () => {
        const { result, unmount } = renderHook(() =>
          useCollectionGroupCount<Comment>({
            path: SUB_COLLECTION,
            orderBy: [["sortableId", "asc"]],
            endBefore: [100],
          })
        );
        await waitFor(() => expect(result.current.isLoading).toBe(false), {
          timeout: 5000,
        });
        expect(result.current.isLoading).toBe(false);
        expect(result.current.data).toBe(2);
        unmount();
      });
    });
  });
  describe("with queryConstraints", () => {
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
      await addDoc(subRef, {
        content: "bar",
        createdAt: serverTimestamp(),
      });
      const { result, unmount } = renderHook(() =>
        useCollectionGroupCount<Comment>({
          path: SUB_COLLECTION,
          queryConstraints: [
            or(where("content", "==", "foo"), where("content", "==", "bar")),
          ],
        })
      );
      await waitFor(() => expect(result.current.isLoading).toBe(false), {
        timeout: 5000,
      });
      expect(result.current.data).toBe(2);
      unmount();
    });
  });

  describe("with swr config", () => {
    it("should fetch data from Firestore", async () => {
      const { result, unmount } = renderHook(() =>
        useCollectionGroupCount<Comment>(
          {
            path: SUB_COLLECTION,
          },
          { use: [emptyMiddleware] }
        )
      );
      await waitFor(() => expect(result.current.data != null).toBe(true), {
        timeout: 5000,
      });
      expect(result.current.data! > 0).toBe(true);
      unmount();
    });
  });
  describe("error", () => {
    it("should return FirebaseError", async () => {
      const ref = collection(db, COLLECTION);
      const doc = await addDoc(ref, {
        content: "hello",
        status: "draft",
        createdAt: serverTimestamp(),
      });
      const subRef = collection(
        db,
        `${COLLECTION}/${doc.id}/${ERR_SUB_COLLECTION}`
      );
      await addDoc(subRef, {
        content: "foo",
        createdAt: serverTimestamp(),
      });
      const { result, unmount } = renderHook(() =>
        useCollectionGroupCount<Comment>({
          path: ERR_SUB_COLLECTION,
        })
      );
      await waitFor(() => expect(result.current.isLoading).toBe(false), {
        timeout: 5000,
      });
      expect(result.current.error instanceof FirebaseError).toBe(true);
      unmount();
    });
  });
});
