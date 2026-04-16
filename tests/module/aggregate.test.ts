import { renderHook, waitFor } from "@testing-library/react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { unstable_serialize } from "swr";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  fetchAggregate,
  useCollectionCount,
  useCollectionGroupCount,
} from "../../src/module/aggregate";
import {
  getAggregate,
  getCollectionCount,
  getCollectionGroupAggregate,
  getCollectionGroupCount,
} from "../../src/module/server";
import { count } from "../../src/module/query";
import { scrubModuleKey } from "../../src/module/util/scrubKey";
import { db } from "../supports/fb";
import { deleteCollection } from "../supports/fbUtil";

type Post = {
  status: "draft" | "published";
};

const COLLECTION = "FetchCollectionCountTest";
const GROUP_PARENT = "FetchCollectionGroupCountParent";
const GROUP_SUB_COLLECTION = "FetchSubCollectionGroupCountTest";

describe("module aggregate barrel", () => {
  beforeAll(async () => {
    await deleteCollection(COLLECTION);
    await deleteCollection(GROUP_PARENT, [GROUP_SUB_COLLECTION]);

    const collectionRef = collection(db, COLLECTION);
    await addDoc(collectionRef, { status: "draft", createdAt: serverTimestamp() });
    await addDoc(collectionRef, { status: "published", createdAt: serverTimestamp() });
    await addDoc(collectionRef, { status: "draft", createdAt: serverTimestamp() });

    const parentRef = collection(db, GROUP_PARENT);
    const parent = await addDoc(parentRef, { title: "parent", createdAt: serverTimestamp() });
    const groupRef = collection(db, `${GROUP_PARENT}/${parent.id}/${GROUP_SUB_COLLECTION}`);
    await addDoc(groupRef, { status: "draft", createdAt: serverTimestamp() });
    await addDoc(groupRef, { status: "published", createdAt: serverTimestamp() });
  });

  afterAll(async () => {
    await deleteCollection(COLLECTION);
    await deleteCollection(GROUP_PARENT, [GROUP_SUB_COLLECTION]);
  });

  it("fetches collection counts through the local aggregate barrel", async () => {
    const { result } = renderHook(() =>
      useCollectionCount<Post>({
        path: COLLECTION,
        db,
      }),
    );

    await waitFor(() => expect(result.current.data).toBe(3));
  });

  it("fetches collection group counts through the local aggregate barrel", async () => {
    const { result } = renderHook(() =>
      useCollectionGroupCount<Post>({
        path: GROUP_SUB_COLLECTION,
        db,
      }),
    );

    await waitFor(() => expect(result.current.data).toBe(2));
  });

  it("fetches collection counts through the local server barrel", async () => {
    const { data } = await getCollectionCount<Post>({
      path: COLLECTION,
    });

    expect(data).toBe(3);
  });

  it("fetches collection group counts through the local server barrel", async () => {
    const { data } = await getCollectionGroupCount<Post>({
      path: GROUP_SUB_COLLECTION,
    });

    expect(data).toBe(2);
  });

  it("keeps the collection count key aligned with the client key when db is omitted", async () => {
    const { key } = await getCollectionCount<Post>({
      path: COLLECTION,
    });

    expect(key).toBe(
      unstable_serialize(
        scrubModuleKey({ path: COLLECTION, count: true, isCollectionGroup: false }),
      ),
    );
  });

  it("keeps the collection group count key aligned with the client key when db is omitted", async () => {
    const { key } = await getCollectionGroupCount<Post>({
      path: GROUP_SUB_COLLECTION,
    });

    expect(key).toBe(
      unstable_serialize(
        scrubModuleKey({ path: GROUP_SUB_COLLECTION, count: true, isCollectionGroup: true }),
      ),
    );
  });

  it("keeps the collection aggregate key aligned with the client key when db is omitted", async () => {
    const aggregate = { total: count() };

    await fetchAggregate<Post, typeof aggregate>({
      path: COLLECTION,
      aggregate,
      db,
    });

    const { key } = await getAggregate<Post, typeof aggregate>({
      path: COLLECTION,
      aggregate,
    });

    expect(key).toBe(
      unstable_serialize(
        scrubModuleKey({
          path: COLLECTION,
          aggregate,
          _aggregate: true,
          isCollectionGroup: false,
        }),
      ),
    );
  });

  it("keeps the collection group aggregate key aligned with the client key when db is omitted", async () => {
    const aggregate = { total: count() };

    const { key } = await getCollectionGroupAggregate<Post, typeof aggregate>({
      path: GROUP_SUB_COLLECTION,
      aggregate,
    });

    expect(key).toBe(
      unstable_serialize(
        scrubModuleKey({
          path: GROUP_SUB_COLLECTION,
          aggregate,
          _aggregate: true,
          isCollectionGroup: true,
        }),
      ),
    );
  });

  it("ignores isSubscription for collection count keys", async () => {
    const { key } = await getCollectionCount<Post>({
      path: COLLECTION,
      isSubscription: true,
    } as never);

    expect(key.startsWith("$sub$")).toBe(false);
  });

  it("ignores isSubscription for collection group count keys", async () => {
    const { key } = await getCollectionGroupCount<Post>({
      path: GROUP_SUB_COLLECTION,
      isSubscription: true,
    } as never);

    expect(key.startsWith("$sub$")).toBe(false);
  });

  it("ignores isSubscription for collection aggregate keys", async () => {
    const aggregate = { total: count() };
    const { key } = await getAggregate<Post, typeof aggregate>({
      path: COLLECTION,
      aggregate,
      isSubscription: true,
    } as never);

    expect(key.startsWith("$sub$")).toBe(false);
  });

  it("ignores isSubscription for collection group aggregate keys", async () => {
    const aggregate = { total: count() };
    const { key } = await getCollectionGroupAggregate<Post, typeof aggregate>({
      path: GROUP_SUB_COLLECTION,
      aggregate,
      isSubscription: true,
    } as never);

    expect(key.startsWith("$sub$")).toBe(false);
  });
});
