# swr-firestore

[![npm version](https://badge.fury.io/js/@tatsuokaniwa%2Fswr-firestore.svg)](https://badge.fury.io/js/@tatsuokaniwa%2Fswr-firestore)
[![Node.js CI](https://github.com/t-k/swr-firestore/actions/workflows/test.yaml/badge.svg)](https://github.com/t-k/swr-firestore/actions/workflows/test.yaml)
[![codecov](https://codecov.io/gh/t-k/swr-firestore/branch/main/graph/badge.svg?token=6WREEC5HKZ)](https://codecov.io/gh/t-k/swr-firestore)

React Hooks library for Firestore, built using the Firebase v9 modular SDK. It utilizes the [`useSWRSubscription`](https://swr.vercel.app/docs/subscription) function from SWR library to enable subscription-based data fetching and caching.

Inspired by [swr-firestore-v9](https://www.npmjs.com/package/swr-firestore-v9)

## Installation

```bash
# if you use NPM
npm i --save @tatsuokaniwa/swr-firestore
# if you use Yarn
yarn add @tatsuokaniwa/swr-firestore
# if you use pnpm
pnpm i @tatsuokaniwa/swr-firestore
```

## Usage

```tsx
import { useCollection, useCollectionCount } from "@tatsuokaniwa/swr-firestore";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

initializeApp();
const db = getFirestore();

type Post = {
  content: string;
  status: "draft" | "published";
  createdAt: Date;
};
export default function App() {
  // Conditional Fetching
  const [isLogin, setIsLogin] = useState(false);
  const { data } = useCollection<Post>(
    isLogin
      ? {
          path: "posts",
          where: [["status", "==", "published"]],
          orderBy: [["createdAt", "desc"]],
          parseDates: ["createdAt"],
        }
      : null
  );
  const { data: postCount } = useCollectionCount<Post>({
    path: "posts",
    where: [["status", "==", "published"]],
  });
  return (
    <div>
      <h1>{postCount} posts</h1>
      {data?.map((x, i) => (
        <div key={i}>
          {x.content} {x.createdAt.toLocaleString()}
        </div>
      ))}
      <button onClick={() => setIsLogin(!isLogin)}>Toggle auth</button>
    </div>
  );
}
```

### For more complex queries

To perform complex queries like using `OR` queries or raw `QueryConstraint`, use the `queryConstraints` parameter.
However, this method does not provide input completion for field names from type definitions.

```tsx
import { or, orderBy, where } from "firebase/firestore";

useCollection<City>({
  path: "cities",
  queryConstraints: [
    or(where("capital", "==", true), where("population", ">=", 1000000)),
    orderBy("createdAt", "desc"),
  ],
});
```

### SSG and SSR

You can use the server module to get the SWR key and data.

```tsx
import { useCollection, useGetDocs } from "@tatsuokaniwa/swr-firestore"
import { getCollection } from "@tatsuokaniwa/swr-firestore/server"

export async function getStaticProps() {
  const params = {
    path: "posts",
    where: [["status", "==", "published"]],
  }
  const { key, data } = await getCollection<Post>({
    ...params,
    isSubscription: true, // Add the prefix `$sub$` to the SWR key
  })
  const { key: useGetDocsKey, data: useGetDocsData } = await getCollection<Post>(params)
  return {
    props: {
      fallback: {
        [key]: data,
        [useGetDocsKey]: useGetDocsData,
      }
    }
  }
}

export default function Page({ fallback }) {
  const { data } = useCollection<Post>({
    path: "posts",
    where: [["status", "==", "published"]],
  })
  const { data: useGetDocsData } = useGetDocs<Post>({
    path: "posts",
    where: [["status", "==", "published"]],
  })
  return (
    <SWRConfig value={{ fallback }}>
      {data?.map((x, i) => <div key={i}>{x.content}}</div>)}
    </SWRConfig>
  )
}
```

## API

```ts
import {
  useCollection, // Subscription for collection
  useCollectionCount, // Wrapper for getCountFromServer for collection
  useCollectionGroup, // Subscription for collectionGroup
  useCollectionGroupCount, // Wrapper for getCountFromServer for collectionGroup
  useDoc, // Subscription for document
  useGetDocs, // Fetch documents with firestore's getDocs
  useGetDoc, // Fetch document with firestore's getDoc
} from "@tatsuokaniwa/swr-firestore";

import {
  getCollection, // Get the SWR key and data for useCollection, useGetDocs
  getCollectionCount, // for useCollectionCount
  getCollectionGroup, // for useCollectionGroup, useGetDocs
  getCollectionGroupCount, // for useCollectionGroupCount
  getDoc, // for useDoc, useGetDoc
} from "@tatsuokaniwa/swr-firestore/server";
```

### Type definitions for parameters

```ts
import type {
  endAt,
  endBefore,
  limit,
  orderBy,
  startAfter,
  startAt,
  where,
} from "firebase/firestore";

type DocumentId = "id";
// First argument of hook, specifies options to firestore, and is also used as a key for SWR.
type KeyParams<T> =
  | {
      // The path to the collection or document of Firestore.
      path: string;
      // `Paths` means object's property path, including nested object
      where?: [
        Paths<T> | DocumentId, // "id" is internally converted to documentId()
        Parameters<typeof where>[1],
        ValueOf<T> | unknown
      ][];
      orderBy?: [Paths<T> | DocumentId, Parameters<typeof orderBy>[1]][];
      startAt?: Parameters<typeof startAt>;
      startAfter?: Parameters<typeof startAfter>;
      endAt?: Parameters<typeof endAt>;
      endBefore?: Parameters<typeof endBefore>;
      limit?: number;
      limitToLast?: number;
      // Array of field names that should be parsed as dates.
      parseDates?: Paths<T>[];
    }
  // OR for more complex query
  | {
      // The path to the collection or document of Firestore.
      path: string;
      // raw query constraints from `firebase/firestore`
      queryConstraints?:
        | [QueryCompositeFilterConstraint, ...Array<QueryNonFilterConstraint>]
        | QueryConstraint[];
      // Array of field names that should be parsed as dates.
      parseDates?: Paths<T>[];
    };
```

### Type definitions for return data

```ts
import type { QueryDocumentSnapshot } from "firebase/firestore";

type DocumentData<T> = T & Pick<QueryDocumentSnapshot, "exists" | "id" | "ref">;
```

### `useCollection(params, swrOptions)`

Subscription for collection

#### Parameters

- `params`: KeyParams | null
- `swrOptions`: [Options for SWR hook](https://swr.vercel.app/docs/api#options) except `fetcher`

#### Return values

- `data`: data for given path's collection
- `error`: FirestoreError

```ts
import { useCollection } from "@tatsuokaniwa/swr-firestore";

const { data, error } = useCollection<Post>({
  path: "posts",
});
```

### `useCollectionCount(params, swrOptions)`

Wrapper for getCountFromServer for collection

#### Parameters

- `params`: KeyParams except `parseDates` | null
- `swrOptions`: [Options for SWR hook](https://swr.vercel.app/docs/api#options) except `fetcher`

#### Return values

Returns [`SWRResponse`](https://swr.vercel.app/docs/api#return-values)

- `data`: number for given path's collection count result
- `error`: FirestoreError
- `isLoading`: if there's an ongoing request and no "loaded data". Fallback data and previous data are not considered "loaded data"
- `isValidating`: if there's a request or revalidation loading
- `mutate(data?, options?)`: function to mutate the cached data (details)

```ts
import { useCollectionCount } from "@tatsuokaniwa/swr-firestore";

const {
  data: postCount,
  error,
  isLoading,
} = useCollectionCount<Post>({
  path: "posts",
});
```

### `useCollectionGroup(params, swrOptions)`

Subscription for collectionGroup

#### Parameters

- `params`: KeyParams | null
- `swrOptions`: [Options for SWR hook](https://swr.vercel.app/docs/api#options) except `fetcher`

#### Return values

- `data`: data for given path's collectionGroup
- `error`: FirestoreError

### `useCollectionGroupCount(params, swrOptions)`

Wrapper for getCountFromServer for collectionGroup

#### Parameters

- `params`: KeyParams except `parseDates` | null
- `swrOptions`: [Options for SWR hook](https://swr.vercel.app/docs/api#options) except `fetcher`

#### Return values

Returns [`SWRResponse`](https://swr.vercel.app/docs/api#return-values)

- `data`: number for given path's collectionGroup count result
- `error`: FirestoreError
- `isLoading`: if there's an ongoing request and no "loaded data". Fallback data and previous data are not considered "loaded data"
- `isValidating`: if there's a request or revalidation loading
- `mutate(data?, options?)`: function to mutate the cached data (details)

### `useDoc(params, swrOptions)`

Subscription for document

#### Parameters

- `params`: KeyParams except `where`, `orderBy`, `limit` | null
- `swrOptions`: [Options for SWR hook](https://swr.vercel.app/docs/api#options) except `fetcher`

#### Return values

- `data`: data for given path's document
- `error`: FirestoreError

```ts
import { useDoc } from "@tatsuokaniwa/swr-firestore";

const { data, error } = useDoc<Post>({
  path: `posts/${postId}`,
});
```

### `useGetDocs(params, swrOptions)`

Fetch documents with firestore's [getDocs](https://firebase.google.com/docs/reference/js/firestore_.md#getdocs) function

#### Parameters

- `params`: KeyParams & { useOfflineCache?: boolean; isCollectionGroup?: boolean } | null

  set `isCollectionGroup: true` to get data from collectionGroup

- `swrOptions`: [Options for SWR hook](https://swr.vercel.app/docs/api#options) except `fetcher`

#### Return values

Returns [`SWRResponse`](https://swr.vercel.app/docs/api#return-values)

- `data`: data for given path's collection
- `error`: FirestoreError
- `isLoading`: if there's an ongoing request and no "loaded data". Fallback data and previous data are not considered "loaded data"
- `isValidating`: if there's a request or revalidation loading
- `mutate(data?, options?)`: function to mutate the cached data (details)

```ts
import { useGetDocs } from "@tatsuokaniwa/swr-firestore";

const { data, error } = useGetDocs<Post>({
  path: `posts`,
});
// for collectionGroup
const { data, error } = useGetDocs<Comment>({
  path: `comments`,
  isCollectionGroup: true,
});
```

### `useGetDoc(params, swrOptions)`

Fetch the document with firestore's [getDoc](https://firebase.google.com/docs/reference/js/firestore_.md#getdoc) function

#### Parameters

- `params`: (KeyParams & { useOfflineCache?: boolean }) except `where`, `orderBy`, `limit` | null
- `swrOptions`: [Options for SWR hook](https://swr.vercel.app/docs/api#options) except `fetcher`

#### Return values

Returns [`SWRResponse`](https://swr.vercel.app/docs/api#return-values)

- `data`: data for given path's document
- `error`: FirestoreError
- `isLoading`: if there's an ongoing request and no "loaded data". Fallback data and previous data are not considered "loaded data"
- `isValidating`: if there's a request or revalidation loading
- `mutate(data?, options?)`: function to mutate the cached data (details)

```ts
import { useGetDoc } from "@tatsuokaniwa/swr-firestore";

const { data, error } = useGetDoc<Post>({
  path: `posts/${postId}`,
});
```

## Server module

### `getCollection(params)`

Fetch documents using the Firebase Admin SDK and return the SWR key and data

#### Parameters

- `params`: KeyParams

#### Return values

Returns `Promise<{
  key: string;
  data: DocumentData<T>[];
}>`

- `key`: SWR Key
- `data`: documents in the collection for the given path

```ts
import { getCollection } from "@tatsuokaniwa/swr-firestore/server";

// For useCollection
const { key, data } = await getCollection<Post>({
  path: "posts",
  isSubscription: true, // Add the prefix `$sub$` to the SWR key
});
// For useGetDocs
const { key, data } = await getCollection<Post>({ path: "posts" });
```

### `getCollectionCount(params)`

Fetch document's count using the Firebase Admin SDK and return the SWR key and data

#### Parameters

- `params`: KeyParams except `parseDates`

#### Return values

Returns `Promise<{
  key: string;
  data: number;
}>`

- `key`: SWR Key
- `data`: number of documents in the collection for the given path.

```ts
import { getCollection } from "@tatsuokaniwa/swr-firestore/server";

// For useCollectionCount
const { key, data } = await getCollectionCount<Post>({ path: "posts" });
```

### `getCollectionGroup(params)`

Fetch documents using the Firebase Admin SDK and return the SWR key and data

#### Parameters

- `params`: KeyParams

#### Return values

Returns `Promise<{
  key: string;
  data: DocumentData<T>[];
}>`

- `key`: SWR Key
- `data`: documents in the collectionGroup for the given path

```ts
import { getCollectionGroup } from "@tatsuokaniwa/swr-firestore/server";

// For useCollectionGroup
const { key, data } = await getCollectionGroup<Comment>({
  path: "comments",
  isSubscription: true, // Add the prefix `$sub$` to the SWR key
});
// For useGetDocs with isCollectionGroup
const { key, data } = await getCollectionGroup<Comment>({ path: "comments" });
```

### `getCollectionGroupCount(params)`

Fetch document's count using the Firebase Admin SDK and return the SWR key and data

#### Parameters

- `params`: KeyParams except `parseDates`

#### Return values

Returns `Promise<{
  key: string;
  data: number;
}>`

- `key`: SWR Key
- `data`: number of documents in the collection group for the given path

```ts
import { getCollectionGroupCount } from "@tatsuokaniwa/swr-firestore/server";

// For useCollectionGroupCount
const { key, data } = await getCollectionGroupCount<Comment>({
  path: "comments",
});
```

### `getDoc(params)`

Fetch the document using the Firebase Admin SDK and return the SWR key and data

#### Parameters

- `params`: KeyParams

#### Return values

Returns `Promise<{
  key: string;
  data: DocumentData<T>;
}>`

- `key`: SWR Key
- `data`: data for given path's document

```ts
import { getDoc } from "@tatsuokaniwa/swr-firestore/server";

// For useDoc
const { key, data } = await getDoc<Post>({
  path: `posts/${postId}`,
  isSubscription: true, // Add the prefix `$sub$` to the SWR key
});
// For useGetDoc
const { key, data } = await getDoc<Post>({ path: `posts/${postId}` });
```

## Testing

Before running the test, you need to install the [Firebase tools](https://firebase.google.com/docs/cli).

```bash
npm run test:ci
```

## License

MIT
