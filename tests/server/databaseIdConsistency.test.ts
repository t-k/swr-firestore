import { unstable_serialize } from "swr";
import { db } from "../supports/fb";
import { db as adminDb } from "../supports/fbAdmin";
import { extractDatabaseIdentity, toDatabaseIdString } from "../../src/util/databaseId";
import serializeMiddleware from "../../src/middleware/serializeMiddleware";
import createSwrKey from "../../src/server/util/createKey";

describe("client/server databaseId consistency", () => {
  it("real Firestore instances should produce the same databaseId string", () => {
    // Client: db.toJSON().databaseId (may be string or DatabaseId object)
    const clientDatabaseId = toDatabaseIdString(
      (db.toJSON() as { databaseId: string | { database: string } }).databaseId,
    );
    // Server: db.databaseId (may be string or DatabaseId object)
    const serverDatabaseId = toDatabaseIdString(
      adminDb.databaseId as string | { database: string },
    );
    expect(clientDatabaseId).toBe(serverDatabaseId);
  });

  it("should produce matching SWR keys for the same path", () => {
    // Client side: capture the transformed key from serializeMiddleware
    let clientKey: unknown;
    const useSWRNext = ((key: unknown) => {
      clientKey = key;
      return {};
    }) as Parameters<typeof serializeMiddleware>[0];
    const middleware = serializeMiddleware(useSWRNext);
    middleware({ path: "test/doc", db }, null as never, {} as never);

    // Server side: generate key with createSwrKey
    const serverKey = createSwrKey({ path: "test/doc", db: adminDb });

    // Serialize the client key to match the server key format
    const clientKeyStr = unstable_serialize(clientKey as Record<string, unknown>);
    expect(clientKeyStr).toBe(serverKey);
  });

  it("should keep collection and collection-group SWR keys separate", () => {
    const collectionKey = createSwrKey({ path: "comments", isCollectionGroup: false });
    const collectionGroupKey = createSwrKey({ path: "comments", isCollectionGroup: true });

    expect(collectionKey).not.toBe(collectionGroupKey);
  });

  it("real client and admin Firestore instances should produce the same project-aware identity", () => {
    expect(extractDatabaseIdentity(adminDb)).toBe(extractDatabaseIdentity(db));
  });

  it("should produce matching SWR keys for Date-valued where params", () => {
    const params = {
      path: "test",
      where: [["createdAt", ">=", new Date("2024-01-01T00:00:00.000Z")]],
    };
    let clientKey: unknown;
    const useSWRNext = ((key: unknown) => {
      clientKey = key;
      return {};
    }) as Parameters<typeof serializeMiddleware>[0];
    const middleware = serializeMiddleware(useSWRNext);

    middleware(params, null as never, {} as never);

    expect(unstable_serialize(clientKey as Record<string, unknown>)).toBe(createSwrKey(params));
  });

  it("should produce matching SWR keys for complex collection params with real SDK instances", () => {
    const params = {
      path: "posts",
      db,
      where: [["status", "==", "published"]],
      orderBy: [["createdAt", "desc"]],
      limit: 10,
      isCollectionGroup: false,
    };
    let clientKey: unknown;
    const middleware = serializeMiddleware(((key: unknown) => {
      clientKey = key;
      return {};
    }) as Parameters<typeof serializeMiddleware>[0]);

    middleware(params, null as never, {} as never);

    expect(unstable_serialize(clientKey as Record<string, unknown>)).toBe(
      createSwrKey({ ...params, db: adminDb }),
    );
  });

  it("should produce matching count and aggregate keys with real SDK instances", () => {
    const countParams = {
      path: "posts",
      db,
      count: true,
      isCollectionGroup: false,
    };
    const aggregateParams = {
      path: "posts",
      db,
      aggregate: { total: { type: "count" } },
      _aggregate: true,
      isCollectionGroup: false,
    };

    let clientCountKey: unknown;
    let clientAggregateKey: unknown;
    const middleware = serializeMiddleware(((key: unknown) => {
      if ((key as { count?: unknown }).count) clientCountKey = key;
      if ((key as { _aggregate?: unknown })._aggregate) clientAggregateKey = key;
      return {};
    }) as Parameters<typeof serializeMiddleware>[0]);

    middleware(countParams, null as never, {} as never);
    middleware(aggregateParams, null as never, {} as never);

    expect(unstable_serialize(clientCountKey as Record<string, unknown>)).toBe(
      createSwrKey({ ...countParams, db: adminDb }),
    );
    expect(unstable_serialize(clientAggregateKey as Record<string, unknown>)).toBe(
      createSwrKey({ ...aggregateParams, db: adminDb }),
    );
  });
});
