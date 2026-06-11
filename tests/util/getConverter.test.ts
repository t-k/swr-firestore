import { describe, expect, it } from "vitest";

import { getFirestoreConverter } from "../../src/util/getConverter";
import { getFirestoreConverter as getServerFirestoreConverter } from "../../src/server/util/getConverter";

describe("getFirestoreConverter", () => {
  it("does not materialize missing parseDates paths", () => {
    const converter = getFirestoreConverter<{ a?: { b?: Date } }>(["a.b"]);
    const snapshot = {
      data: () => ({ title: "missing" }),
      ref: "ref",
      exists: () => true,
      id: "doc-1",
    };

    const data = converter.fromFirestore(snapshot as never);

    expect(data).toEqual({
      title: "missing",
      ref: "ref",
      exists: true,
      id: "doc-1",
    });
  });

  it("does not overwrite primitive intermediates for parseDates paths", () => {
    const converter = getFirestoreConverter<{ a: number }>(["a.b"]);
    const snapshot = {
      data: () => ({ a: 5 }),
      ref: "ref",
      exists: () => true,
      id: "doc-1",
    };

    const data = converter.fromFirestore(snapshot as never);

    expect(data).toMatchObject({ a: 5 });
  });

  it("does not pollute Object.prototype through parseDates paths", () => {
    const converter = getFirestoreConverter<Record<string, unknown>>(["__proto__.polluted"]);
    const snapshot = {
      data: () => ({}),
      ref: "ref",
      exists: () => true,
      id: "doc-1",
    };

    converter.fromFirestore(snapshot as never);

    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });

  it("normalizes client exists to a boolean independent of document fields", () => {
    const converter = getFirestoreConverter<{ _document: null }>();
    const snapshot = {
      data: () => ({ _document: null }),
      ref: "ref",
      exists(this: { _document?: unknown }) {
        return this._document != null;
      },
      id: "doc-1",
    };

    const data = converter.fromFirestore(snapshot as never);

    expect(data.exists).toBe(true);
  });

  it("forwards SnapshotOptions to the client snapshot", () => {
    const options = { serverTimestamps: "estimate" };
    let receivedOptions: unknown;
    const converter = getFirestoreConverter<{ createdAt: Date }>();
    const snapshot = {
      data: (snapshotOptions?: unknown) => {
        receivedOptions = snapshotOptions;
        return { createdAt: null };
      },
      ref: "ref",
      exists: () => true,
      id: "doc-1",
    };

    converter.fromFirestore(snapshot as never, options as never);

    expect(receivedOptions).toBe(options);
  });
});

describe("getServerFirestoreConverter", () => {
  it("normalizes admin exists to a boolean", () => {
    const converter = getServerFirestoreConverter<{ title: string }>();
    const snapshot = {
      data: () => ({ title: "server" }),
      ref: "ref",
      exists: true,
      id: "doc-1",
    };

    const data = converter.fromFirestore(snapshot as never);

    expect(data.exists).toBe(true);
  });
});
