import { renderHook, waitFor } from "@testing-library/react";
import {
  CollectionReference,
  addDoc,
  collection,
  serverTimestamp,
  where,
  or,
  getDocs,
} from "firebase/firestore";
import { useAggregate } from "../../src";
import { db } from "../supports/fb";
import { deleteCollection } from "../supports/fbUtil";
import emptyMiddleware from "../supports/emptyMiddleware";

const COLLECTION = "AggregateTest";

type Product = {
  name: string;
  category: string;
  price: number;
  stock: number;
  createdAt: Date;
};

describe("useAggregate", () => {
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
    it("should fetch total count of all documents", async () => {
      const { result, unmount } = renderHook(() =>
        useAggregate<Product, { total: { type: "count" } }>({
          path: COLLECTION,
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
    it("should fetch sum of a field", async () => {
      const { result, unmount } = renderHook(() =>
        useAggregate<Product, { totalPrice: { type: "sum"; field: "price" } }>({
          path: COLLECTION,
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
    it("should fetch average of a field", async () => {
      const { result, unmount } = renderHook(() =>
        useAggregate<
          Product,
          { avgPrice: { type: "average"; field: "price" } }
        >({
          path: COLLECTION,
          aggregate: {
            avgPrice: { type: "average", field: "price" },
          },
        })
      );
      await waitFor(() => expect(result.current.isLoading).toBe(false), {
        timeout: 5000,
      });
      expect(result.current.data).toEqual({ avgPrice: 250 });
      unmount();
    });
  });

  describe("multiple aggregations", () => {
    it("should fetch multiple aggregations at once", async () => {
      const { result, unmount } = renderHook(() =>
        useAggregate<
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
        })
      );
      await waitFor(() => expect(result.current.isLoading).toBe(false), {
        timeout: 5000,
      });
      expect(result.current.data).toEqual({
        count: 4,
        totalStock: 50,
        avgPrice: 250,
      });
      unmount();
    });
  });

  describe("with where option", () => {
    it("should fetch aggregation with where condition", async () => {
      const { result, unmount } = renderHook(() =>
        useAggregate<
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
        })
      );
      await waitFor(() => expect(result.current.isLoading).toBe(false), {
        timeout: 5000,
      });
      expect(result.current.data).toEqual({
        count: 2,
        totalPrice: 300,
      });
      unmount();
    });
  });

  describe("with documentId", () => {
    it("should fetch aggregation with documentId query", async () => {
      const ref = collection(db, COLLECTION) as CollectionReference<Product>;
      const docs = await getDocs(ref);
      const targetId = docs.docs[0].id;

      const { result, unmount } = renderHook(() =>
        useAggregate<Product, { count: { type: "count" } }>({
          path: COLLECTION,
          where: [["id", "==", targetId]],
          aggregate: {
            count: { type: "count" },
          },
        })
      );
      await waitFor(() => expect(result.current.isLoading).toBe(false), {
        timeout: 5000,
      });
      expect(result.current.data).toEqual({ count: 1 });
      unmount();
    });
  });

  describe("with queryConstraints", () => {
    it("should fetch aggregation with OR query using queryConstraints", async () => {
      const { result, unmount } = renderHook(() =>
        useAggregate<
          Product,
          { count: { type: "count" }; totalPrice: { type: "sum"; field: "price" } }
        >({
          path: COLLECTION,
          queryConstraints: [
            or(
              where("category", "==", "electronics"),
              where("price", ">=", 400)
            ),
          ],
          aggregate: {
            count: { type: "count" },
            totalPrice: { type: "sum", field: "price" },
          },
        })
      );
      await waitFor(() => expect(result.current.isLoading).toBe(false), {
        timeout: 5000,
      });
      // electronics (100 + 200) + furniture with price >= 400 (400) = 700
      expect(result.current.data).toEqual({
        count: 3,
        totalPrice: 700,
      });
      unmount();
    });
  });

  describe("with swr config", () => {
    it("should accept SWR configuration", async () => {
      const { result, unmount } = renderHook(() =>
        useAggregate<Product, { count: { type: "count" } }>(
          {
            path: COLLECTION,
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
        useAggregate<Product, { count: { type: "count" } }>(null)
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
      unmount();
    });
  });

  describe("empty collection", () => {
    const EMPTY_COLLECTION = "AggregateEmptyTest";

    beforeAll(async () => {
      await deleteCollection(EMPTY_COLLECTION);
    });

    afterAll(async () => {
      await deleteCollection(EMPTY_COLLECTION);
    });

    it("should return count=0, sum=0, average=null for empty collection", async () => {
      const { result, unmount } = renderHook(() =>
        useAggregate<
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
        })
      );
      await waitFor(() => expect(result.current.isLoading).toBe(false), {
        timeout: 5000,
      });
      expect(result.current.data).toEqual({
        count: 0,
        totalPrice: 0,
        avgPrice: null,
      });
      unmount();
    });
  });
});
