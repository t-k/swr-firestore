import { average, count, orderBy, where } from "../../../src/module/query";
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

// @ts-expect-error number is invalid for status
where<Post>("status", "==", 1);

// @ts-expect-error array-contains expects element, not array
where<Post>("tags", "array-contains", ["news"]);

// @ts-expect-error collection group params must reject collection-only id constraint
const invalidCollectionGroupConstraint: ModuleQueryConstraint<Post, "shared" | "collectionGroup"> =
  orderBy<Post>("id", "asc");
