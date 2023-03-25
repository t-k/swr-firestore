import { renderHook, waitFor } from "@testing-library/react";
import {
  CollectionReference,
  Timestamp,
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { useGetDocs } from "../../src";
import { db } from "../supports/fb";
import type { Post } from "../supports/model";
import { faker } from "@faker-js/faker";
import { deleteCollection } from "../supports/fbUtil";

const COLLECTION = "useGetDocsTest";

describe("useGetDocs", () => {
  beforeEach(async () => {
    await deleteCollection(COLLECTION);
  });
  afterEach(async () => {
    await deleteCollection(COLLECTION);
  });
  describe("without option", () => {
    it("should fetch data from Firestore", async () => {
      const ref = collection(db, COLLECTION) as CollectionReference<Post>;
      const id = faker.datatype.uuid();
      const docRef = doc(ref, id);
      await setDoc(docRef, {
        content: "hello",
        status: "draft",
        createdAt: serverTimestamp(),
      });
      const { result, unmount } = renderHook(() =>
        useGetDocs<Post>({ path: `${COLLECTION}` })
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
      expect(el.status).toBeDefined();
      expect(el.createdAt).toBeDefined();
      expect(el.createdAt instanceof Timestamp).toBe(true);
      unmount();
    });
  });
  describe("parseDates option", () => {
    it("should fetch data from Firestore", async () => {
      const ref = collection(db, COLLECTION) as CollectionReference<Post>;
      const id = faker.datatype.uuid();
      const docRef = doc(ref, id);
      await setDoc(docRef, {
        content: "hello",
        status: "draft",
        createdAt: serverTimestamp(),
      });
      const { result, unmount } = renderHook(() =>
        useGetDocs<Post>({ path: `${COLLECTION}`, parseDates: ["createdAt"] })
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
      expect(el.status).toBeDefined();
      expect(el.createdAt).toBeDefined();
      expect(el.createdAt instanceof Date).toBe(true);
      unmount();
    });
  });
});
