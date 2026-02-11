import createSwrKey from "../../src/server/util/createKey";

describe("createSwrKey", () => {
  it("should replace db with databaseId in the key", () => {
    const db = { databaseId: "(default)" } as never;
    const key = createSwrKey({ path: "test/doc", db });
    expect(key).toContain("(default)");
    // db object should not appear as "[object Object]"
    expect(key).not.toContain("[object Object]");
  });

  it("should handle DatabaseId object (Admin SDK v13+)", () => {
    // Admin SDK may return DatabaseId object instead of plain string
    const db = {
      databaseId: { database: "(default)", projectId: "my-project" },
    } as never;
    const key = createSwrKey({ path: "test/doc", db });
    expect(key).toContain("(default)");
    expect(key).not.toContain("projectId");
    expect(key).not.toContain("[object Object]");
  });

  it("should produce different keys for different db instances", () => {
    const db1 = { databaseId: "(default)" } as never;
    const db2 = { databaseId: "my-database" } as never;

    const key1 = createSwrKey({ path: "test/doc", db: db1 });
    const key2 = createSwrKey({ path: "test/doc", db: db2 });
    expect(key1).not.toEqual(key2);
  });

  it("should not include databaseId when db is not provided", () => {
    const key = createSwrKey({ path: "test/doc" });
    expect(key).not.toContain("databaseId");
  });

  it("should produce same key structure regardless of db presence for default db", () => {
    const db = { databaseId: "(default)" } as never;
    const keyWithDb = createSwrKey({ path: "test/doc", db });
    const keyWithoutDb = createSwrKey({ path: "test/doc" });
    // Keys should differ because one includes databaseId
    expect(keyWithDb).not.toEqual(keyWithoutDb);
    expect(keyWithDb).toContain("databaseId");
    expect(keyWithoutDb).not.toContain("databaseId");
  });

  it("should add subscription prefix when isSubscription is true", () => {
    const db = { databaseId: "(default)" } as never;
    const key = createSwrKey({ path: "test/doc", db, isSubscription: true });
    expect(key).toMatch(/^\$sub\$/);
    expect(key).toContain("(default)");
  });
});
