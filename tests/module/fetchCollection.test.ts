import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { doc, setDoc, Timestamp } from "firebase/firestore";

import { fetchCollection } from "../../src/module/fetcher";
import { orderBy, where } from "../../src/module/query";
import { db } from "../supports/fb";
import { deleteCollection } from "../supports/fbUtil";

type TestDoc = {
  name: string;
  value: number;
  createdAt: Date;
};

const COLLECTION = "FetchCollectionTest";

describe("module fetchCollection", () => {
  beforeAll(async () => {
    await deleteCollection(COLLECTION);
    await Promise.all([
      setDoc(doc(db, COLLECTION, "doc-1"), {
        name: "A",
        value: 10,
        createdAt: Timestamp.fromDate(new Date("2025-01-01")),
      }),
      setDoc(doc(db, COLLECTION, "doc-2"), {
        name: "B",
        value: 20,
        createdAt: Timestamp.fromDate(new Date("2025-01-02")),
      }),
      setDoc(doc(db, COLLECTION, "doc-3"), {
        name: "C",
        value: 30,
        createdAt: Timestamp.fromDate(new Date("2025-01-03")),
      }),
    ]);
  });

  afterAll(async () => {
    await deleteCollection(COLLECTION);
  });

  test("fetches collection docs through the public fetcher barrel", async () => {
    const result = await fetchCollection<TestDoc>({
      path: COLLECTION,
      constraints: [where<TestDoc>("value", ">", 15), orderBy<TestDoc>("value", "desc")],
    });

    expect(result).toHaveLength(2);
    expect(result.map((doc) => doc.value)).toEqual([30, 20]);
  });

  test("parses dates when requested", async () => {
    const result = await fetchCollection<TestDoc>({
      path: COLLECTION,
      parseDates: ["createdAt"],
      constraints: [orderBy<TestDoc>("value", "asc")],
    });

    expect(result).toHaveLength(3);
    expect(result[0].createdAt).toBeInstanceOf(Date);
  });
});
