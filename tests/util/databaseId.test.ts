import { describe, it, expect } from "vitest";
import { toDatabaseIdString, extractDatabaseId } from "../../src/util/databaseId";

describe("toDatabaseIdString", () => {
  it("returns string as-is", () => {
    expect(toDatabaseIdString("(default)")).toBe("(default)");
  });

  it("extracts database from object", () => {
    expect(toDatabaseIdString({ database: "(default)" })).toBe("(default)");
  });
});

describe("extractDatabaseId", () => {
  it("extracts databaseId string from db with toJSON()", () => {
    const db = { toJSON: () => ({ databaseId: "(default)" }) };
    expect(extractDatabaseId(db)).toBe("(default)");
  });

  it("extracts databaseId from DatabaseId object", () => {
    const db = {
      toJSON: () => ({ databaseId: { database: "(default)", projectId: "p" } }),
    };
    expect(extractDatabaseId(db)).toBe("(default)");
  });

  it("returns undefined for null/undefined", () => {
    expect(extractDatabaseId(null)).toBeUndefined();
    expect(extractDatabaseId(undefined)).toBeUndefined();
  });

  it("returns undefined for object without toJSON", () => {
    expect(extractDatabaseId({})).toBeUndefined();
  });

  it("returns undefined for object where toJSON is not a function", () => {
    expect(extractDatabaseId({ toJSON: "not-a-function" })).toBeUndefined();
  });

  it("returns undefined for toJSON that returns non-object", () => {
    expect(extractDatabaseId({ toJSON: () => "string" })).toBeUndefined();
  });

  it("returns undefined for toJSON result without databaseId", () => {
    expect(extractDatabaseId({ toJSON: () => ({ other: "value" }) })).toBeUndefined();
  });
});
