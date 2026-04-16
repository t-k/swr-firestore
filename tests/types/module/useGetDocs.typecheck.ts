import { useGetDocs } from "../../../src/module";
import { where } from "../../../src/module/query";

type Comment = {
  content: string;
  createdAt: Date;
};

useGetDocs<Comment>({
  path: "comments",
  isCollectionGroup: true,
  constraints: [where<Comment>("content", "==", "foo")],
});

// @ts-expect-error collection-group queries must reject collection-only id constraints
useGetDocs<Comment>({
  path: "comments",
  isCollectionGroup: true,
  constraints: [where<Comment>("id", "==", "comment-1")],
});

useGetDocs<Comment>({
  path: "posts",
  constraints: [where<Comment>("id", "==", "post-1")],
});
