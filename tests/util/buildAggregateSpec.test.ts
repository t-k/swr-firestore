import { describe, expect, it } from "vitest";
import { average, count, sum } from "firebase/firestore";
import { buildAggregateSpec } from "../../src/util/buildAggregateSpec";

describe("buildAggregateSpec", () => {
  it("preserves aliases, operations, and distinct field paths", () => {
    expect(
      buildAggregateSpec({
        total: { type: "count" },
        revenue: { type: "sum", field: "price" },
        mean: { type: "average", field: "rating" },
      }),
    ).toEqual({ total: count(), revenue: sum("price"), mean: average("rating") });
  });

  it("returns an empty spec without adding aggregates", () => {
    expect(buildAggregateSpec({})).toEqual({});
  });
});
