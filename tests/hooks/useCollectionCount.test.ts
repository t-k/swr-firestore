import { renderHook, waitFor } from "@testing-library/react";
import {
  CollectionReference,
  addDoc,
  collection,
  serverTimestamp,
  where,
  or,
} from "firebase/firestore";
import { useCollectionCount } from "../../src";
import { db } from "../supports/fb";
import { deleteCollection } from "../supports/fbUtil";
import type { Post } from "../supports/model";
import { FirebaseError } from "firebase/app";
import emptyMiddleware from "../supports/emptyMiddleware";

const COLLECTION = "CountTest";
const ERR_COLLECTION = "CountErrTest";
describe("useCollectionCount", () => {
  beforeAll(async () => {
    await deleteCollection(COLLECTION);
    await deleteCollection(ERR_COLLECTION);
    const ref = collection(db, COLLECTION) as CollectionReference<Post>;
    await addDoc(ref, {
      content: "foo",
      status: "draft",
      createdAt: serverTimestamp(),
      author: {
        name: "John",
        createdAt: serverTimestamp(),
      },
    });
    await addDoc(ref, {
      content: "bar",
      status: "published",
      createdAt: serverTimestamp(),
      author: {
        name: "John",
        createdAt: serverTimestamp(),
      },
    });
    await addDoc(ref, {
      content: "baz",
      status: "published",
      createdAt: serverTimestamp(),
      author: {
        name: "John",
        createdAt: serverTimestamp(),
      },
    });
    await addDoc(ref, {
      content: "qux",
      status: "draft",
      createdAt: serverTimestamp(),
      author: {
        name: "John",
        createdAt: serverTimestamp(),
      },
    });
  });
  afterAll(async () => {
    await deleteCollection(COLLECTION);
    await deleteCollection(ERR_COLLECTION);
  });
  describe("without option", () => {
    it("should fetch data from Firestore", async () => {
      const { result, unmount } = renderHook(() =>
        useCollectionCount<Post>({ path: COLLECTION })
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
      const { result, unmount } = renderHook(() =>
        useCollectionCount<Post>({
          path: COLLECTION,
          where: [["status", "==", "published"]],
        })
      );
      await waitFor(() => expect(result.current.isLoading).toBe(false), {
        timeout: 5000,
      });
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data != null).toBe(true);
      expect(result.current.data).toBe(2);
      unmount();
    });
  });

  describe("with limit option", () => {
    it("should fetch data from Firestore", async () => {
      const { result, unmount } = renderHook(() =>
        useCollectionCount<Post>({
          path: COLLECTION,
          limit: 1,
        })
      );
      await waitFor(() => expect(result.current.isLoading).toBe(false), {
        timeout: 5000,
      });
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBe(1);
      unmount();
    });
  });

  describe("with queryConstraints", () => {
    it("should fetch data from Firestore", async () => {
      const { result, unmount } = renderHook(() =>
        useCollectionCount<Post>({
          path: COLLECTION,
          queryConstraints: [
            or(
              where("content", "==", "foo"),
              where("status", "==", "published")
            ),
          ],
        })
      );
      await waitFor(() => expect(result.current.isLoading).toBe(false), {
        timeout: 5000,
      });
      expect(result.current.data).toBe(3);
      unmount();
    });
  });

  describe("with swr config", () => {
    it("should fetch data from Firestore", async () => {
      const { result, unmount } = renderHook(() =>
        useCollectionCount<Post>(
          {
            path: COLLECTION,
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
      const ref = collection(db, ERR_COLLECTION) as CollectionReference<Post>;
      await addDoc(ref, {
        content: "hello",
        status: "draft",
        createdAt: serverTimestamp(),
      });
      const { result, unmount } = renderHook(() =>
        useCollectionCount<Post>({
          path: ERR_COLLECTION,
        })
      );
      await waitFor(
        () =>
          expect(
            result.current.error != null || result.current.data != null
          ).toBe(true),
        {
          timeout: 5000,
        }
      );
      expect(result.current.error instanceof FirebaseError).toBe(true);
      unmount();
    });
  });
});
