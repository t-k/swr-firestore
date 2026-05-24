import { describe, it, expect } from "vitest";
import {
  toDatabaseIdString,
  toDatabaseIdentityString,
  extractDatabaseId,
  extractDatabaseIdentity,
} from "../../src/util/databaseId";

describe("toDatabaseIdString", () => {
  it("returns string as-is", () => {
    expect(toDatabaseIdString("(default)")).toBe("(default)");
  });

  it("extracts database from object", () => {
    expect(toDatabaseIdString({ database: "(default)" })).toBe("(default)");
  });
});

describe("toDatabaseIdentityString", () => {
  it("returns string as-is", () => {
    expect(toDatabaseIdentityString("(default)")).toBe("(default)");
  });

  it("includes projectId when available", () => {
    expect(toDatabaseIdentityString({ database: "(default)", projectId: "project-a" })).toBe(
      "project-a/(default)",
    );
  });

  it("falls back to database when projectId is not available", () => {
    expect(toDatabaseIdentityString({ database: "secondary" })).toBe("secondary");
  });
});

describe("extractDatabaseId", () => {
  it("extracts databaseId string from db with toJSON()", () => {
    const db = { toJSON: () => ({ databaseId: "(default)" }) };
    expect(extractDatabaseId(db)).toBe("(default)");
  });

  it("extracts databaseId directly from admin db objects", () => {
    const db = { databaseId: { database: "(default)", projectId: "p" } };
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

describe("extractDatabaseIdentity", () => {
  it("extracts project-aware database identity directly from admin db objects", () => {
    const db = { databaseId: { database: "(default)", projectId: "project-a" } };
    expect(extractDatabaseIdentity(db)).toBe("project-a/(default)");
  });

  it("extracts project-aware database identity from db with toJSON()", () => {
    const db = {
      toJSON: () => ({ databaseId: { database: "(default)", projectId: "project-a" } }),
    };
    expect(extractDatabaseIdentity(db)).toBe("project-a/(default)");
  });

  it("falls back to database name when projectId is not available", () => {
    const db = { toJSON: () => ({ databaseId: "secondary" }) };
    expect(extractDatabaseIdentity(db)).toBe("secondary");
  });
});
