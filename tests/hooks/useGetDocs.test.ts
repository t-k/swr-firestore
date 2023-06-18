import { renderHook, waitFor } from "@testing-library/react";
import {
  CollectionReference,
  Timestamp,
  collection,
  doc,
  serverTimestamp,
  setDoc,
  addDoc,
  where,
  or,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { useGetDocs } from "../../src";
import { db } from "../supports/fb";
import type { Comment, Post } from "../supports/model";
import { faker } from "@faker-js/faker";
import { deleteCollection } from "../supports/fbUtil";
import { FirebaseError } from "firebase/app";
import emptyMiddleware from "../supports/emptyMiddleware";

const COLLECTION = "useGetDocsTest";
const SUB_COLLECTION = "useGetDocsCollectionGroupTest";
const ERR_COLLECTION = "useGetDocsErrTest";
describe("useGetDocs", () => {
  beforeAll(async () => {
    await deleteCollection(COLLECTION, [SUB_COLLECTION]);
    await deleteCollection(ERR_COLLECTION);
    const ref = collection(db, COLLECTION) as CollectionReference<Post>;
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
    await addDoc(ref, {
      content: "baz",
      status: "published",
      createdAt: serverTimestamp(),
      sortableId: 100,
      author: {
        name: "John",
        createdAt: serverTimestamp(),
      },
    });
    await addDoc(ref, {
      content: "qux",
      status: "draft",
      createdAt: serverTimestamp(),
      sortableId: 1000,
      author: {
        name: "John",
        createdAt: serverTimestamp(),
      },
    });
  });
  afterAll(async () => {
    await deleteCollection(COLLECTION, [SUB_COLLECTION]);
    await deleteCollection(ERR_COLLECTION);
  });
  describe("without option", () => {
    it("should fetch data from Firestore", async () => {
      const { result, unmount } = renderHook(() =>
        useGetDocs<Post>({ path: `${COLLECTION}` })
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
      expect(el.createdAt instanceof Timestamp).toBe(true);
      unmount();
    });
  });
  describe("parseDates option", () => {
    it("should fetch data from Firestore", async () => {
      const { result, unmount } = renderHook(() =>
        useGetDocs<Post>({ path: `${COLLECTION}`, parseDates: ["createdAt"] })
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
        useGetDocs<Post>({
          path: `${COLLECTION}`,
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
    it("should fetch specified id data from Firestore", async () => {
      const ref = collection(db, COLLECTION) as CollectionReference<Post>;
      const docs = await getDocs(ref);
      const targetId = docs.docs[0].id;

      const { result, unmount } = renderHook(() =>
        useGetDocs<Post>({
          path: `${COLLECTION}`,
          where: [["id", "==", targetId]],
        })
      );
      await waitFor(() => expect(result.current.data != null).toBe(true), {
        timeout: 5000,
      });
      result.current.data?.forEach((x) => {
        expect(x.id).toBe(targetId);
      });
      unmount();
    });
  });

  describe("with orderBy option", () => {
    it("should fetch data from Firestore", async () => {
      const { result, unmount } = renderHook(() =>
        useGetDocs<Post>({
          path: `${COLLECTION}`,
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
    it("should fetch data from Firestore", async () => {
      const { result, unmount } = renderHook(() =>
        useGetDocs<Post>({
          path: `${COLLECTION}`,
          orderBy: [["id", "asc"]],
        })
      );
      await waitFor(() => expect(result.current.data != null).toBe(true), {
        timeout: 5000,
      });
      expect(result.current!.data).toBeDefined();
      unmount();
    });
  });

  describe("with limit option", () => {
    it("should fetch data from Firestore", async () => {
      const { result, unmount } = renderHook(() =>
        useGetDocs<Post>({ path: `${COLLECTION}`, limit: 1 })
      );
      await waitFor(() => expect(result.current.data != null).toBe(true), {
        timeout: 5000,
      });
      expect(result.current.data?.length).toBe(1);
      unmount();
    });
  });

  describe("with limitToLast option", () => {
    it("should fetch data from Firestore", async () => {
      const { result, unmount } = renderHook(() =>
        useGetDocs<Post>({
          path: `${COLLECTION}`,
          limitToLast: 1,
          orderBy: [["createdAt", "asc"]],
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
          useGetDocs<Post>({
            path: COLLECTION,
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
          useGetDocs<Post>({
            path: COLLECTION,
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
          useGetDocs<Post>({
            path: COLLECTION,
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
          useGetDocs<Post>({
            path: COLLECTION,
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
      const { result, unmount } = renderHook(() =>
        useGetDocs<Post>({
          path: COLLECTION,
          queryConstraints: [
            or(
              where("content", "==", "foo"),
              where("status", "==", "published")
            ),
            orderBy("createdAt", "desc"),
          ],
        })
      );
      await waitFor(() => expect(result.current.data != null).toBe(true), {
        timeout: 5000,
      });
      expect(result.current.data?.length).toBe(3);
      unmount();
    });
  });

  describe("with swr config", () => {
    it("should fetch data from Firestore", async () => {
      const ref = collection(db, COLLECTION) as CollectionReference<Post>;
      const id = faker.datatype.uuid();
      const docRef = doc(ref, id);
      await setDoc(docRef, {
        content: "hello",
        status: "draft",
        createdAt: serverTimestamp(),
        author: {
          name: "John",
          createdAt: serverTimestamp(),
        },
      });
      const { result, unmount } = renderHook(() =>
        useGetDocs<Post>(
          {
            path: COLLECTION,
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
    it("should return FirebaseError", async () => {
      const ref = collection(db, ERR_COLLECTION) as CollectionReference<Post>;
      const id = faker.datatype.uuid();
      const docRef = doc(ref, id);
      await setDoc(docRef, {
        content: "hello",
        status: "draft",
        createdAt: serverTimestamp(),
      });
      const { result, unmount } = renderHook(() =>
        useGetDocs<Post>({
          path: `${ERR_COLLECTION}`,
        })
      );
      await waitFor(() => expect(result.current.isLoading).toBe(false), {
        timeout: 5000,
      });
      expect(result.current.error != null).toBe(true);
      expect(result.current.error instanceof FirebaseError).toBe(true);
      unmount();
    });
  });
  describe("with isCollectionGroup option", () => {
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
      await Promise.all(
        [1, 10, 100, 1000].map((x) => {
          return addDoc(subRef, {
            content: "hello",
            createdAt: serverTimestamp(),
            sortableId: x,
          });
        })
      );
      const { result, unmount } = renderHook(() =>
        useGetDocs<Comment>({
          path: `${SUB_COLLECTION}`,
          isCollectionGroup: true,
        })
      );
      await waitFor(() => expect(result.current.data != null).toBe(true), {
        timeout: 5000,
      });
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
});
