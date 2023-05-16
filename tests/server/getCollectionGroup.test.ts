import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getCollectionGroup } from "../../src/server";

import { db } from "../supports/fb";
import { deleteCollection } from "../supports/fbUtil";
import type { Comment } from "../supports/model";
import { unstable_serialize } from "swr";

const COLLECTION = "GetCollectionGroupTest";
const SUB_COLLECTION = "GetCollectionGroupSubTest";

describe("getCollectionGroup", () => {
  beforeAll(async () => {
    await deleteCollection(COLLECTION, [SUB_COLLECTION]);
    const ref = collection(db, COLLECTION);
    const doc = await addDoc(ref, {
      content: "hello",
      status: "draft",
      createdAt: serverTimestamp(),
    });
    const subRef = collection(db, `${COLLECTION}/${doc.id}/${SUB_COLLECTION}`);
    const contents = ["foo", "bar", "baz", "foo"];
    await Promise.all(
      [1, 10, 100, 1000].map((x, i) => {
        return addDoc(subRef, {
          content: contents[i],
          createdAt: serverTimestamp(),
          sortableId: x,
        });
      })
    );
  });
  afterAll(async () => {
    await deleteCollection(COLLECTION, [SUB_COLLECTION]);
  });
  describe("without option", () => {
    it("should fetch data", async () => {
      const { key, data } = await getCollectionGroup<Comment>({
        path: SUB_COLLECTION,
      });
      expect(data != null).toBe(true);
      expect(key).toEqual(unstable_serialize({ path: SUB_COLLECTION }));
    });
  });
  describe("with isSubscription option", () => {
    it("should return key with subscription prefix", async () => {
      const { key, data } = await getCollectionGroup<Comment>({
        path: SUB_COLLECTION,
        isSubscription: true,
      });
      expect(data != null).toBe(true);
      expect(key).toEqual(
        "$sub$" + unstable_serialize({ path: SUB_COLLECTION })
      );
    });
  });
  describe("with parseDates option", () => {
    it("should fetch data from Firestore", async () => {
      const { key, data } = await getCollectionGroup<Comment>({
        path: SUB_COLLECTION,
        parseDates: ["createdAt"],
      });
      const el = data![0];
      expect(el.id).toBeDefined();
      expect(el.exists).toBeDefined();
      expect(el.ref).toBeDefined();
      expect(el.content).toBeDefined();
      expect(el.createdAt).toBeDefined();
      expect(el.createdAt instanceof Date).toBe(true);
    });
  });
  describe("with where option", () => {
    it("should fetch data from Firestore", async () => {
      const { key, data } = await getCollectionGroup<Comment>({
        path: SUB_COLLECTION,
        where: [["content", "==", "foo"]],
      });
      data?.forEach((x) => {
        expect(x.content).toBe("foo");
      });
    });
  });
  describe("with order option", () => {
    it("should fetch data from Firestore", async () => {
      const { key, data } = await getCollectionGroup<Comment>({
        path: SUB_COLLECTION,
        orderBy: [["createdAt", "desc"]],
      });
      const data1 = data![0];
      const data2 = data![1];
      expect(data1.createdAt > data2.createdAt).toBe(true);
    });
  });

  describe("with limit option", () => {
    it("should fetch data from Firestore", async () => {
      const { key, data } = await getCollectionGroup<Comment>({
        path: SUB_COLLECTION,
        limit: 1,
      });
      expect(data?.length).toBe(1);
    });
  });

  describe("with limitToLast option", () => {
    it("should fetch data from Firestore", async () => {
      const { key, data } = await getCollectionGroup<Comment>({
        path: SUB_COLLECTION,
        limitToLast: 1,
        orderBy: [["createdAt", "asc"]],
      });
      expect(data?.length).toBe(1);
    });
  });
  describe("with query cursor", () => {
    describe("with startAt", () => {
      it("should fetch data from Firestore", async () => {
        const { key, data } = await getCollectionGroup<Comment>({
          path: SUB_COLLECTION,
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
        const { key, data } = await getCollectionGroup<Comment>({
          path: SUB_COLLECTION,
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
        const { key, data } = await getCollectionGroup<Comment>({
          path: SUB_COLLECTION,
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
        const { key, data } = await getCollectionGroup<Comment>({
          path: SUB_COLLECTION,
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
