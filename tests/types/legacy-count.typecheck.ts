import { useCollectionCount, useCollectionGroupCount } from "../../src";
import { getCollectionCount, getCollectionGroupCount } from "../../src/server";

type Post = {
  status: "draft" | "published";
  createdAt: Date;
};

useCollectionCount<Post>({
  path: "posts",
});

useCollectionGroupCount<Post>({
  path: "comments",
});

getCollectionCount<Post>({
  path: "posts",
});

getCollectionGroupCount<Post>({
  path: "comments",
});

useCollectionCount<Post>({
  path: "posts",
  // @ts-expect-error count keys do not parse document date fields
  parseDates: ["createdAt"],
});

useCollectionGroupCount<Post>({
  path: "comments",
  // @ts-expect-error collection-group count keys do not parse document date fields
  parseDates: ["createdAt"],
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
