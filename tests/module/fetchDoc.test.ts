import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { doc, setDoc, Timestamp } from "firebase/firestore";

import { fetchDoc } from "../../src/module";
import { db } from "../supports/fb";
import { deleteCollection } from "../supports/fbUtil";

const COLLECTION = "ModuleFetchDocTest";

type TestDoc = {
  title: string;
  count: number;
  createdAt: Date;
};

describe("module fetchDoc", () => {
  const docId = "module-fetch-doc";

  beforeAll(async () => {
    await deleteCollection(COLLECTION);
    await setDoc(doc(db, COLLECTION, docId), {
      title: "Module Document",
      count: 42,
      createdAt: Timestamp.fromDate(new Date("2025-01-01")),
    });
  });

  afterAll(async () => {
    await deleteCollection(COLLECTION);
  });

  test("fetches an existing document from the emulator", async () => {
    const result = await fetchDoc<TestDoc>({
      path: `${COLLECTION}/${docId}`,
      db,
    });

    expect(result).toBeDefined();
    expect(result?.title).toBe("Module Document");
    expect(result?.count).toBe(42);
    expect(result?.id).toBe(docId);
  });

  test("parses dates when requested", async () => {
    const result = await fetchDoc<TestDoc>({
      path: `${COLLECTION}/${docId}`,
      db,
      parseDates: ["createdAt"],
    });

    expect(result?.createdAt).toBeInstanceOf(Date);
    expect(result?.createdAt.getFullYear()).toBe(2025);
  });
});
