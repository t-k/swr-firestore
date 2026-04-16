import {
  getAggregate,
  getCollectionCount,
  getCollectionGroupAggregate,
  getCollectionGroupCount,
} from "../../../src/module/server";
import { count } from "../../../src/module/query";

type Post = {
  status: "draft" | "published";
};

getCollectionCount<Post>({
  path: "posts",
});

getCollectionGroupCount<Post>({
  path: "comments",
});

getAggregate<Post, { total: { type: "count" } }>({
  path: "posts",
  aggregate: { total: count() },
});

getCollectionGroupAggregate<Post, { total: { type: "count" } }>({
  path: "comments",
  aggregate: { total: count() },
});

getCollectionCount<Post>({
  path: "posts",
  // @ts-expect-error count fallback keys do not support subscription mode
  isSubscription: true,
});

getCollectionGroupCount<Post>({
  path: "comments",
  // @ts-expect-error collection-group count fallback keys do not support subscription mode
  isSubscription: true,
});

getAggregate<Post, { total: { type: "count" } }>({
  path: "posts",
  aggregate: { total: count() },
  // @ts-expect-error aggregate fallback keys do not support subscription mode
  isSubscription: true,
});

getCollectionGroupAggregate<Post, { total: { type: "count" } }>({
  path: "comments",
  aggregate: { total: count() },
  // @ts-expect-error collection-group aggregate fallback keys do not support subscription mode
  isSubscription: true,
});
