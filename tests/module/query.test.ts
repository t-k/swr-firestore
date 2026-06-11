import { describe, expect, it } from "vitest";
import {
  documentId,
  limit as fbLimit,
  orderBy as fbOrderBy,
  where as fbWhere,
} from "firebase/firestore";

import { average, count, limit, orderBy, sum, where } from "../../src/module/query";
import { MATERIALIZE_CLIENT } from "../../src/module/util/type";

type Post = {
  status: "draft" | "published";
  createdAt: Date;
  price: number;
};

describe("module query builders", () => {
  it("keeps key fields enumerable", () => {
    const constraint = where<Post>("status", "==", "published");

    expect(JSON.parse(JSON.stringify(constraint))).toEqual({
      type: "where",
      field: "status",
      op: "==",
      value: "published",
    });
  });

  it("keeps materializer non-enumerable", () => {
    const constraint = orderBy<Post>("createdAt", "desc");
    const descriptor = Object.getOwnPropertyDescriptor(constraint, MATERIALIZE_CLIENT);

    expect(descriptor).toBeDefined();
    expect(descriptor?.enumerable).toBe(false);
  });

  it("materializes collection id orderBy with documentId", () => {
    const constraint = orderBy<Post>("id", "asc");
    const descriptor = Object.getOwnPropertyDescriptor(constraint, MATERIALIZE_CLIENT);

    expect(descriptor?.value()).toEqual(fbOrderBy(documentId(), "asc"));
  });

  it("materializes collection id where with documentId", () => {
    const constraint = where<Post>("id", "==", "post-1");
    const descriptor = Object.getOwnPropertyDescriptor(constraint, MATERIALIZE_CLIENT);

    expect(descriptor?.value()).toEqual(fbWhere(documentId(), "==", "post-1"));
  });

  it("materializes limit with firestore limit", () => {
    const constraint = limit(3);
    const descriptor = Object.getOwnPropertyDescriptor(constraint, MATERIALIZE_CLIENT);

    expect(descriptor?.value()).toEqual(fbLimit(3));
  });

  it("rejects zero limit values", () => {
    expect(() => limit(0)).toThrow("limit must be greater than 0");
  });

  it("returns aggregate helper shape for count", () => {
    expect(count()).toEqual({ type: "count" });
  });

  it("returns aggregate helper shapes for sum and average", () => {
    expect(sum<Post>("price")).toEqual({ type: "sum", field: "price" });
    expect(average<Post>("price")).toEqual({ type: "average", field: "price" });
  });
});
