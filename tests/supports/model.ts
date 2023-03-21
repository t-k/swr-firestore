const PostStatusList = ["draft", "published"] as const;
export type PostStatus = (typeof PostStatusList)[number];

export type Post = {
  content: string;
  status: PostStatus;
  createdAt: Date;
};

export type Comment = {
  content: string;
  createdAt: Date;
};
