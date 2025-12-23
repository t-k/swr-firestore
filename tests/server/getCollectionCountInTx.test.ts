import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { collection, doc, setDoc } from "firebase/firestore";
import { getCollectionCountInTx } from "../../src/server";
import { db } from "../supports/fb";
import { db as adminDb } from "../supports/fbAdmin";
import { deleteCollection } from "../supports/fbUtil";

const testCollection = "GetCollectionCountInTransactionTest";

type TestDoc = {
  name: string;
  value: number;
};

describe("getCollectionCountInTx", () => {
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

  test("count all documents in collection within transaction", async () => {
    const result = await adminDb.runTransaction(async (t) => {
      return await getCollectionCountInTx<TestDoc>(t, {
        path: testCollection,
      });
    });

    expect(result).toBe(5);
  });

  test("count with where clause", async () => {
    const result = await adminDb.runTransaction(async (t) => {
      return await getCollectionCountInTx<TestDoc>(t, {
        path: testCollection,
        where: [["value", ">", 25]],
      });
    });

    expect(result).toBe(3);
  });

  test("count with limit", async () => {
    const result = await adminDb.runTransaction(async (t) => {
      return await getCollectionCountInTx<TestDoc>(t, {
        path: testCollection,
        orderBy: [["value", "asc"]],
        limit: 2,
      });
    });

    expect(result).toBe(2);
  });

  test("return zero for non-matching query", async () => {
    const result = await adminDb.runTransaction(async (t) => {
      return await getCollectionCountInTx<TestDoc>(t, {
        path: testCollection,
        where: [["value", ">", 1000]],
      });
    });

    expect(result).toBe(0);
  });
});
