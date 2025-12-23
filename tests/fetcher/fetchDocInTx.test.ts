import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { doc, setDoc, Timestamp, getFirestore, runTransaction } from "firebase/firestore";
import { fetchDocInTx } from "../../src";
import { db } from "../supports/fb";
import { deleteCollection } from "../supports/fbUtil";

const testCollection = "FetchDocInTransactionTest";

type TestDoc = {
  title: string;
  count: number;
  createdAt: Date;
};

describe("fetchDocInTx", () => {
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
    const result = await runTransaction(db, async (t) => {
      return await fetchDocInTx<TestDoc>(t, {
        path: `${testCollection}/${docId}`,
      });
    });

    expect(result).toBeDefined();
    expect(result?.title).toBe("Test Document");
    expect(result?.count).toBe(42);
    expect(result?.id).toBe(docId);
  });

  test("fetch document with parseDates within transaction", async () => {
    const result = await runTransaction(db, async (t) => {
      return await fetchDocInTx<TestDoc>(t, {
        path: `${testCollection}/${docId}`,
        parseDates: ["createdAt"],
      });
    });

    expect(result).toBeDefined();
    expect(result?.createdAt).toBeInstanceOf(Date);
    expect(result?.createdAt.getFullYear()).toBe(2025);
  });

  test("return undefined for non-existent document", async () => {
    const result = await runTransaction(db, async (t) => {
      return await fetchDocInTx<TestDoc>(t, {
        path: `${testCollection}/non-existent`,
      });
    });

    expect(result).toBeUndefined();
  });

  test("can be used with other transaction operations", async () => {
    const newDocId = "transaction-update-test";

    await setDoc(doc(db, testCollection, newDocId), {
      title: "Initial",
      count: 0,
      createdAt: Timestamp.now(),
    });

    await runTransaction(db, async (t) => {
      const docData = await fetchDocInTx<TestDoc>(t, {
        path: `${testCollection}/${newDocId}`,
      });

      if (docData) {
        t.update(doc(db, testCollection, newDocId), {
          count: docData.count + 1,
        });
      }
    });

    const result = await runTransaction(db, async (t) => {
      return await fetchDocInTx<TestDoc>(t, {
        path: `${testCollection}/${newDocId}`,
      });
    });

    expect(result?.count).toBe(1);
  });
});
