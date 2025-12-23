import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { doc, setDoc } from "firebase/firestore";
import { fetchCollectionGroupAggregate } from "../../src";
import { db } from "../supports/fb";
import { deleteCollection } from "../supports/fbUtil";

const PARENT_COLLECTION = "FetchCollectionGroupAggregateParent";
const SUB_COLLECTION = "FetchSubCollectionGroupAggregateTest";

type OrderItem = {
  productId: string;
  price: number;
  quantity: number;
};

describe("fetchCollectionGroupAggregate", () => {
  beforeAll(async () => {
    const items: OrderItem[] = [
      { productId: "A", price: 100, quantity: 2 },
      { productId: "B", price: 200, quantity: 1 },
      { productId: "C", price: 50, quantity: 5 },
      { productId: "D", price: 150, quantity: 3 },
    ];
    await Promise.all([
      setDoc(doc(db, PARENT_COLLECTION, "order1", SUB_COLLECTION, "item1"), items[0]),
      setDoc(doc(db, PARENT_COLLECTION, "order1", SUB_COLLECTION, "item2"), items[1]),
      setDoc(doc(db, PARENT_COLLECTION, "order2", SUB_COLLECTION, "item3"), items[2]),
      setDoc(doc(db, PARENT_COLLECTION, "order2", SUB_COLLECTION, "item4"), items[3]),
    ]);
  });

  afterAll(async () => {
    await deleteCollection(PARENT_COLLECTION, [SUB_COLLECTION]);
  });

  test("count aggregation on collection group", async () => {
    const result = await fetchCollectionGroupAggregate<
      OrderItem,
      { total: { type: "count" } }
    >({
      path: SUB_COLLECTION,
      aggregate: { total: { type: "count" } },
    });

    expect(result.total).toBe(4);
  });

  test("sum aggregation on collection group", async () => {
    const result = await fetchCollectionGroupAggregate<
      OrderItem,
      { totalRevenue: { type: "sum"; field: "price" } }
    >({
      path: SUB_COLLECTION,
      aggregate: { totalRevenue: { type: "sum", field: "price" } },
    });

    expect(result.totalRevenue).toBe(500);
  });

  test("multiple aggregations on collection group", async () => {
    const result = await fetchCollectionGroupAggregate<
      OrderItem,
      {
        itemCount: { type: "count" };
        totalRevenue: { type: "sum"; field: "price" };
        avgQuantity: { type: "average"; field: "quantity" };
      }
    >({
      path: SUB_COLLECTION,
      aggregate: {
        itemCount: { type: "count" },
        totalRevenue: { type: "sum", field: "price" },
        avgQuantity: { type: "average", field: "quantity" },
      },
    });

    expect(result.itemCount).toBe(4);
    expect(result.totalRevenue).toBe(500);
    expect(result.avgQuantity).toBe(2.75);
  });

  test("aggregation with where clause on collection group", async () => {
    const result = await fetchCollectionGroupAggregate<
      OrderItem,
      { count: { type: "count" } }
    >({
      path: SUB_COLLECTION,
      where: [["price", ">=", 100]],
      aggregate: { count: { type: "count" } },
    });

    expect(result.count).toBe(3);
  });
});
