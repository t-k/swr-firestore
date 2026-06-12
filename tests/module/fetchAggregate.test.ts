import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  fetchAggregate,
  fetchCollectionCount,
  fetchCollectionGroupAggregate,
  fetchCollectionGroupCount,
} from "../../src/module/aggregate";
import { average, count, sum, where } from "../../src/module/query";
import { db } from "../supports/fb";
import { deleteCollection } from "../supports/fbUtil";

type Product = {
  category: "book" | "tool";
  price: number;
};

const COLLECTION = "ModuleFetchAggregateTest";
const GROUP_PARENT = "ModuleFetchAggregateGroupParent";
const GROUP_SUB_COLLECTION = "ModuleFetchAggregateSubGroupTest";

describe("module aggregate fetchers", () => {
  beforeAll(async () => {
    await deleteCollection(COLLECTION);
    await deleteCollection(GROUP_PARENT, [GROUP_SUB_COLLECTION]);

    const collectionRef = collection(db, COLLECTION);
    await addDoc(collectionRef, { category: "book", price: 10, createdAt: serverTimestamp() });
    await addDoc(collectionRef, { category: "book", price: 20, createdAt: serverTimestamp() });
    await addDoc(collectionRef, { category: "tool", price: 30, createdAt: serverTimestamp() });

    const parentRef = collection(db, GROUP_PARENT);
    const parent = await addDoc(parentRef, { title: "parent", createdAt: serverTimestamp() });
    const groupRef = collection(db, `${GROUP_PARENT}/${parent.id}/${GROUP_SUB_COLLECTION}`);
    await addDoc(groupRef, { category: "book", price: 100, createdAt: serverTimestamp() });
    await addDoc(groupRef, { category: "tool", price: 200, createdAt: serverTimestamp() });
  });

  afterAll(async () => {
    await deleteCollection(COLLECTION);
    await deleteCollection(GROUP_PARENT, [GROUP_SUB_COLLECTION]);
  });

  it("returns collection counts from the emulator", async () => {
    await expect(fetchCollectionCount<Product>({ path: COLLECTION, db })).resolves.toBe(3);
  });

  it("returns collection group counts from the emulator", async () => {
    await expect(
      fetchCollectionGroupCount<Product>({ path: GROUP_SUB_COLLECTION, db }),
    ).resolves.toBe(2);
  });

  it("returns collection aggregate values from the emulator", async () => {
    const data = await fetchAggregate<
      Product,
      {
        total: { type: "count" };
        totalPrice: { type: "sum"; field: "price" };
        avgPrice: { type: "average"; field: "price" };
      }
    >({
      path: COLLECTION,
      db,
      constraints: [where<Product>("category", "==", "book")],
      aggregate: {
        total: count(),
        totalPrice: sum<Product>("price"),
        avgPrice: average<Product>("price"),
      },
    });

    expect(data).toEqual({ total: 2, totalPrice: 30, avgPrice: 15 });
  });

  it("returns collection group aggregate values from the emulator", async () => {
    const data = await fetchCollectionGroupAggregate<
      Product,
      {
        total: { type: "count" };
        totalPrice: { type: "sum"; field: "price" };
      }
    >({
      path: GROUP_SUB_COLLECTION,
      db,
      aggregate: {
        total: count(),
        totalPrice: sum<Product>("price"),
      },
    });

    expect(data).toEqual({ total: 2, totalPrice: 300 });
  });
});
