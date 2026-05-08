# swr-firestore module API

`@tatsuokaniwa/swr-firestore/module` is the tree-shaking-first API for this package.
Use it when you want typed field suggestions from builders like `where<T>()`, but do not want the root package to pull in query helpers you never import.

If you want the original object-style API, see [README.md](./README.md).

## Quick start

```tsx
import { useCollection } from "@tatsuokaniwa/swr-firestore/module";
import { orderBy, where } from "@tatsuokaniwa/swr-firestore/module/query";

type Post = {
  content: string;
  status: "draft" | "published";
  createdAt: Date;
};

const constraints = [where<Post>("status", "==", "published"), orderBy<Post>("createdAt", "desc")];

export default function App() {
  const { data } = useCollection<Post>({
    path: "posts",
    constraints,
  });

  return (
    <>
      {data?.map((post, i) => (
        <div key={i}>{post.content}</div>
      ))}
    </>
  );
}
```

## Entry points

```ts
import { useCollection, useGetDocs } from "@tatsuokaniwa/swr-firestore/module";
import { where, orderBy, count, average } from "@tatsuokaniwa/swr-firestore/module/query";
import { useDoc } from "@tatsuokaniwa/swr-firestore/module/subscription";
import {
  useAggregate,
  useCollectionCount,
  useCollectionGroupAggregate,
  useCollectionGroupCount,
  fetchAggregate,
  fetchCollectionCount,
  fetchCollectionGroupAggregate,
  fetchCollectionGroupCount,
} from "@tatsuokaniwa/swr-firestore/module/aggregate";
import {
  getAggregate,
  getCollection,
  getCollectionCount,
  getCollectionGroup,
  getCollectionGroupAggregate,
  getCollectionGroupCount,
  getDoc,
} from "@tatsuokaniwa/swr-firestore/module/server";
```

- `@tatsuokaniwa/swr-firestore/module`
  `constraints`-based client hooks and fetchers
- `@tatsuokaniwa/swr-firestore/module/query`
  typed query builders and aggregate builders
- `@tatsuokaniwa/swr-firestore/module/subscription`
  subscription hooks only
- `@tatsuokaniwa/swr-firestore/module/aggregate`
  aggregate/count hooks and client fetchers
- `@tatsuokaniwa/swr-firestore/module/server`
  server fetchers for SSR/SSG

## Typed constraints

Build constraints with functions from `module/query`.

```ts
import { limit, orderBy, where } from "@tatsuokaniwa/swr-firestore/module/query";

const constraints = [
  where<Post>("status", "==", "published"),
  orderBy<Post>("createdAt", "desc"),
  limit(20),
];
```

`where<T>()` and `orderBy<T>()` preserve field suggestions from `T`.
The `"id"` field is also supported for collection queries.

## SSR and SSG

Use the same `constraints` array on both the client and server.

```tsx
import { SWRConfig } from "swr";

import { useCollection } from "@tatsuokaniwa/swr-firestore/module";
import { orderBy, where } from "@tatsuokaniwa/swr-firestore/module/query";
import { getCollection } from "@tatsuokaniwa/swr-firestore/module/server";

type Post = {
  content: string;
  status: "draft" | "published";
  createdAt: Date;
};

const constraints = [where<Post>("status", "==", "published"), orderBy<Post>("createdAt", "desc")];

export async function getStaticProps() {
  const { key, data } = await getCollection<Post>({
    path: "posts",
    constraints,
    isSubscription: true,
  });

  return {
    props: {
      fallback: {
        [key]: data,
      },
    },
  };
}

function Posts() {
  const { data } = useCollection<Post>({
    path: "posts",
    constraints,
  });

  return (
    <>
      {data?.map((post, i) => (
        <div key={i}>{post.content}</div>
      ))}
    </>
  );
}

export default function Page({ fallback }: { fallback: Record<string, unknown> }) {
  return (
    <SWRConfig value={{ fallback }}>
      <Posts />
    </SWRConfig>
  );
}
```

## Aggregate APIs

Aggregate builders also come from `module/query`.

```tsx
import { useAggregate } from "@tatsuokaniwa/swr-firestore/module/aggregate";
import { average, count, where } from "@tatsuokaniwa/swr-firestore/module/query";

type Product = {
  category: string;
  price: number;
};

const { data } = useAggregate<Product>({
  path: "products",
  constraints: [where<Product>("category", "==", "book")],
  aggregate: {
    total: count(),
    avgPrice: average<Product>("price"),
  },
});
```

For server-side fallback generation, use the matching fetchers from `@tatsuokaniwa/swr-firestore/module/server`.
