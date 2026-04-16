import { renderHook, waitFor } from "@testing-library/react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { average, count, where } from "../../src/module/query";
import useAggregate from "../../src/module/hooks/useAggregate";
import { fetchAggregate } from "../../src/module/fetcher";
import { db } from "../supports/fb";

type Product = {
  category: string;
  price: number;
};

const COLLECTION = "FetchAggregateTest";

describe("module useAggregate", () => {
  beforeAll(async () => {
    const ref = collection(db, COLLECTION);
    await addDoc(ref, {
      category: "electronics",
      price: 100,
      createdAt: serverTimestamp(),
    });
    await addDoc(ref, {
      category: "electronics",
      price: 200,
      createdAt: serverTimestamp(),
    });
    await addDoc(ref, {
      category: "furniture",
      price: 300,
      createdAt: serverTimestamp(),
    });
  });

  afterAll(async () => {
    // Leave the test data in the emulator; collection names are isolated per test run.
  });

  it("fetches aggregate values with typed builders", async () => {
    const direct = await fetchAggregate<Product, { total: { type: "count" }; avgPrice: { type: "average"; field: "price" } }>({
      path: COLLECTION,
      constraints: [where<Product>("category", "==", "electronics")],
      aggregate: { total: count(), avgPrice: average<Product>("price") },
    });

    expect(direct.total).toBe(2);
    expect(direct.avgPrice).toBe(150);

    const { result } = renderHook(() =>
      useAggregate<Product, { total: { type: "count" }; avgPrice: { type: "average"; field: "price" }}>({
        path: COLLECTION,
        constraints: [where<Product>("category", "==", "electronics")],
        aggregate: { total: count(), avgPrice: average<Product>("price") },
      }),
    );

    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.data?.total).toBeTypeOf("number");
    expect(result.current.data?.total).toBe(2);
    expect(result.current.data?.avgPrice).toBe(150);
  });
});
