import { describe, expect, it } from "vitest";

import * as aggregateBarrel from "../../src/aggregate";
import * as moduleAggregateBarrel from "../../src/module/aggregate";
import * as moduleSubscriptionBarrel from "../../src/module/subscription";
import * as subscriptionBarrel from "../../src/subscription";

describe("entrypoint barrels", () => {
  it("exports root subscription hooks", () => {
    expect(subscriptionBarrel).toHaveProperty("useCollection");
    expect(subscriptionBarrel).toHaveProperty("useCollectionGroup");
    expect(subscriptionBarrel).toHaveProperty("useDoc");
  });

  it("exports root aggregate hooks and fetchers", () => {
    expect(aggregateBarrel).toHaveProperty("useAggregate");
    expect(aggregateBarrel).toHaveProperty("useCollectionCount");
    expect(aggregateBarrel).toHaveProperty("useCollectionGroupAggregate");
    expect(aggregateBarrel).toHaveProperty("useCollectionGroupCount");
    expect(aggregateBarrel).toHaveProperty("fetchAggregate");
    expect(aggregateBarrel).toHaveProperty("fetchCollectionCount");
    expect(aggregateBarrel).toHaveProperty("fetchCollectionGroupAggregate");
    expect(aggregateBarrel).toHaveProperty("fetchCollectionGroupCount");
  });

  it("exports module subscription hooks", () => {
    expect(moduleSubscriptionBarrel).toHaveProperty("useCollection");
    expect(moduleSubscriptionBarrel).toHaveProperty("useCollectionGroup");
    expect(moduleSubscriptionBarrel).toHaveProperty("useDoc");
  });

  it("exports module aggregate hooks and fetchers", () => {
    expect(moduleAggregateBarrel).toHaveProperty("useAggregate");
    expect(moduleAggregateBarrel).toHaveProperty("useCollectionCount");
    expect(moduleAggregateBarrel).toHaveProperty("useCollectionGroupAggregate");
    expect(moduleAggregateBarrel).toHaveProperty("useCollectionGroupCount");
    expect(moduleAggregateBarrel).toHaveProperty("fetchAggregate");
    expect(moduleAggregateBarrel).toHaveProperty("fetchCollectionCount");
    expect(moduleAggregateBarrel).toHaveProperty("fetchCollectionGroupAggregate");
    expect(moduleAggregateBarrel).toHaveProperty("fetchCollectionGroupCount");
  });
});
