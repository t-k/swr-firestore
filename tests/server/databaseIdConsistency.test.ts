import { unstable_serialize } from "swr";
import { db } from "../supports/fb";
import { db as adminDb } from "../supports/fbAdmin";
import { toDatabaseIdString } from "../../src/util/databaseId";
import serializeMiddleware from "../../src/middleware/serializeMiddleware";
import createSwrKey from "../../src/server/util/createKey";

describe("client/server databaseId consistency", () => {
  it("real Firestore instances should produce the same databaseId string", () => {
    // Client: db.toJSON().databaseId (may be string or DatabaseId object)
    const clientDatabaseId = toDatabaseIdString(
      (db.toJSON() as { databaseId: string | { database: string } }).databaseId
    );
    // Server: db.databaseId (may be string or DatabaseId object)
    const serverDatabaseId = toDatabaseIdString(
      adminDb.databaseId as string | { database: string }
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
    const clientKeyStr = unstable_serialize(
      clientKey as Record<string, unknown>
    );
    expect(clientKeyStr).toBe(serverKey);
  });
});
