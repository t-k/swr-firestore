import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { fetchCollectionGroup } from "../../src";
import { db } from "../supports/fb";
import { deleteCollection } from "../supports/fbUtil";

const parentCollection = "FetchCollectionGroupParent";
const subCollection = "FetchSubCollectionGroupTest";

type TestDoc = {
  text: string;
  score: number;
  createdAt: Date;
};

describe("fetchCollectionGroup", () => {
  const testData = [
    { text: "Comment A", score: 10, createdAt: Timestamp.fromDate(new Date("2025-01-01")) },
    { text: "Comment B", score: 20, createdAt: Timestamp.fromDate(new Date("2025-01-02")) },
    { text: "Comment C", score: 30, createdAt: Timestamp.fromDate(new Date("2025-01-03")) },
  ];

  beforeAll(async () => {
    await Promise.all([
      setDoc(doc(db, parentCollection, "parent1", subCollection, "doc1"), testData[0]),
      setDoc(doc(db, parentCollection, "parent1", subCollection, "doc2"), testData[1]),
      setDoc(doc(db, parentCollection, "parent2", subCollection, "doc3"), testData[2]),
    ]);
  });

  afterAll(async () => {
    await deleteCollection(parentCollection, [subCollection]);
  });

  test("fetch all documents in collection group", async () => {
    const result = await fetchCollectionGroup<TestDoc>({
      path: subCollection,
    });

    expect(result).toHaveLength(3);
    expect(result.every((doc) => doc.exists)).toBe(true);
  });

  test("fetch with where clause", async () => {
    const result = await fetchCollectionGroup<TestDoc>({
      path: subCollection,
      where: [["score", ">=", 20]],
    });

    expect(result).toHaveLength(2);
    expect(result.every((doc) => doc.score >= 20)).toBe(true);
  });

  test("fetch with orderBy and limit", async () => {
    const result = await fetchCollectionGroup<TestDoc>({
      path: subCollection,
      orderBy: [["score", "desc"]],
      limit: 2,
    });

    expect(result).toHaveLength(2);
    expect(result[0].score).toBe(30);
    expect(result[1].score).toBe(20);
  });

  test("fetch with parseDates", async () => {
    const result = await fetchCollectionGroup<TestDoc>({
      path: subCollection,
      parseDates: ["createdAt"],
      orderBy: [["score", "asc"]],
      limit: 1,
    });

    expect(result).toHaveLength(1);
    expect(result[0].createdAt).toBeInstanceOf(Date);
  });
});
