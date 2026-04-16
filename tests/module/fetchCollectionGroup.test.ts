import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { doc, setDoc, Timestamp } from "firebase/firestore";

import { fetchCollectionGroup } from "../../src/module/fetcher";
import { orderBy, where } from "../../src/module/query";
import { db } from "../supports/fb";
import { deleteCollection } from "../supports/fbUtil";

type TestDoc = {
  text: string;
  score: number;
  createdAt: Date;
};

const PARENT = "ModuleFetchCollectionGroupParent";
const SUB_COLLECTION = "comments";

describe("module fetchCollectionGroup", () => {
  beforeAll(async () => {
    await deleteCollection(PARENT, [SUB_COLLECTION]);
    await Promise.all([
      setDoc(doc(db, PARENT, "parent1", SUB_COLLECTION, "doc-1"), {
        text: "A",
        score: 10,
        createdAt: Timestamp.fromDate(new Date("2025-01-01")),
      }),
      setDoc(doc(db, PARENT, "parent1", SUB_COLLECTION, "doc-2"), {
        text: "B",
        score: 20,
        createdAt: Timestamp.fromDate(new Date("2025-01-02")),
      }),
      setDoc(doc(db, PARENT, "parent2", SUB_COLLECTION, "doc-3"), {
        text: "C",
        score: 30,
        createdAt: Timestamp.fromDate(new Date("2025-01-03")),
      }),
    ]);
  });

  afterAll(async () => {
    await deleteCollection(PARENT, [SUB_COLLECTION]);
  });

  test("fetches collection group docs through the public fetcher barrel", async () => {
    const result = await fetchCollectionGroup<TestDoc>({
      path: SUB_COLLECTION,
      constraints: [where<TestDoc>("score", ">=", 20), orderBy<TestDoc>("score", "desc")],
    });

    expect(result).toHaveLength(2);
    expect(result.map((doc) => doc.score)).toEqual([30, 20]);
  });

  test("parses dates when requested", async () => {
    const result = await fetchCollectionGroup<TestDoc>({
      path: SUB_COLLECTION,
      parseDates: ["createdAt"],
      constraints: [orderBy<TestDoc>("score", "asc")],
    });

    expect(result).toHaveLength(3);
    expect(result[0].createdAt).toBeInstanceOf(Date);
  });
});
