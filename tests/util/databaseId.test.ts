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

describe("database input validation", () => {
  const invalid = [
    null,
    undefined,
    0,
    "db",
    false,
    {},
    { toJSON: 1 },
    ...[null, undefined, 0, {}, { database: 1 }].map((databaseId) => ({ databaseId })),
    ...[null, undefined, "db", 0, {}, { databaseId: 1 }].map((json) => ({ toJSON: () => json })),
  ];
  it.each(invalid)("returns undefined for malformed input %#", (db) => {
    expect(extractDatabaseId(db)).toBeUndefined();
    expect(extractDatabaseIdentity(db)).toBeUndefined();
  });

  it("extracts string database names without a project", () => {
    expect(extractDatabaseIdentity({ databaseId: "secondary" })).toBe("secondary");
    expect(extractDatabaseId({ databaseId: "secondary" })).toBe("secondary");
  });

  it.each([
    [{ projectId: "p", _projectId: "q", app: { options: { projectId: "r" } } }, "p"],
    [{ projectId: 1, _projectId: "q", app: { options: { projectId: "r" } } }, "q"],
    [{ app: { options: { projectId: "r" } } }, "r"],
    [{ projectId: "" }, ""],
    [{ app: null }, undefined],
    [{ app: "app" }, undefined],
    [{ app: {} }, undefined],
    [{ app: { options: { projectId: 1 } } }, undefined],
  ])("resolves project source %#", (fields, project) => {
    expect(extractDatabaseIdentity({ ...fields, databaseId: "secondary" })).toBe(
      project === undefined ? "secondary" : `${project}/secondary`,
    );
  });
});
