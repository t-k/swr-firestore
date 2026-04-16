import { renderHook, waitFor } from "@testing-library/react";
import { collection, doc, Timestamp, setDoc } from "firebase/firestore";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { useGetDoc } from "../../src/module";
import { db } from "../supports/fb";
import { deleteCollection } from "../supports/fbUtil";
import type { ModuleTestPost } from "../supports/model";

const COLLECTION = "useGetDocTest";

describe("module useGetDoc", () => {
  const docId = "module-get-doc";

  beforeAll(async () => {
    await deleteCollection(COLLECTION);
    const ref = collection(db, COLLECTION);
    await setDoc(doc(ref, docId), {
      content: "hello",
      status: "draft",
      createdAt: Timestamp.fromDate(new Date("2025-01-01")),
    });
  });

  afterAll(async () => {
    await deleteCollection(COLLECTION);
  });

  it("reads a document through the public barrel", async () => {
    const { result } = renderHook(() =>
      useGetDoc<ModuleTestPost>({
        path: `${COLLECTION}/${docId}`,
        db,
      }),
    );

    await waitFor(() => expect(result.current.data).toBeDefined(), { timeout: 5000 });
    expect(result.current.data?.id).toBe(docId);
    expect(result.current.data?.content).toBe("hello");
    expect(result.current.data?.createdAt instanceof Timestamp).toBe(true);
  });
});
