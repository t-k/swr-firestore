import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { getCollectionGroupAggregate } from "../../src/server";

import { db } from "../supports/fb";
import { deleteCollection } from "../supports/fbUtil";

const COLLECTION = "GetCollectionGroupAggregateTest";
const SUB_COLLECTION = "GetSubCollectionAggregateTest";

type Item = {
  name: string;
  price: number;
  quantity: number;
  createdAt: Date;
};

describe("getCollectionGroupAggregate", () => {
  beforeAll(async () => {
    await deleteCollection(COLLECTION, [SUB_COLLECTION]);
    const ref = collection(db, COLLECTION);

    // Parent document 1
    const doc1 = await addDoc(ref, {
      name: "Parent 1",
      createdAt: serverTimestamp(),
    });
    const subRef1 = collection(db, `${COLLECTION}/${doc1.id}/${SUB_COLLECTION}`);
    await addDoc(subRef1, {
      name: "Item A",
      price: 100,
      quantity: 2,
      createdAt: serverTimestamp(),
    });
    await addDoc(subRef1, {
      name: "Item B",
      price: 200,
      quantity: 3,
      createdAt: serverTimestamp(),
    });

    // Parent document 2
    const doc2 = await addDoc(ref, {
      name: "Parent 2",
      createdAt: serverTimestamp(),
    });
    const subRef2 = collection(db, `${COLLECTION}/${doc2.id}/${SUB_COLLECTION}`);
    await addDoc(subRef2, {
      name: "Item C",
      price: 300,
      quantity: 1,
      createdAt: serverTimestamp(),
    });
    await addDoc(subRef2, {
      name: "Item D",
      price: 400,
      quantity: 4,
      createdAt: serverTimestamp(),
    });
  });

  afterAll(async () => {
    await deleteCollection(COLLECTION, [SUB_COLLECTION]);
  });

  describe("count only", () => {
    it("should fetch total count across subcollections", async () => {
      const { key, data } = await getCollectionGroupAggregate<
        Item,
        { total: { type: "count" } }
      >({
        path: SUB_COLLECTION,
        aggregate: {
          total: { type: "count" },
        },
      });
      expect(key).toBeDefined();
      expect(data).toEqual({ total: 4 });
    });
  });

  describe("sum only", () => {
    it("should fetch sum across subcollections", async () => {
      const { key, data } = await getCollectionGroupAggregate<
        Item,
        { totalPrice: { type: "sum"; field: "price" } }
      >({
        path: SUB_COLLECTION,
        aggregate: {
          totalPrice: { type: "sum", field: "price" },
        },
      });
      expect(data).toEqual({ totalPrice: 1000 });
    });
  });

  describe("average only", () => {
    it("should fetch average across subcollections", async () => {
      const { key, data } = await getCollectionGroupAggregate<
        Item,
        { avgQuantity: { type: "average"; field: "quantity" } }
      >({
        path: SUB_COLLECTION,
        aggregate: {
          avgQuantity: { type: "average", field: "quantity" },
        },
      });
      // (2 + 3 + 1 + 4) / 4 = 2.5
      expect(data).toEqual({ avgQuantity: 2.5 });
    });
  });

  describe("multiple aggregations", () => {
    it("should fetch multiple aggregations at once", async () => {
      const { key, data } = await getCollectionGroupAggregate<
        Item,
        {
          count: { type: "count" };
          totalPrice: { type: "sum"; field: "price" };
          avgPrice: { type: "average"; field: "price" };
        }
      >({
        path: SUB_COLLECTION,
        aggregate: {
          count: { type: "count" },
          totalPrice: { type: "sum", field: "price" },
          avgPrice: { type: "average", field: "price" },
        },
      });
      expect(data).toEqual({
        count: 4,
        totalPrice: 1000,
        avgPrice: 250,
      });
    });
  });

  describe("with where option", () => {
    it("should fetch aggregation with where condition", async () => {
      const { key, data } = await getCollectionGroupAggregate<
        Item,
        {
          count: { type: "count" };
          totalPrice: { type: "sum"; field: "price" };
        }
      >({
        path: SUB_COLLECTION,
        where: [["price", ">=", 200]],
        aggregate: {
          count: { type: "count" },
          totalPrice: { type: "sum", field: "price" },
        },
      });
      // Items with price >= 200: B(200), C(300), D(400)
      expect(data).toEqual({
        count: 3,
        totalPrice: 900,
      });
    });
  });

  describe("with limit option", () => {
    it("should fetch aggregation with limit", async () => {
      const { key, data } = await getCollectionGroupAggregate<
        Item,
        { count: { type: "count" } }
      >({
        path: SUB_COLLECTION,
        orderBy: [["price", "asc"]],
        limit: 2,
        aggregate: {
          count: { type: "count" },
        },
      });
      expect(data).toEqual({ count: 2 });
    });
  });
});
