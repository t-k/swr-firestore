import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { fetchCollection } from "../../src";
import { db } from "../supports/fb";
import { deleteCollection } from "../supports/fbUtil";

const testCollection = "FetchCollectionTest";

type TestDoc = {
  name: string;
  value: number;
  createdAt: Date;
};

describe("fetchCollection", () => {
  const testData = [
    { name: "A", value: 10, createdAt: Timestamp.fromDate(new Date("2025-01-01")) },
    { name: "B", value: 20, createdAt: Timestamp.fromDate(new Date("2025-01-02")) },
    { name: "C", value: 30, createdAt: Timestamp.fromDate(new Date("2025-01-03")) },
    { name: "D", value: 40, createdAt: Timestamp.fromDate(new Date("2025-01-04")) },
    { name: "E", value: 50, createdAt: Timestamp.fromDate(new Date("2025-01-05")) },
  ];

  beforeAll(async () => {
    await Promise.all(
      testData.map((data, i) =>
        setDoc(doc(db, testCollection, `doc-${i}`), data)
      )
    );
  });

  afterAll(async () => {
    await deleteCollection(testCollection);
  });

  test("fetch all documents in collection", async () => {
    const result = await fetchCollection<TestDoc>({
      path: testCollection,
    });

    expect(result).toHaveLength(5);
    expect(result.every((doc) => doc.exists)).toBe(true);
    expect(result.every((doc) => typeof doc.id === "string")).toBe(true);
  });

  test("fetch with where clause", async () => {
    const result = await fetchCollection<TestDoc>({
      path: testCollection,
      where: [["value", ">", 25]],
    });

    expect(result).toHaveLength(3);
    expect(result.every((doc) => doc.value > 25)).toBe(true);
  });

  test("fetch with orderBy and limit", async () => {
    const result = await fetchCollection<TestDoc>({
      path: testCollection,
      orderBy: [["value", "desc"]],
      limit: 2,
    });

    expect(result).toHaveLength(2);
    expect(result[0].value).toBe(50);
    expect(result[1].value).toBe(40);
  });

  test("fetch with parseDates", async () => {
    const result = await fetchCollection<TestDoc>({
      path: testCollection,
      parseDates: ["createdAt"],
      orderBy: [["value", "asc"]],
      limit: 1,
    });

    expect(result).toHaveLength(1);
    expect(result[0].createdAt).toBeInstanceOf(Date);
  });

  test("return empty array for non-matching query", async () => {
    const result = await fetchCollection<TestDoc>({
      path: testCollection,
      where: [["value", ">", 1000]],
    });

    expect(result).toHaveLength(0);
  });
});
