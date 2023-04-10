import { renderHook, waitFor } from "@testing-library/react";
import { FirebaseError } from "firebase/app";
import {
  Timestamp,
  addDoc,
  collection,
  serverTimestamp,
  where,
  or,
} from "firebase/firestore";
import { useCollectionGroup } from "../../src";
import emptyMiddleware from "../supports/emptyMiddleware";
import { db } from "../supports/fb";
import { deleteCollection } from "../supports/fbUtil";
import type { Comment } from "../supports/model";

const COLLECTION = "CollectionGroupTest";
const SUB_COLLECTION = "SubCollectionTest";
const ERR_SUB_COLLECTION = "SubCollectionErrTest";
describe("useCollectionGroup", () => {
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
        useCollectionGroup<Comment>({ path: SUB_COLLECTION })
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
      expect(el.createdAt).toBeDefined();
      expect(el.createdAt instanceof Timestamp).toBe(true);
      unmount();
    });
  });
  describe("with parseDates option", () => {
    it("should fetch data from Firestore", async () => {
      const { result, unmount } = renderHook(() =>
        useCollectionGroup<Comment>({
          path: SUB_COLLECTION,
          parseDates: ["createdAt"],
        })
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
      await addDoc(subRef, {
        content: "foo",
        createdAt: serverTimestamp(),
      });
      await addDoc(subRef, {
        content: "bar",
        createdAt: serverTimestamp(),
      });
      const { result, unmount } = renderHook(() =>
        useCollectionGroup<Comment>({
          path: SUB_COLLECTION,
          where: [["content", "==", "foo"]],
        })
      );
      await waitFor(() => expect(result.current.data != null).toBe(true), {
        timeout: 5000,
      });
      const el = result.current.data![0];
      expect(el.id).toBeDefined();
      expect(el.exists).toBeDefined();
      expect(el.ref).toBeDefined();
      result.current.data?.forEach((x) => {
        expect(x.content).toBe("foo");
      });
      unmount();
    });
  });

  describe("with orderBy option", () => {
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
        useCollectionGroup<Comment>({
          path: SUB_COLLECTION,
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
        useCollectionGroup<Comment>({
          path: SUB_COLLECTION,
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
  describe("with query cursor", () => {
    describe("with startAt", () => {
      it("should fetch data from Firestore", async () => {
        const { result, unmount } = renderHook(() =>
          useCollectionGroup<Comment>({
            path: SUB_COLLECTION,
            orderBy: [["sortableId", "asc"]],
            startAt: [10],
          })
        );
        await waitFor(() => expect(result.current.data != null).toBe(true), {
          timeout: 5000,
        });
        expect(result.current.data!.length > 0).toBe(true);
        result.current.data?.forEach((x) => {
          const sortableId = x.sortableId ?? 0;
          expect(sortableId >= 10).toBe(true);
        });
        unmount();
      });
    });
    describe("with startAfter", () => {
      it("should fetch data from Firestore", async () => {
        const { result, unmount } = renderHook(() =>
          useCollectionGroup<Comment>({
            path: SUB_COLLECTION,
            orderBy: [["sortableId", "asc"]],
            startAfter: [10],
          })
        );
        await waitFor(() => expect(result.current.data != null).toBe(true), {
          timeout: 5000,
        });
        expect(result.current.data!.length > 0).toBe(true);
        result.current.data?.forEach((x) => {
          const sortableId = x.sortableId ?? 0;
          expect(sortableId > 10).toBe(true);
        });
        unmount();
      });
    });
    describe("with endAt", () => {
      it("should fetch data from Firestore", async () => {
        const { result, unmount } = renderHook(() =>
          useCollectionGroup<Comment>({
            path: SUB_COLLECTION,
            orderBy: [["sortableId", "asc"]],
            endAt: [100],
          })
        );
        await waitFor(() => expect(result.current.data != null).toBe(true), {
          timeout: 5000,
        });
        expect(result.current.data!.length > 0).toBe(true);
        result.current.data?.forEach((x) => {
          const sortableId = x.sortableId ?? 0;
          expect(sortableId <= 100).toBe(true);
        });
        unmount();
      });
    });
    describe("with endBefore", () => {
      it("should fetch data from Firestore", async () => {
        const { result, unmount } = renderHook(() =>
          useCollectionGroup<Comment>({
            path: SUB_COLLECTION,
            orderBy: [["sortableId", "asc"]],
            endBefore: [100],
          })
        );
        await waitFor(() => expect(result.current.data != null).toBe(true), {
          timeout: 5000,
        });
        expect(result.current.data!.length > 0).toBe(true);
        result.current.data?.forEach((x) => {
          const sortableId = x.sortableId ?? 0;
          expect(sortableId < 100).toBe(true);
        });
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
        useCollectionGroup<Comment>({
          path: SUB_COLLECTION,
          queryConstraints: [
            or(where("content", "==", "foo"), where("content", "==", "bar")),
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
        useCollectionGroup<Comment>(
          {
            path: SUB_COLLECTION,
          },
          { use: [emptyMiddleware] }
        )
      );
      await waitFor(() => expect(result.current.data != null).toBe(true), {
        timeout: 5000,
      });
      expect(result.current.data!.length! > 0).toBe(true);
      unmount();
    });
  });
  describe("error", () => {
    it("should return FirestoreError", async () => {
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
        useCollectionGroup<Comment>({
          path: ERR_SUB_COLLECTION,
        })
      );
      await waitFor(() => expect(result.current.error != null).toBe(true), {
        timeout: 5000,
      });
      expect(result.current.error instanceof FirebaseError).toBe(true);
      unmount();
    });
  });
});
