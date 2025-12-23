import { afterAll, beforeAll, describe, expect, test } from "vitest";
import {
  collection,
  doc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { getDocInTx } from "../../src/server";
import { db } from "../supports/fb";
import { db as adminDb } from "../supports/fbAdmin";
import { deleteCollection } from "../supports/fbUtil";

const testCollection = "GetDocInTransactionTest";

type TestDoc = {
  title: string;
  count: number;
  createdAt: Date;
};

describe("getDocInTx", () => {
  const docId = "test-doc";
  const testData = {
    title: "Test Document",
    count: 42,
    createdAt: Timestamp.fromDate(new Date("2025-01-01")),
  };

  beforeAll(async () => {
    await setDoc(doc(db, testCollection, docId), testData);
  });

  afterAll(async () => {
    await deleteCollection(testCollection);
  });

  test("fetch document within transaction", async () => {
    const result = await adminDb.runTransaction(async (t) => {
      return await getDocInTx<TestDoc>(t, {
        path: `${testCollection}/${docId}`,
      });
    });

    expect(result).toBeDefined();
    expect(result?.title).toBe("Test Document");
    expect(result?.count).toBe(42);
    expect(result?.id).toBe(docId);
    expect(result?.exists).toBe(true);
  });

  test("fetch document with parseDates", async () => {
    const result = await adminDb.runTransaction(async (t) => {
      return await getDocInTx<TestDoc>(t, {
        path: `${testCollection}/${docId}`,
        parseDates: ["createdAt"],
      });
    });

    expect(result).toBeDefined();
    expect(result?.createdAt).toBeInstanceOf(Date);
    expect(result?.createdAt.getFullYear()).toBe(2025);
  });

  test("return undefined for non-existent document", async () => {
    const result = await adminDb.runTransaction(async (t) => {
      return await getDocInTx<TestDoc>(t, {
        path: `${testCollection}/non-existent`,
      });
    });

    expect(result).toBeUndefined();
  });

  test("can be used with other transaction operations", async () => {
    const newDocId = "transaction-update-test";

    // Create a document first
    await setDoc(doc(db, testCollection, newDocId), {
      title: "Initial",
      count: 0,
      createdAt: Timestamp.now(),
    });

    // Read and update in a transaction
    await adminDb.runTransaction(async (t) => {
      const docData = await getDocInTx<TestDoc>(t, {
        path: `${testCollection}/${newDocId}`,
      });

      if (docData) {
        t.update(adminDb.collection(testCollection).doc(newDocId), {
          count: docData.count + 1,
        });
      }
    });

    // Verify the update
    const updated = await adminDb.collection(testCollection).doc(newDocId).get();
    expect(updated.data()?.count).toBe(1);
  });
});
