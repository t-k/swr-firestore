import { act, renderHook, waitFor } from "@testing-library/react";
import {
  CollectionReference,
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { useCollectionCount } from "../../src";
import { db } from "../supports/fb";
import { deleteCollection } from "../supports/fbUtil";
import type { Post } from "../supports/model";
import { faker } from "@faker-js/faker";
import { useSWRConfig } from "swr";

const COLLECTION = "CountTest";
describe("useCollectionCount", () => {
  beforeEach(async () => {
    await deleteCollection(COLLECTION);
  });
  afterEach(async () => {
    await deleteCollection(COLLECTION);
  });
  describe("without option", () => {
    it("should fetch data from Firestore", async () => {
      const ref = collection(db, "CountTest") as CollectionReference<Post>;
      const id = faker.datatype.uuid();
      const docRef = doc(ref, id);
      await setDoc(docRef, {
        content: "hello",
        status: "draft",
        createdAt: serverTimestamp(),
      });
      const {
        result: {
          current: { mutate },
        },
        unmount: unmountSWRConfig,
      } = renderHook(() => useSWRConfig());
      const { result, unmount } = renderHook(() => useCollectionCount<Post>({ path: COLLECTION }));
      await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 });
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data != null).toBe(true);
      expect(result.current.data).toBe(1);
      await act(async () => {
        await addDoc(ref, {
          content: "world",
          status: "draft",
          createdAt: serverTimestamp(),
        });
        mutate({ path: COLLECTION });
        return;
      });
      await waitFor(() => expect(result.current.data).toBe(2), { timeout: 5000 });
      unmountSWRConfig();
      unmount();
    });
  });
  describe("with where option", () => {
    it("should fetch data from Firestore", async () => {
      const ref = collection(db, "CountTest") as CollectionReference<Post>;
      const id = faker.datatype.uuid();
      const docRef = doc(ref, id);
      await setDoc(docRef, {
        content: "hello",
        status: "published",
        createdAt: serverTimestamp(),
      });
      const { result, unmount } = renderHook(() => useCollectionCount<Post>({ path: COLLECTION, where: [["status", "==", "published"]] }));
      await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 5000 });
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data != null).toBe(true);
      expect(result.current.data).toBe(1);
      unmount();
    });
  });
});
