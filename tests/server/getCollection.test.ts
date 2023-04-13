import {
  CollectionReference,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { getCollection } from "../../src/server";

import { db } from "../supports/fb";
import { deleteCollection } from "../supports/fbUtil";
import type { Post } from "../supports/model";
import { unstable_serialize } from "swr";

const COLLECTION = "GetCollectionTest";

describe("getCollection", () => {
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
      const { key, data } = await getCollection<Post>({ path: COLLECTION });
      expect(data != null).toBe(true);
      expect(key).toEqual(unstable_serialize({ path: COLLECTION }));
    });
  });
  describe("with isSubscription option", () => {
    it("should return key with subscription prefix", async () => {
      const { key, data } = await getCollection<Post>({
        path: COLLECTION,
        isSubscription: true,
      });
      expect(data != null).toBe(true);
      expect(key).toEqual("$sub$" + unstable_serialize({ path: COLLECTION }));
    });
  });
  describe("with parseDates option", () => {
    it("should fetch data from Firestore", async () => {
      const { key, data } = await getCollection<Post>({
        path: COLLECTION,
        parseDates: ["createdAt"],
      });
      const el = data![0];
      expect(el.id).toBeDefined();
      expect(el.exists).toBeDefined();
      expect(el.ref).toBeDefined();
      expect(el.content).toBeDefined();
      expect(el.status).toBeDefined();
      expect(el.createdAt).toBeDefined();
      expect(el.createdAt instanceof Date).toBe(true);
    });
  });
  describe("with where option", () => {
    it("should fetch data from Firestore", async () => {
      const { key, data } = await getCollection<Post>({
        path: COLLECTION,
        where: [["status", "==", "draft"]],
      });
      data?.forEach((x) => {
        expect(x.status).toBe("draft");
      });
    });
  });
  describe("with order option", () => {
    it("should fetch data from Firestore", async () => {
      const { key, data } = await getCollection<Post>({
        path: COLLECTION,
        orderBy: [["createdAt", "desc"]],
      });
      const data1 = data![0];
      const data2 = data![1];
      expect(data1.createdAt > data2.createdAt).toBe(true);
    });
  });

  describe("with limit option", () => {
    it("should fetch data from Firestore", async () => {
      const { key, data } = await getCollection<Post>({
        path: COLLECTION,
        limit: 1,
      });
      expect(data?.length).toBe(1);
    });
  });
  describe("with nested object", () => {
    it("should fetch data from Firestore", async () => {
      const { key, data } = await getCollection<Post>({
        path: COLLECTION,
        parseDates: ["createdAt", "author.createdAt"],
      });
      const el = data![0];
      expect(el.createdAt).toBeDefined();
      expect(el.createdAt instanceof Date).toBe(true);
      expect(el.author?.createdAt instanceof Date).toBe(true);
    });
  });

  describe("with query cursor", () => {
    describe("with startAt", () => {
      it("should fetch data from Firestore", async () => {
        const { key, data } = await getCollection<Post>({
          path: COLLECTION,
          orderBy: [["sortableId", "asc"]],
          startAt: [10],
        });

        expect(data!.length > 0).toBe(true);
        data?.forEach((x) => {
          const sortableId = x.sortableId ?? 0;
          expect(sortableId >= 10).toBe(true);
        });
      });
    });
    describe("with startAfter", () => {
      it("should fetch data from Firestore", async () => {
        const { key, data } = await getCollection<Post>({
          path: COLLECTION,
          orderBy: [["sortableId", "asc"]],
          startAfter: [10],
        });
        expect(data!.length > 0).toBe(true);
        data?.forEach((x) => {
          const sortableId = x.sortableId ?? 0;
          expect(sortableId > 10).toBe(true);
        });
      });
    });
    describe("with endAt", () => {
      it("should fetch data from Firestore", async () => {
        const { key, data } = await getCollection<Post>({
          path: COLLECTION,
          orderBy: [["sortableId", "asc"]],
          endAt: [100],
        });
        expect(data!.length > 0).toBe(true);
        data?.forEach((x) => {
          const sortableId = x.sortableId ?? 0;
          expect(sortableId <= 100).toBe(true);
        });
      });
    });
    describe("with endBefore", () => {
      it("should fetch data from Firestore", async () => {
        const { key, data } = await getCollection<Post>({
          path: COLLECTION,
          orderBy: [["sortableId", "asc"]],
          endBefore: [100],
        });
        expect(data!.length > 0).toBe(true);
        data?.forEach((x) => {
          const sortableId = x.sortableId ?? 0;
          expect(sortableId < 100).toBe(true);
        });
      });
    });
  });
});
