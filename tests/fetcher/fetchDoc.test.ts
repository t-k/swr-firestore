import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { fetchDoc } from "../../src";
import { db } from "../supports/fb";
import { deleteCollection } from "../supports/fbUtil";

const testCollection = "FetchDocTest";

type TestDoc = {
  title: string;
  count: number;
  createdAt: Date;
};

describe("fetchDoc", () => {
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

  test("fetch document", async () => {
    const result = await fetchDoc<TestDoc>({
      path: `${testCollection}/${docId}`,
    });

    expect(result).toBeDefined();
    expect(result?.title).toBe("Test Document");
    expect(result?.count).toBe(42);
    expect(result?.id).toBe(docId);
  });

  test("fetch document with parseDates", async () => {
    const result = await fetchDoc<TestDoc>({
      path: `${testCollection}/${docId}`,
      parseDates: ["createdAt"],
    });

    expect(result).toBeDefined();
    expect(result?.createdAt).toBeInstanceOf(Date);
    expect(result?.createdAt.getFullYear()).toBe(2025);
  });

  test("return undefined for non-existent document", async () => {
    const result = await fetchDoc<TestDoc>({
      path: `${testCollection}/non-existent`,
    });

    expect(result).toBeUndefined();
  });
});
