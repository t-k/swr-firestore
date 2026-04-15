import { describe, expect, it } from "vitest";
import { documentId, orderBy as fbOrderBy } from "firebase/firestore";

import { count, orderBy, where } from "../../src/module/query";
import { MATERIALIZE_CLIENT } from "../../src/module/util/type";

type Post = {
  status: "draft" | "published";
  createdAt: Date;
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

  it("returns aggregate helper shape for count", () => {
    expect(count()).toEqual({ type: "count" });
  });
});
