import { renderHook, waitFor } from "@testing-library/react";
import { doc, serverTimestamp, setDoc, Timestamp } from "firebase/firestore";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { useDoc } from "../../src/module/subscription";
import { db } from "../supports/fb";
import { deleteCollection } from "../supports/fbUtil";
import type { ModuleTestPost } from "../supports/model";

const COLLECTION = "ModuleUseDocTest";
const ERR_COLLECTION = "ModuleUseDocErrTest";

describe("module useDoc", () => {
  const docId = "module-use-doc";

  beforeAll(async () => {
    await deleteCollection(COLLECTION);
    await setDoc(doc(db, COLLECTION, docId), {
      content: "hello",
      status: "draft",
      createdAt: Timestamp.fromDate(new Date("2025-01-01")),
    });
  });

  afterAll(async () => {
    await deleteCollection(COLLECTION);
  });

  it("subscribes to a document and receives realtime updates", async () => {
    const { result } = renderHook(() =>
      useDoc<ModuleTestPost>({
        path: `${COLLECTION}/${docId}`,
        db,
        parseDates: ["createdAt"],
      }),
    );

    await waitFor(() => expect(result.current.data?.content).toBe("hello"));
    expect(result.current.data?.createdAt).toBeInstanceOf(Date);

    await setDoc(doc(db, COLLECTION, docId), {
      content: "updated",
      status: "published",
      createdAt: serverTimestamp(),
    });

    await waitFor(() => expect(result.current.data?.content).toBe("updated"));
  });

  it("surfaces FirestoreError on permission denied", async () => {
    const { result } = renderHook(() =>
      useDoc<ModuleTestPost>({
        path: `${ERR_COLLECTION}/blocked`,
        db,
      }),
    );

    await waitFor(() => expect(result.current.error?.code).toBe("permission-denied"));
  });

  it("stops receiving snapshot updates after unmount", async () => {
    const { result, unmount } = renderHook(() =>
      useDoc<ModuleTestPost>({
        path: `${COLLECTION}/${docId}`,
        db,
      }),
    );

    await waitFor(() => expect(result.current.data?.content).toBeDefined());
    const lastContent = result.current.data?.content;

    unmount();
    await setDoc(doc(db, COLLECTION, docId), {
      content: "after-unmount",
      status: "published",
      createdAt: serverTimestamp(),
    });
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(result.current.data?.content).toBe(lastContent);
  });
});
