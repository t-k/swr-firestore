import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getCollectionGroupCount } from "../../src/server";

import { db } from "../supports/fb";
import { deleteCollection } from "../supports/fbUtil";
import type { Comment } from "../supports/model";
import { unstable_serialize } from "swr";

const COLLECTION = "getCollectionGroupCountCountTest";
const SUB_COLLECTION = "getCollectionGroupCountCountSubTest";

describe("getCollectionGroupCountCount", () => {
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
      const { key, data } = await getCollectionGroupCount<Comment>({
        path: SUB_COLLECTION,
      });
      expect(data).toBe(4);
      expect(key).toEqual(
        unstable_serialize({
          path: SUB_COLLECTION,
        })
      );
    });
  });
  describe("with isSubscription option", () => {
    it("should return key with subscription prefix", async () => {
      const { key, data } = await getCollectionGroupCount<Comment>({
        path: SUB_COLLECTION,
        isSubscription: true,
      });
      expect(data != null).toBe(true);
      expect(key).toEqual(
        "$sub$" + unstable_serialize({ path: SUB_COLLECTION })
      );
    });
  });
  describe("with where option", () => {
    it("should fetch data from Firestore", async () => {
      const { key, data } = await getCollectionGroupCount<Comment>({
        path: SUB_COLLECTION,
        where: [["content", "==", "foo"]],
      });
      expect(data).toBe(2);
    });
  });
  describe("with order option", () => {
    it("should fetch data from Firestore", async () => {
      const { key, data } = await getCollectionGroupCount<Comment>({
        path: SUB_COLLECTION,
        orderBy: [["createdAt", "desc"]],
      });
      expect(data).toBe(4);
    });
  });

  describe("with limit option", () => {
    it("should fetch data from Firestore", async () => {
      const { key, data } = await getCollectionGroupCount<Comment>({
        path: SUB_COLLECTION,
        limit: 1,
      });
      expect(data).toBe(1);
    });
  });
  describe("with query cursor", () => {
    describe("with startAt", () => {
      it("should fetch data from Firestore", async () => {
        const { key, data } = await getCollectionGroupCount<Comment>({
          path: SUB_COLLECTION,
          orderBy: [["sortableId", "asc"]],
          startAt: [10],
        });

        expect(data).toBe(3);
      });
    });
    describe("with startAfter", () => {
      it("should fetch data from Firestore", async () => {
        const { key, data } = await getCollectionGroupCount<Comment>({
          path: SUB_COLLECTION,
          orderBy: [["sortableId", "asc"]],
          startAfter: [10],
        });
        expect(data).toBe(2);
      });
    });
    describe("with endAt", () => {
      it("should fetch data from Firestore", async () => {
        const { key, data } = await getCollectionGroupCount<Comment>({
          path: SUB_COLLECTION,
          orderBy: [["sortableId", "asc"]],
          endAt: [100],
        });
        expect(data).toBe(3);
      });
    });
    describe("with endBefore", () => {
      it("should fetch data from Firestore", async () => {
        const { key, data } = await getCollectionGroupCount<Comment>({
          path: SUB_COLLECTION,
          orderBy: [["sortableId", "asc"]],
          endBefore: [100],
        });
        expect(data).toBe(2);
      });
    });
  });
});
