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

const COLLECTION = "DocTest";

describe("useDoc", () => {
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
      const { result, unmount } = renderHook(() =>
        useDoc<Post>({ path: `${COLLECTION}/${id}` })
      );
      await act(async () => {
        await setDoc(docRef, {
          content: "hello",
          status: "draft",
          createdAt: serverTimestamp(),
        });
        return;
      });
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
      const id = faker.datatype.uuid();
      const docRef = doc(ref, id);
      const { result, unmount } = renderHook(() =>
        useDoc<Post>({ path: `${COLLECTION}/${id}`, parseDates: ["createdAt"] })
      );
      await act(async () => {
        await setDoc(docRef, {
          content: "hello",
          status: "draft",
          createdAt: serverTimestamp(),
        });
        return;
      });
      await waitFor(() => expect(result.current.data != null).toBe(true), {
        timeout: 5000,
      });
      expect(result.current.data != null).toBe(true);
      expect(result.current.data?.createdAt instanceof Date).toBe(true);
      unmount();
    });
  });
});
