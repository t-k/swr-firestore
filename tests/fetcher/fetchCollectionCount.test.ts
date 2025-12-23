import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { doc, setDoc } from "firebase/firestore";
import { fetchCollectionCount } from "../../src";
import { db } from "../supports/fb";
import { deleteCollection } from "../supports/fbUtil";

const testCollection = "FetchCollectionCountTest";

type TestDoc = {
  name: string;
  value: number;
};

describe("fetchCollectionCount", () => {
  const testData = [
    { name: "A", value: 10 },
    { name: "B", value: 20 },
    { name: "C", value: 30 },
    { name: "D", value: 40 },
    { name: "E", value: 50 },
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

  test("count all documents in collection", async () => {
    const result = await fetchCollectionCount<TestDoc>({
      path: testCollection,
    });

    expect(result).toBe(5);
  });

  test("count with where clause", async () => {
    const result = await fetchCollectionCount<TestDoc>({
      path: testCollection,
      where: [["value", ">", 25]],
    });

    expect(result).toBe(3);
  });

  test("count with limit", async () => {
    const result = await fetchCollectionCount<TestDoc>({
      path: testCollection,
      orderBy: [["value", "asc"]],
      limit: 2,
    });

    expect(result).toBe(2);
  });

  test("return zero for non-matching query", async () => {
    const result = await fetchCollectionCount<TestDoc>({
      path: testCollection,
      where: [["value", ">", 1000]],
    });

    expect(result).toBe(0);
  });
});
