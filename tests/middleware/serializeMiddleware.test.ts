import serializeMiddleware from "../../src/middleware/serializeMiddleware";

describe("serializeMiddleware", () => {
  const createCapture = () => {
    let capturedKey: unknown;
    const useSWRNext = ((key: unknown) => {
      capturedKey = key;
      return {};
    }) as Parameters<typeof serializeMiddleware>[0];
    const middleware = serializeMiddleware(useSWRNext);
    return {
      call: (key: unknown) => {
        middleware(key, null as never, {} as never);
        return capturedKey;
      },
    };
  };

  it("should replace db with databaseId string using toJSON()", () => {
    const { call } = createCapture();
    const db = { toJSON: () => ({ databaseId: "(default)" }) };
    const result = call({ path: "test/doc", db });
    expect(result).toEqual({ path: "test/doc", databaseId: "(default)" });
  });

  it("should handle DatabaseId object from toJSON()", () => {
    const { call } = createCapture();
    // Firebase SDK may return DatabaseId object instead of plain string
    const db = {
      toJSON: () => ({
        databaseId: { database: "(default)", projectId: "my-project" },
      }),
    };
    const result = call({ path: "test/doc", db });
    expect(result).toEqual({ path: "test/doc", databaseId: "(default)" });
  });

  it("should produce different keys for different db instances", () => {
    const { call } = createCapture();
    const db1 = { toJSON: () => ({ databaseId: "(default)" }) };
    const db2 = { toJSON: () => ({ databaseId: "my-database" }) };

    const key1 = call({ path: "test/doc", db: db1 });
    const key2 = call({ path: "test/doc", db: db2 });

    expect(key1).toEqual({ path: "test/doc", databaseId: "(default)" });
    expect(key2).toEqual({ path: "test/doc", databaseId: "my-database" });
    expect(key1).not.toEqual(key2);
  });

  it("should not add databaseId when db is not provided", () => {
    const { call } = createCapture();
    const result = call({ path: "test/doc" });
    expect(result).toEqual({ path: "test/doc" });
  });

  it("should handle queryConstraints by JSON-serializing the key", () => {
    const { call } = createCapture();
    const db = { toJSON: () => ({ databaseId: "(default)" }) };
    const result = call({
      path: "test",
      db,
      queryConstraints: [{ type: "where" }],
    });
    expect(result).toEqual({
      path: "test",
      databaseId: "(default)",
      queryConstraints: [{ type: "where" }],
    });
  });
});
