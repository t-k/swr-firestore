import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { doc, setDoc } from "firebase/firestore";
import { getCollectionGroupCountInTx } from "../../src/server";
import { db } from "../supports/fb";
import { db as adminDb } from "../supports/fbAdmin";
import { deleteCollection } from "../supports/fbUtil";

const parentCollection = "GetCollectionGroupCountInTransactionParent";
const subCollection = "GetSubCollectionGroupCountInTransactionTest";

type TestDoc = {
  text: string;
  score: number;
};

describe("getCollectionGroupCountInTx", () => {
  const testData = [
    { text: "Comment A", score: 10 },
    { text: "Comment B", score: 20 },
    { text: "Comment C", score: 30 },
    { text: "Comment D", score: 40 },
  ];

  beforeAll(async () => {
    // Create documents in subcollections under different parent documents
    await Promise.all([
      setDoc(doc(db, parentCollection, "parent1", subCollection, "doc1"), testData[0]),
      setDoc(doc(db, parentCollection, "parent1", subCollection, "doc2"), testData[1]),
      setDoc(doc(db, parentCollection, "parent2", subCollection, "doc3"), testData[2]),
      setDoc(doc(db, parentCollection, "parent2", subCollection, "doc4"), testData[3]),
    ]);
  });

  afterAll(async () => {
    await deleteCollection(parentCollection, [subCollection]);
  });

  test("count all documents in collection group within transaction", async () => {
    const result = await adminDb.runTransaction(async (t) => {
      return await getCollectionGroupCountInTx<TestDoc>(t, {
        path: subCollection,
      });
    });

    expect(result).toBe(4);
  });

  test("count with where clause", async () => {
    const result = await adminDb.runTransaction(async (t) => {
      return await getCollectionGroupCountInTx<TestDoc>(t, {
        path: subCollection,
        where: [["score", ">=", 20]],
      });
    });

    expect(result).toBe(3);
  });

  test("count with limit", async () => {
    const result = await adminDb.runTransaction(async (t) => {
      return await getCollectionGroupCountInTx<TestDoc>(t, {
        path: subCollection,
        orderBy: [["score", "asc"]],
        limit: 2,
      });
    });

    expect(result).toBe(2);
  });

  test("return zero for non-matching query", async () => {
    const result = await adminDb.runTransaction(async (t) => {
      return await getCollectionGroupCountInTx<TestDoc>(t, {
        path: subCollection,
        where: [["score", ">", 1000]],
      });
    });

    expect(result).toBe(0);
  });
});
