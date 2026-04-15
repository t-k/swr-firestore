import { average, count, limit, orderBy, where } from "../../../src/module/query";
import type { ModuleQueryConstraint } from "../../../src/module/util/type";

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

const publishedConstraint = where<Post>("status", "==", "published");
const createdAtOrder = orderBy<Post>("createdAt", "desc");
const limited = limit(5);

if (publishedConstraint.type === "where") {
  const field: string = publishedConstraint.field;
  const op: string = publishedConstraint.op;
  const value: unknown = publishedConstraint.value;

  void field;
  void op;
  void value;
}

if (createdAtOrder.type === "orderBy") {
  const field: string = createdAtOrder.field;
  const direction: string = createdAtOrder.direction;

  void field;
  void direction;
}

if (limited.type === "limit") {
  const value: number = limited.value;

  void value;
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
const invalidCollectionGroupConstraint: ModuleQueryConstraint<Post, "shared" | "collectionGroup"> =
  orderBy<Post>("id", "asc");
