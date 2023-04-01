import { renderHook, waitFor } from "@testing-library/react";
import { FirebaseError } from "firebase/app";
import {
  CollectionReference,
  Timestamp,
  addDoc,
  collection,
  serverTimestamp,
  or,
  where,
  orderBy,
} from "firebase/firestore";
import { useCollection } from "../../src";
import emptyMiddleware from "../supports/emptyMiddleware";
import { db } from "../supports/fb";
import { deleteCollection } from "../supports/fbUtil";
import type { Post } from "../supports/model";

const COLLECTION = "CollectionTest";
const ERR_COLLECTION = "CollectionErrTest";

describe("useCollection", () => {
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
  describe("key is null", () => {
    it("should fetch no data", async () => {
      const { result, unmount } = renderHook(() => useCollection<Post>(null));
      expect(result.current.data != null);
      unmount();
    });
  });
  describe("without option", () => {
    it("should fetch data from Firestore", async () => {
      const { result, unmount } = renderHook(() =>
        useCollection<Post>({ path: COLLECTION })
      );
      await waitFor(() => expect(result.current.data != null).toBe(true), {
        timeout: 5000,
      });
      expect(result.current.data!.length > 0).toBe(true);
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
      const { result, unmount } = renderHook(() =>
        useCollection<Post>({ path: COLLECTION, parseDates: ["createdAt"] })
      );
      await waitFor(() => expect(result.current.data != null).toBe(true), {
        timeout: 5000,
      });
      const el = result.current.data![0];
      expect(el.id).toBeDefined();
      expect(el.exists).toBeDefined();
      expect(el.ref).toBeDefined();
      expect(el.content).toBeDefined();
      expect(el.status).toBeDefined();
      expect(el.createdAt).toBeDefined();
      expect(el.createdAt instanceof Date).toBe(true);
      unmount();
    });
  });
  describe("with where option", () => {
    it("should fetch data from Firestore", async () => {
      const { result, unmount } = renderHook(() =>
        useCollection<Post>({
          path: COLLECTION,
          where: [["status", "==", "draft"]],
        })
      );
      await waitFor(() => expect(result.current.data != null).toBe(true), {
        timeout: 5000,
      });
      result.current.data?.forEach((x) => {
        expect(x.status).toBe("draft");
      });
      unmount();
    });
  });
  describe("with order option", () => {
    it("should fetch data from Firestore", async () => {
      const { result, unmount } = renderHook(() =>
        useCollection<Post>({
          path: COLLECTION,
          orderBy: [["createdAt", "desc"]],
        })
      );
      await waitFor(() => expect(result.current.data != null).toBe(true), {
        timeout: 5000,
      });
      const data1 = result.current!.data![0];
      const data2 = result.current!.data![1];
      expect(data1.createdAt > data2.createdAt).toBe(true);
      unmount();
    });
  });

  describe("with limit option", () => {
    it("should fetch data from Firestore", async () => {
      const { result, unmount } = renderHook(() =>
        useCollection<Post>({
          path: COLLECTION,
          limit: 1,
        })
      );
      await waitFor(() => expect(result.current.data != null).toBe(true), {
        timeout: 5000,
      });
      expect(result.current.data?.length).toBe(1);
      unmount();
    });
  });
  describe("with nested object", () => {
    it("should fetch data from Firestore", async () => {
      const { result, unmount } = renderHook(() =>
        useCollection<Post>({
          path: COLLECTION,
          parseDates: ["createdAt", "author.createdAt"],
        })
      );
      await waitFor(() => expect(result.current.data != null).toBe(true), {
        timeout: 5000,
      });
      const el = result.current.data![0];
      expect(el.createdAt).toBeDefined();
      expect(el.createdAt instanceof Date).toBe(true);
      expect(el.author?.createdAt instanceof Date).toBe(true);
      unmount();
    });
  });

  describe("with queryConstraints", () => {
    it("should fetch data from Firestore", async () => {
      const { result, unmount } = renderHook(() =>
        useCollection<Post>({
          path: COLLECTION,
          queryConstraints: [
            or(
              where("content", "==", "hello"),
              where("status", "==", "published")
            ),
            orderBy("createdAt", "desc"),
          ],
        })
      );
      await waitFor(() => expect(result.current.data != null).toBe(true), {
        timeout: 5000,
      });
      expect(result.current.data?.length).toBe(2);
      unmount();
    });
  });
  describe("with swr config", () => {
    it("should fetch data from Firestore", async () => {
      const { result, unmount } = renderHook(() =>
        useCollection<Post>(
          {
            path: COLLECTION,
          },
          { use: [emptyMiddleware] }
        )
      );
      await waitFor(() => expect(result.current.data != null).toBe(true), {
        timeout: 5000,
      });
      expect(result.current.data!.length > 0).toBe(true);
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
        useCollection<Post>({
          path: ERR_COLLECTION,
          queryConstraints: [
            or(
              where("content", "==", "hello"),
              where("status", "==", "published")
            ),
            orderBy("createdAt", "desc"),
          ],
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
