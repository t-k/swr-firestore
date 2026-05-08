import { average, count, limit, orderBy, sum, where } from "../../../src/module/query";
import type {
  ModuleAverageAggregateField,
  ModuleQueryConstraint,
  ModuleSumAggregateField,
} from "../../../src/module/util/type";

type Post = {
  status: "draft" | "published";
  createdAt: Date;
  price: number;
  tags: string[];
  author: { name: string };
};

where<Post>("status", "==", "published");
where<Post>("author.name", "==", "alice");
where<Post>("tags", "array-contains", "news");
orderBy<Post>("createdAt", "desc");
count();
average<Post>("price");
sum<Post>("price");

const publishedConstraint = where<Post>("status", "==", "published");
const tagConstraint = where<Post>("tags", "array-contains", "news");
const idConstraint = where<Post>("id", "in", ["post-1"]);
const createdAtOrder = orderBy<Post>("createdAt", "desc");
const limited = limit(5);
const summedPrice = sum<Post>("price");
const averagedPrice = average<Post>("price");

if (publishedConstraint.type === "where" && publishedConstraint.field === "status") {
  const op: string = publishedConstraint.op;

  void op;

  if (publishedConstraint.op === "==") {
    const value: Post["status"] = publishedConstraint.value;

    void value;
  }
}

if (tagConstraint.type === "where" && tagConstraint.field === "tags") {
  const op: string = tagConstraint.op;

  void op;

  if (tagConstraint.op === "array-contains") {
    const value: string = tagConstraint.value;

    void value;
  }
}

if (idConstraint.type === "where" && idConstraint.field === "id" && idConstraint.op === "in") {
  const value: readonly string[] = idConstraint.value;

  void value;
}

if (createdAtOrder.type === "orderBy") {
  const field: string = createdAtOrder.field;
  const direction: "asc" | "desc" = createdAtOrder.direction;

  void field;
  void direction;
}

if (limited.type === "limit") {
  const value: number = limited.value;

  void value;
}

if (summedPrice.type === "sum") {
  const field: string = summedPrice.field;
  const aggregate: ModuleSumAggregateField<Post> = summedPrice;

  void field;
  void aggregate;
}

if (averagedPrice.type === "average") {
  const field: string = averagedPrice.field;
  const aggregate: ModuleAverageAggregateField<Post> = averagedPrice;

  void field;
  void aggregate;
}

// @ts-expect-error number is invalid for status
where<Post>("status", "==", 1);

// @ts-expect-error array-contains expects element, not array
where<Post>("tags", "array-contains", ["news"]);

// @ts-expect-error id equality expects a string, not an array
where<Post>("id", "==", ["x"]);

// @ts-expect-error id in expects an array, not a string
where<Post>("id", "in", "x");

// @ts-expect-error collection group params must reject collection-only id constraint
const _invalidCollectionGroupConstraint: ModuleQueryConstraint<Post, "shared" | "collectionGroup"> =
  orderBy<Post>("id", "asc");
