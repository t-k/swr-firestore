import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { addDoc, collection } from "firebase/firestore";
import { fetchAggregate } from "../../src";
import { db } from "../supports/fb";
import { deleteCollection } from "../supports/fbUtil";

const COLLECTION = "FetchAggregateTest";

type Product = {
  name: string;
  category: string;
  price: number;
  stock: number;
};

describe("fetchAggregate", () => {
  beforeAll(async () => {
    const products: Omit<Product, "id">[] = [
      { name: "Product A", category: "electronics", price: 100, stock: 10 },
      { name: "Product B", category: "electronics", price: 200, stock: 20 },
      { name: "Product C", category: "clothing", price: 50, stock: 30 },
      { name: "Product D", category: "clothing", price: 75, stock: 15 },
      { name: "Product E", category: "electronics", price: 300, stock: 5 },
    ];
    const collectionRef = collection(db, COLLECTION);
    await Promise.all(products.map((p) => addDoc(collectionRef, p)));
  });

  afterAll(async () => {
    await deleteCollection(COLLECTION);
  });

  test("count aggregation", async () => {
    const result = await fetchAggregate<Product, { total: { type: "count" } }>({
      path: COLLECTION,
      aggregate: { total: { type: "count" } },
    });

    expect(result.total).toBe(5);
  });

  test("sum aggregation", async () => {
    const result = await fetchAggregate<
      Product,
      { totalStock: { type: "sum"; field: "stock" } }
    >({
      path: COLLECTION,
      aggregate: { totalStock: { type: "sum", field: "stock" } },
    });

    expect(result.totalStock).toBe(80);
  });

  test("average aggregation", async () => {
    const result = await fetchAggregate<
      Product,
      { avgPrice: { type: "average"; field: "price" } }
    >({
      path: COLLECTION,
      aggregate: { avgPrice: { type: "average", field: "price" } },
    });

    expect(result.avgPrice).toBe(145);
  });

  test("multiple aggregations", async () => {
    const result = await fetchAggregate<
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

    expect(result.count).toBe(5);
    expect(result.totalStock).toBe(80);
    expect(result.avgPrice).toBe(145);
  });

  test("aggregation with where clause", async () => {
    const result = await fetchAggregate<
      Product,
      {
        count: { type: "count" };
        avgPrice: { type: "average"; field: "price" };
      }
    >({
      path: COLLECTION,
      where: [["category", "==", "electronics"]],
      aggregate: {
        count: { type: "count" },
        avgPrice: { type: "average", field: "price" },
      },
    });

    expect(result.count).toBe(3);
    expect(result.avgPrice).toBe(200);
  });
});
