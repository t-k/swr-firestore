import { act, renderHook, waitFor } from "@testing-library/react";
import {
  CollectionReference,
  Timestamp,
  collection,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useDoc } from "../../src";
import { db } from "../supports/fb";
import type { Post } from "../supports/model";
import { faker } from "@faker-js/faker";
import { deleteCollection } from "../supports/fbUtil";
import { FirebaseError } from "firebase/app";
import emptyMiddleware from "../supports/emptyMiddleware";

const COLLECTION = "DocTest";
const ERR_COLLECTION = "DocErrTest";
describe("useDoc", () => {
  beforeEach(async () => {
    await deleteCollection(COLLECTION);
    await deleteCollection(ERR_COLLECTION);
  });
  afterEach(async () => {
    await deleteCollection(COLLECTION);
    await deleteCollection(ERR_COLLECTION);
  });
  describe("without option", () => {
    it("should fetch data from Firestore", async () => {
      const ref = collection(db, COLLECTION) as CollectionReference<Post>;
      const id = faker.string.uuid();
      const docRef = doc(ref, id);
      await setDoc(docRef, {
        content: "hello",
        status: "draft",
        createdAt: serverTimestamp(),
      });
      const { result, unmount } = renderHook(() =>
        useDoc<Post>({ path: `${COLLECTION}/${id}` })
      );
      await waitFor(() => expect(result.current.data != null).toBe(true), {
        timeout: 5000,
      });
      expect(result.current.data != null).toBe(true);
      expect(result.current.data?.id).toBeDefined();
      expect(result.current.data?.exists).toBeDefined();
      expect(result.current.data?.ref).toBeDefined();
      expect(result.current.data?.status).toBe("draft");
      expect(result.current.data?.content).toBe("hello");
      expect(result.current.data?.createdAt instanceof Timestamp).toBe(true);
      await act(async () => {
        await updateDoc(docRef, { content: "world" });
        return;
      });
      expect(result.current.data?.content).toBe("world");
      unmount();
    });
  });
  describe("parseDates option", () => {
    it("should fetch data from Firestore", async () => {
      const ref = collection(db, COLLECTION) as CollectionReference<Post>;
      const id = faker.string.uuid();
      const docRef = doc(ref, id);
      await setDoc(docRef, {
        content: "hello",
        status: "draft",
        createdAt: serverTimestamp(),
      });
      const { result, unmount } = renderHook(() =>
        useDoc<Post>({ path: `${COLLECTION}/${id}`, parseDates: ["createdAt"] })
      );
      await waitFor(() => expect(result.current.data != null).toBe(true), {
        timeout: 5000,
      });
      expect(result.current.data != null).toBe(true);
      expect(result.current.data?.createdAt instanceof Date).toBe(true);
      unmount();
    });
  });
  describe("with nested object", () => {
    it("should fetch data from Firestore", async () => {
      const ref = collection(db, COLLECTION) as CollectionReference<Post>;
      const id = faker.string.uuid();
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
        useDoc<Post>({
          path: `${COLLECTION}/${id}`,
          parseDates: ["createdAt", "author.createdAt"],
        })
      );
      await waitFor(() => expect(result.current.data != null).toBe(true), {
        timeout: 5000,
      });
      expect(result.current.data != null).toBe(true);
      expect(result.current.data?.createdAt instanceof Date).toBe(true);
      expect(result.current.data?.author?.createdAt instanceof Date).toBe(true);
      unmount();
    });
  });

  describe("with explicit db", () => {
    it("should fetch data from Firestore", async () => {
      const ref = collection(db, COLLECTION) as CollectionReference<Post>;
      const id = faker.string.uuid();
      const docRef = doc(ref, id);
      await setDoc(docRef, {
        content: "hello",
        status: "draft",
        createdAt: serverTimestamp(),
      });
      const { result, unmount } = renderHook(() =>
        useDoc<Post>({ path: `${COLLECTION}/${id}`, db })
      );
      await waitFor(() => expect(result.current.data != null).toBe(true), {
        timeout: 5000,
      });
      expect(result.current.data != null).toBe(true);
      expect(result.current.data?.content).toBe("hello");
      unmount();
    });
  });
  describe("with swr config", () => {
    it("should fetch data from Firestore", async () => {
      const ref = collection(db, COLLECTION) as CollectionReference<Post>;
      const id = faker.string.uuid();
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
        useDoc<Post>(
          {
            path: `${COLLECTION}/${id}`,
          },
          { use: [emptyMiddleware] }
        )
      );
      await waitFor(() => expect(result.current.data != null).toBe(true), {
        timeout: 5000,
      });
      expect(result.current.data != null).toBe(true);
      unmount();
    });
  });
  describe("error", () => {
    it("should return FirebaseError", async () => {
      const ref = collection(db, ERR_COLLECTION) as CollectionReference<Post>;
      const id = faker.string.uuid();
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
        useDoc<Post>({
          path: `${ERR_COLLECTION}/${id}`,
          parseDates: ["createdAt", "author.createdAt"],
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
