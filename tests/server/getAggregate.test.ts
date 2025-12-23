import {
  CollectionReference,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { getAggregate, getCollection } from "../../src/server";

import { db } from "../supports/fb";
import { deleteCollection } from "../supports/fbUtil";

const COLLECTION = "GetAggregateTest";

type Product = {
  name: string;
  category: string;
  price: number;
  stock: number;
  createdAt: Date;
};

describe("getAggregate", () => {
  beforeAll(async () => {
    await deleteCollection(COLLECTION);
    const ref = collection(db, COLLECTION) as CollectionReference<Product>;
    await addDoc(ref, {
      name: "Product A",
      category: "electronics",
      price: 100,
      stock: 10,
      createdAt: serverTimestamp(),
    });
    await addDoc(ref, {
      name: "Product B",
      category: "electronics",
      price: 200,
      stock: 20,
      createdAt: serverTimestamp(),
    });
    await addDoc(ref, {
      name: "Product C",
      category: "furniture",
      price: 300,
      stock: 5,
      createdAt: serverTimestamp(),
    });
    await addDoc(ref, {
      name: "Product D",
      category: "furniture",
      price: 400,
      stock: 15,
      createdAt: serverTimestamp(),
    });
  });

  afterAll(async () => {
    await deleteCollection(COLLECTION);
  });

  describe("count only", () => {
    it("should fetch total count", async () => {
      const { key, data } = await getAggregate<
        Product,
        { total: { type: "count" } }
      >({
        path: COLLECTION,
        aggregate: {
          total: { type: "count" },
        },
      });
      expect(key).toBeDefined();
      expect(data).toEqual({ total: 4 });
    });
  });

  describe("sum only", () => {
    it("should fetch sum of a field", async () => {
      const { key, data } = await getAggregate<
        Product,
        { totalPrice: { type: "sum"; field: "price" } }
      >({
        path: COLLECTION,
        aggregate: {
          totalPrice: { type: "sum", field: "price" },
        },
      });
      expect(data).toEqual({ totalPrice: 1000 });
    });
  });

  describe("average only", () => {
    it("should fetch average of a field", async () => {
      const { key, data } = await getAggregate<
        Product,
        { avgPrice: { type: "average"; field: "price" } }
      >({
        path: COLLECTION,
        aggregate: {
          avgPrice: { type: "average", field: "price" },
        },
      });
      expect(data).toEqual({ avgPrice: 250 });
    });
  });

  describe("multiple aggregations", () => {
    it("should fetch multiple aggregations at once", async () => {
      const { key, data } = await getAggregate<
        Product,
        {
          count: { type: "count" };
          totalStock: { type: "sum"; field: "stock" };
          avgPrice: { type: "average"; field: "price" };
        }
      >({
        path: COLLECTION,
        aggregate: {
          count: { type: "count" },
          totalStock: { type: "sum", field: "stock" },
          avgPrice: { type: "average", field: "price" },
        },
      });
      expect(data).toEqual({
        count: 4,
        totalStock: 50,
        avgPrice: 250,
      });
    });
  });

  describe("with where option", () => {
    it("should fetch aggregation with where condition", async () => {
      const { key, data } = await getAggregate<
        Product,
        {
          count: { type: "count" };
          totalPrice: { type: "sum"; field: "price" };
        }
      >({
        path: COLLECTION,
        where: [["category", "==", "electronics"]],
        aggregate: {
          count: { type: "count" },
          totalPrice: { type: "sum", field: "price" },
        },
      });
      expect(data).toEqual({
        count: 2,
        totalPrice: 300,
      });
    });
  });

  describe("with documentId", () => {
    it("should fetch aggregation with documentId query", async () => {
      const { data: products } = await getCollection<Product>({
        path: COLLECTION,
      });
      const targetId = products[0].id;

      const { key, data } = await getAggregate<
        Product,
        { count: { type: "count" } }
      >({
        path: COLLECTION,
        where: [["id", "==", targetId]],
        aggregate: {
          count: { type: "count" },
        },
      });
      expect(data).toEqual({ count: 1 });
    });
  });

  describe("with limit option", () => {
    it("should fetch aggregation with limit", async () => {
      const { key, data } = await getAggregate<
        Product,
        { count: { type: "count" } }
      >({
        path: COLLECTION,
        orderBy: [["price", "asc"]],
        limit: 2,
        aggregate: {
          count: { type: "count" },
        },
      });
      expect(data).toEqual({ count: 2 });
    });
  });

  describe("empty collection", () => {
    const EMPTY_COLLECTION = "GetAggregateEmptyTest";

    beforeAll(async () => {
      await deleteCollection(EMPTY_COLLECTION);
    });

    afterAll(async () => {
      await deleteCollection(EMPTY_COLLECTION);
    });

    it("should return count=0, sum=0, average=null for empty collection", async () => {
      const { key, data } = await getAggregate<
        Product,
        {
          count: { type: "count" };
          totalPrice: { type: "sum"; field: "price" };
          avgPrice: { type: "average"; field: "price" };
        }
      >({
        path: EMPTY_COLLECTION,
        aggregate: {
          count: { type: "count" },
          totalPrice: { type: "sum", field: "price" },
          avgPrice: { type: "average", field: "price" },
        },
      });
      expect(data).toEqual({
        count: 0,
        totalPrice: 0,
        avgPrice: null,
      });
    });
  });
});
