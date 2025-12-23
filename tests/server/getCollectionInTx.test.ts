import { afterAll, beforeAll, describe, expect, test } from "vitest";
import {
  collection,
  doc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { getCollectionInTx } from "../../src/server";
import { db } from "../supports/fb";
import { db as adminDb } from "../supports/fbAdmin";
import { deleteCollection } from "../supports/fbUtil";

const testCollection = "GetCollectionInTransactionTest";

type TestDoc = {
  name: string;
  value: number;
  createdAt: Date;
};

describe("getCollectionInTx", () => {
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

  test("fetch all documents in collection within transaction", async () => {
    const result = await adminDb.runTransaction(async (t) => {
      return await getCollectionInTx<TestDoc>(t, {
        path: testCollection,
      });
    });

    expect(result).toHaveLength(5);
    expect(result.every((doc) => doc.exists)).toBe(true);
    expect(result.every((doc) => typeof doc.id === "string")).toBe(true);
  });

  test("fetch with where clause", async () => {
    const result = await adminDb.runTransaction(async (t) => {
      return await getCollectionInTx<TestDoc>(t, {
        path: testCollection,
        where: [["value", ">", 25]],
      });
    });

    expect(result).toHaveLength(3);
    expect(result.every((doc) => doc.value > 25)).toBe(true);
  });

  test("fetch with orderBy and limit", async () => {
    const result = await adminDb.runTransaction(async (t) => {
      return await getCollectionInTx<TestDoc>(t, {
        path: testCollection,
        orderBy: [["value", "desc"]],
        limit: 2,
      });
    });

    expect(result).toHaveLength(2);
    expect(result[0].value).toBe(50);
    expect(result[1].value).toBe(40);
  });

  test("fetch with parseDates", async () => {
    const result = await adminDb.runTransaction(async (t) => {
      return await getCollectionInTx<TestDoc>(t, {
        path: testCollection,
        parseDates: ["createdAt"],
        orderBy: [["value", "asc"]],
        limit: 1,
      });
    });

    expect(result).toHaveLength(1);
    expect(result[0].createdAt).toBeInstanceOf(Date);
  });

  test("fetch with multiple where clauses", async () => {
    const result = await adminDb.runTransaction(async (t) => {
      return await getCollectionInTx<TestDoc>(t, {
        path: testCollection,
        where: [
          ["value", ">=", 20],
          ["value", "<=", 40],
        ],
      });
    });

    expect(result).toHaveLength(3);
    expect(result.every((doc) => doc.value >= 20 && doc.value <= 40)).toBe(true);
  });

  test("return empty array for non-matching query", async () => {
    const result = await adminDb.runTransaction(async (t) => {
      return await getCollectionInTx<TestDoc>(t, {
        path: testCollection,
        where: [["value", ">", 1000]],
      });
    });

    expect(result).toHaveLength(0);
  });

  test("can be used with other transaction operations", async () => {
    // Read collection and update all documents in a transaction
    await adminDb.runTransaction(async (t) => {
      const docs = await getCollectionInTx<TestDoc>(t, {
        path: testCollection,
        where: [["name", "==", "A"]],
      });

      docs.forEach((docData) => {
        t.update(adminDb.collection(testCollection).doc(docData.id), {
          value: docData.value + 100,
        });
      });
    });

    // Verify the updates
    const snapshot = await adminDb
      .collection(testCollection)
      .where("name", "==", "A")
      .get();
    expect(snapshot.docs[0].data().value).toBe(110);
  });
});
