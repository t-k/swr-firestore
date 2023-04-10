const PostStatusList = ["draft", "published"] as const;
export type PostStatus = (typeof PostStatusList)[number];

export type Post = {
  content: string;
  status: PostStatus;
  createdAt: Date;
  sortableId?: number;
  author?: {
    name: string;
    createdAt: Date;
  };
};

export type Comment = {
  content: string;
  createdAt: Date;
  sortableId?: number;
};
