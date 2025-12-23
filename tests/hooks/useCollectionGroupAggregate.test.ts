import { renderHook, waitFor } from "@testing-library/react";
import {
  addDoc,
  collection,
  or,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { useCollectionGroupAggregate } from "../../src";
import emptyMiddleware from "../supports/emptyMiddleware";
import { db } from "../supports/fb";
import { deleteCollection } from "../supports/fbUtil";

const COLLECTION = "CollectionGroupAggregateTest";
const SUB_COLLECTION = "SubCollectionAggregateTest";

type Item = {
  name: string;
  price: number;
  quantity: number;
  createdAt: Date;
};

describe("useCollectionGroupAggregate", () => {
  beforeEach(async () => {
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

  afterEach(async () => {
    await deleteCollection(COLLECTION, [SUB_COLLECTION]);
  });

  describe("count only", () => {
    it("should fetch total count across subcollections", async () => {
      const { result, unmount } = renderHook(() =>
        useCollectionGroupAggregate<Item, { total: { type: "count" } }>({
          path: SUB_COLLECTION,
          aggregate: {
            total: { type: "count" },
          },
        })
      );
      await waitFor(() => expect(result.current.isLoading).toBe(false), {
        timeout: 5000,
      });
      expect(result.current.data).toEqual({ total: 4 });
      unmount();
    });
  });

  describe("sum only", () => {
    it("should fetch sum across subcollections", async () => {
      const { result, unmount } = renderHook(() =>
        useCollectionGroupAggregate<
          Item,
          { totalPrice: { type: "sum"; field: "price" } }
        >({
          path: SUB_COLLECTION,
          aggregate: {
            totalPrice: { type: "sum", field: "price" },
          },
        })
      );
      await waitFor(() => expect(result.current.isLoading).toBe(false), {
        timeout: 5000,
      });
      expect(result.current.data).toEqual({ totalPrice: 1000 });
      unmount();
    });
  });

  describe("average only", () => {
    it("should fetch average across subcollections", async () => {
      const { result, unmount } = renderHook(() =>
        useCollectionGroupAggregate<
          Item,
          { avgQuantity: { type: "average"; field: "quantity" } }
        >({
          path: SUB_COLLECTION,
          aggregate: {
            avgQuantity: { type: "average", field: "quantity" },
          },
        })
      );
      await waitFor(() => expect(result.current.isLoading).toBe(false), {
        timeout: 5000,
      });
      // (2 + 3 + 1 + 4) / 4 = 2.5
      expect(result.current.data).toEqual({ avgQuantity: 2.5 });
      unmount();
    });
  });

  describe("multiple aggregations", () => {
    it("should fetch multiple aggregations at once", async () => {
      const { result, unmount } = renderHook(() =>
        useCollectionGroupAggregate<
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
        })
      );
      await waitFor(() => expect(result.current.isLoading).toBe(false), {
        timeout: 5000,
      });
      expect(result.current.data).toEqual({
        count: 4,
        totalPrice: 1000,
        avgPrice: 250,
      });
      unmount();
    });
  });

  describe("with where option", () => {
    it("should fetch aggregation with where condition", async () => {
      const { result, unmount } = renderHook(() =>
        useCollectionGroupAggregate<
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
        })
      );
      await waitFor(() => expect(result.current.isLoading).toBe(false), {
        timeout: 5000,
      });
      // Items with price >= 200: B(200), C(300), D(400)
      expect(result.current.data).toEqual({
        count: 3,
        totalPrice: 900,
      });
      unmount();
    });
  });

  describe("with queryConstraints", () => {
    it("should fetch aggregation with OR query using queryConstraints", async () => {
      const { result, unmount } = renderHook(() =>
        useCollectionGroupAggregate<
          Item,
          { count: { type: "count" } }
        >({
          path: SUB_COLLECTION,
          queryConstraints: [
            or(where("name", "==", "Item A"), where("name", "==", "Item D")),
          ],
          aggregate: {
            count: { type: "count" },
          },
        })
      );
      await waitFor(() => expect(result.current.isLoading).toBe(false), {
        timeout: 5000,
      });
      expect(result.current.data).toEqual({ count: 2 });
      unmount();
    });
  });

  describe("with swr config", () => {
    it("should accept SWR configuration", async () => {
      const { result, unmount } = renderHook(() =>
        useCollectionGroupAggregate<Item, { count: { type: "count" } }>(
          {
            path: SUB_COLLECTION,
            aggregate: {
              count: { type: "count" },
            },
          },
          { use: [emptyMiddleware] }
        )
      );
      await waitFor(() => expect(result.current.data != null).toBe(true), {
        timeout: 5000,
      });
      expect(result.current.data!.count).toBe(4);
      unmount();
    });
  });

  describe("conditional fetching", () => {
    it("should not fetch when params is null", async () => {
      const { result, unmount } = renderHook(() =>
        useCollectionGroupAggregate<Item, { count: { type: "count" } }>(null)
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
      unmount();
    });
  });
});
