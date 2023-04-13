import {
  CollectionReference,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { getCollectionCount } from "../../src/server";

import { db } from "../supports/fb";
import { deleteCollection } from "../supports/fbUtil";
import type { Post } from "../supports/model";
import { unstable_serialize } from "swr";

const COLLECTION = "GetCollectionCountTest";

describe("getCollectionCount", () => {
  beforeAll(async () => {
    await deleteCollection(COLLECTION);
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
      sortableId: 1000,
      createdAt: serverTimestamp(),
      author: {
        name: "John",
        createdAt: serverTimestamp(),
      },
    });
  });
  afterAll(async () => {
    await deleteCollection(COLLECTION);
  });
  describe("without option", () => {
    it("should fetch data", async () => {
      const { key, data } = await getCollectionCount<Post>({
        path: COLLECTION,
      });
      expect(data != null).toBe(true);
      expect(data).toBe(4);
    });
  });
  describe("with isSubscription option", () => {
    it("should return key with subscription prefix", async () => {
      const { key, data } = await getCollectionCount<Post>({
        path: COLLECTION,
        isSubscription: true,
      });
      expect(data != null).toBe(true);
      expect(key).toEqual("$sub$" + unstable_serialize({ path: COLLECTION }));
    });
  });
  describe("with where option", () => {
    it("should fetch data from Firestore", async () => {
      const { key, data } = await getCollectionCount<Post>({
        path: COLLECTION,
        where: [["status", "==", "draft"]],
      });
      expect(data).toBe(2);
    });
  });
  describe("with limit option", () => {
    it("should fetch data from Firestore", async () => {
      const { key, data } = await getCollectionCount<Post>({
        path: COLLECTION,
        limit: 1,
      });
      expect(data).toBe(1);
    });
  });
  describe("with query cursor", () => {
    describe("with startAt", () => {
      it("should fetch data from Firestore", async () => {
        const { key, data } = await getCollectionCount<Post>({
          path: COLLECTION,
          orderBy: [["sortableId", "asc"]],
          startAt: [10],
        });
        expect(data).toBe(3);
      });
    });
    describe("with startAfter", () => {
      it("should fetch data from Firestore", async () => {
        const { key, data } = await getCollectionCount<Post>({
          path: COLLECTION,
          orderBy: [["sortableId", "asc"]],
          startAfter: [10],
        });
        expect(data).toBe(2);
      });
    });
    describe("with endAt", () => {
      it("should fetch data from Firestore", async () => {
        const { key, data } = await getCollectionCount<Post>({
          path: COLLECTION,
          orderBy: [["sortableId", "asc"]],
          endAt: [100],
        });
        expect(data).toBe(3);
      });
    });
    describe("with endBefore", () => {
      it("should fetch data from Firestore", async () => {
        const { key, data } = await getCollectionCount<Post>({
          path: COLLECTION,
          orderBy: [["sortableId", "asc"]],
          endBefore: [100],
        });
        expect(data).toBe(2);
      });
    });
  });
});
