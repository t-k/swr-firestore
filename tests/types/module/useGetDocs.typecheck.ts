import { useGetDocs } from "../../../src/module";
import { orderBy, where } from "../../../src/module/query";

type Comment = {
  content: string;
  createdAt: Date;
};

useGetDocs<Comment>({
  path: "comments",
  isCollectionGroup: true,
  constraints: [where<Comment>("content", "==", "foo")],
});

const groupWithIdWhere = {
  path: "comments",
  isCollectionGroup: true as const,
  constraints: [where<Comment>("id", "==", "comment-1")],
};
// @ts-expect-error collection-group queries must reject collection-only id constraints
useGetDocs<Comment>(groupWithIdWhere);

const groupWithIdOrderBy = {
  path: "comments",
  isCollectionGroup: true as const,
  constraints: [orderBy<Comment>("id", "asc")],
};
// @ts-expect-error collection-group queries must reject collection-only id orderBy
useGetDocs<Comment>(groupWithIdOrderBy);

useGetDocs<Comment>({
  path: "posts",
  constraints: [where<Comment>("id", "==", "post-1")],
});
