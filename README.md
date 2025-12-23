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

### Requirements for Aggregation Queries

To use aggregation features (`useAggregate`, `useCollectionGroupAggregate`, `fetchAggregate`, `fetchCollectionGroupAggregate`):

- Client-side: `firebase >= 9.17.0`
- Server-side: `firebase-admin >= 11.5.0` (recommended)

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
    isLogin && {
      path: "posts",
      where: [["status", "==", "published"]],
      orderBy: [["createdAt", "desc"]],
      parseDates: ["createdAt"],
    }
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
  // SWR Hooks
  useCollection, // Subscription for collection
  useCollectionCount, // Wrapper for getCountFromServer for collection
  useCollectionGroup, // Subscription for collectionGroup
  useCollectionGroupCount, // Wrapper for getCountFromServer for collectionGroup
  useAggregate, // Aggregation queries (count, sum, average) for collection
  useCollectionGroupAggregate, // Aggregation queries for collectionGroup
  useDoc, // Subscription for document
  useGetDocs, // Fetch documents with firestore's getDocs
  useGetDoc, // Fetch document with firestore's getDoc
  // Client-side fetchers (without SWR)
  fetchDoc, // Fetch single document
  fetchCollection, // Fetch collection
  fetchCollectionCount, // Count documents in collection
  fetchCollectionGroup, // Fetch collection group
  fetchCollectionGroupCount, // Count documents in collection group
  fetchAggregate, // Aggregation queries for collection
  fetchCollectionGroupAggregate, // Aggregation queries for collection group
  // Client-side transaction fetcher
  fetchDocInTx, // Fetch document within transaction
} from "@tatsuokaniwa/swr-firestore";

import {
  getCollection, // Get the SWR key and data for useCollection, useGetDocs
  getCollectionCount, // for useCollectionCount
  getCollectionGroup, // for useCollectionGroup, useGetDocs
  getCollectionGroupCount, // for useCollectionGroupCount
  getAggregate, // for useAggregate
  getCollectionGroupAggregate, // for useCollectionGroupAggregate
  getDoc, // for useDoc, useGetDoc
  // Transaction-aware fetchers (for use within db.runTransaction)
  getDocInTx,
  getCollectionInTx,
  getCollectionCountInTx,
  getCollectionGroupInTx,
  getCollectionGroupCountInTx,
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

### `useAggregate(params, swrOptions)`

Wrapper for getAggregateFromServer for collection. Supports count, sum, and average aggregations in a single query.

#### Parameters

- `params`: KeyParams except `parseDates` & { aggregate: AggregateSpec } | null
- `swrOptions`: [Options for SWR hook](https://swr.vercel.app/docs/api#options) except `fetcher`

#### Return values

Returns [`SWRResponse`](https://swr.vercel.app/docs/api#return-values)

- `data`: aggregation result object with keys matching the aggregate spec
- `error`: FirestoreError
- `isLoading`: if there's an ongoing request and no "loaded data"
- `isValidating`: if there's a request or revalidation loading
- `mutate(data?, options?)`: function to mutate the cached data

```ts
import { useAggregate } from "@tatsuokaniwa/swr-firestore";

type Product = {
  name: string;
  category: string;
  price: number;
  stock: number;
};

const { data, error, isLoading } = useAggregate<
  Product,
  {
    totalStock: { type: "sum"; field: "stock" };
    averagePrice: { type: "average"; field: "price" };
    productCount: { type: "count" };
  }
>({
  path: "products",
  where: [["category", "==", "electronics"]],
  aggregate: {
    totalStock: { type: "sum", field: "stock" },
    averagePrice: { type: "average", field: "price" },
    productCount: { type: "count" },
  },
});

if (data) {
  console.log(data.productCount); // number
  console.log(data.totalStock); // number
  console.log(data.averagePrice); // number | null (null when no documents)
}
```

### `useCollectionGroupAggregate(params, swrOptions)`

Wrapper for getAggregateFromServer for collectionGroup. Supports count, sum, and average aggregations across subcollections.

#### Parameters

- `params`: KeyParams except `parseDates` & { aggregate: AggregateSpec } | null
- `swrOptions`: [Options for SWR hook](https://swr.vercel.app/docs/api#options) except `fetcher`

#### Return values

Returns [`SWRResponse`](https://swr.vercel.app/docs/api#return-values)

- `data`: aggregation result object with keys matching the aggregate spec
- `error`: FirestoreError
- `isLoading`: if there's an ongoing request and no "loaded data"
- `isValidating`: if there's a request or revalidation loading
- `mutate(data?, options?)`: function to mutate the cached data

```ts
import { useCollectionGroupAggregate } from "@tatsuokaniwa/swr-firestore";

type OrderItem = {
  productId: string;
  price: number;
  quantity: number;
};

// Aggregate across all "items" subcollections
const { data } = useCollectionGroupAggregate<
  OrderItem,
  {
    totalRevenue: { type: "sum"; field: "price" };
    itemCount: { type: "count" };
  }
>({
  path: "items",
  aggregate: {
    totalRevenue: { type: "sum", field: "price" },
    itemCount: { type: "count" },
  },
});
```

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

## Client-side fetchers

These functions fetch data directly from Firestore without SWR caching. Useful for one-off data fetching, imperative data loading, or when you don't need SWR's caching and revalidation features.

### `fetchDoc(params)`

Fetch a single document from Firestore

```ts
import { fetchDoc } from "@tatsuokaniwa/swr-firestore";

const city = await fetchDoc<City>({
  path: "cities/tokyo",
  parseDates: ["createdAt"],
});
```

### `fetchCollection(params)`

Fetch documents from a collection

```ts
import { fetchCollection } from "@tatsuokaniwa/swr-firestore";

const cities = await fetchCollection<City>({
  path: "cities",
  where: [["population", ">", 1000000]],
  orderBy: [["population", "desc"]],
  limit: 10,
});
```

### `fetchCollectionCount(params)`

Count documents in a collection

```ts
import { fetchCollectionCount } from "@tatsuokaniwa/swr-firestore";

const count = await fetchCollectionCount<City>({
  path: "cities",
  where: [["population", ">", 1000000]],
});
```

### `fetchCollectionGroup(params)`

Fetch documents from a collection group

```ts
import { fetchCollectionGroup } from "@tatsuokaniwa/swr-firestore";

const comments = await fetchCollectionGroup<Comment>({
  path: "comments",
  where: [["authorId", "==", "user123"]],
  limit: 10,
});
```

### `fetchCollectionGroupCount(params)`

Count documents in a collection group

```ts
import { fetchCollectionGroupCount } from "@tatsuokaniwa/swr-firestore";

const count = await fetchCollectionGroupCount<Comment>({
  path: "comments",
  where: [["status", "==", "approved"]],
});
```

### `fetchAggregate(params)`

Fetch aggregation result from a collection

```ts
import { fetchAggregate } from "@tatsuokaniwa/swr-firestore";

const result = await fetchAggregate<
  Product,
  {
    count: { type: "count" };
    totalStock: { type: "sum"; field: "stock" };
    avgPrice: { type: "average"; field: "price" };
  }
>({
  path: "products",
  aggregate: {
    count: { type: "count" },
    totalStock: { type: "sum", field: "stock" },
    avgPrice: { type: "average", field: "price" },
  },
});
```

### `fetchCollectionGroupAggregate(params)`

Fetch aggregation result from a collection group

```ts
import { fetchCollectionGroupAggregate } from "@tatsuokaniwa/swr-firestore";

const result = await fetchCollectionGroupAggregate<
  OrderItem,
  { totalRevenue: { type: "sum"; field: "price" } }
>({
  path: "items",
  aggregate: {
    totalRevenue: { type: "sum", field: "price" },
  },
});
```

### `fetchDocInTx(transaction, params)`

Fetch a single document within a Firestore transaction (client-side)

Note: Due to Firebase client SDK limitations, only document fetching is supported in transactions. Collection queries within transactions are only available in the server module.

```ts
import { getFirestore, runTransaction } from "firebase/firestore";
import { fetchDocInTx } from "@tatsuokaniwa/swr-firestore";

const db = getFirestore();

await runTransaction(db, async (t) => {
  const city = await fetchDocInTx<City>(t, {
    path: "cities/tokyo",
    parseDates: ["createdAt"],
  });

  if (city) {
    t.update(doc(db, "cities/tokyo"), {
      population: city.population + 1,
    });
  }
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
import { getCollectionCount } from "@tatsuokaniwa/swr-firestore/server";

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

### `getAggregate(params)`

Fetch aggregation result using the Firebase Admin SDK and return the SWR key and data

#### Parameters

- `params`: KeyParams except `parseDates`, `queryConstraints` & { aggregate: AggregateSpec }

Note: `queryConstraints` is not supported on the server side because the Admin SDK uses a different query builder API.

#### Return values

Returns `Promise<{
  key: string;
  data: AggregateResult<TSpec>;
}>`

- `key`: SWR Key
- `data`: aggregation result object

```ts
import { getAggregate } from "@tatsuokaniwa/swr-firestore/server";

// For useAggregate
const { key, data } = await getAggregate<
  Product,
  {
    count: { type: "count" };
    totalRevenue: { type: "sum"; field: "price" };
  }
>({
  path: "products",
  aggregate: {
    count: { type: "count" },
    totalRevenue: { type: "sum", field: "price" },
  },
});
```

### `getCollectionGroupAggregate(params)`

Fetch aggregation result across subcollections using the Firebase Admin SDK

#### Parameters

- `params`: KeyParams except `parseDates`, `queryConstraints` & { aggregate: AggregateSpec }

Note: `queryConstraints` is not supported on the server side because the Admin SDK uses a different query builder API.

#### Return values

Returns `Promise<{
  key: string;
  data: AggregateResult<TSpec>;
}>`

- `key`: SWR Key
- `data`: aggregation result object

```ts
import { getCollectionGroupAggregate } from "@tatsuokaniwa/swr-firestore/server";

// For useCollectionGroupAggregate
const { key, data } = await getCollectionGroupAggregate<
  OrderItem,
  { totalItems: { type: "count" } }
>({
  path: "items",
  aggregate: {
    totalItems: { type: "count" },
  },
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

### `getDocInTx(transaction, params)`

Type-safe document fetcher for use within Firestore transactions

#### Parameters

- `transaction`: Firebase Admin SDK Transaction object
- `params`: KeyParams except `where`, `orderBy`, `limit`

#### Return values

Returns `Promise<DocumentData<T> | undefined>`

- Returns the document data, or undefined if the document does not exist

```ts
import { getFirestore } from "firebase-admin/firestore";
import { getDocInTx } from "@tatsuokaniwa/swr-firestore/server";

const db = getFirestore();

await db.runTransaction(async (t) => {
  const city = await getDocInTx<City>(t, {
    path: "cities/tokyo",
    parseDates: ["createdAt"],
  });

  if (city) {
    t.update(db.doc("cities/tokyo"), {
      population: city.population + 1,
    });
  }
});
```

### `getCollectionInTx(transaction, params)`

Type-safe collection fetcher for use within Firestore transactions

#### Parameters

- `transaction`: Firebase Admin SDK Transaction object
- `params`: KeyParams

#### Return values

Returns `Promise<DocumentData<T>[]>`

- Returns an array of document data

```ts
import { getFirestore } from "firebase-admin/firestore";
import { getCollectionInTx } from "@tatsuokaniwa/swr-firestore/server";

const db = getFirestore();

await db.runTransaction(async (t) => {
  const cities = await getCollectionInTx<City>(t, {
    path: "cities",
    where: [["population", ">", 1000000]],
    orderBy: [["population", "desc"]],
    limit: 10,
  });

  cities.forEach((city) => {
    t.update(db.doc(`cities/${city.id}`), {
      isLargeCity: true,
    });
  });
});
```

### `getCollectionCountInTx(transaction, params)`

Type-safe collection count fetcher for use within Firestore transactions

#### Parameters

- `transaction`: Firebase Admin SDK Transaction object
- `params`: KeyParams except `parseDates`

#### Return values

Returns `Promise<number>`

```ts
await db.runTransaction(async (t) => {
  const count = await getCollectionCountInTx<City>(t, {
    path: "cities",
    where: [["population", ">", 1000000]],
  });
  console.log(`Found ${count} large cities`);
});
```

### `getCollectionGroupInTx(transaction, params)`

Type-safe collection group fetcher for use within Firestore transactions

#### Parameters

- `transaction`: Firebase Admin SDK Transaction object
- `params`: KeyParams

#### Return values

Returns `Promise<DocumentData<T>[]>`

```ts
await db.runTransaction(async (t) => {
  const comments = await getCollectionGroupInTx<Comment>(t, {
    path: "comments",
    where: [["authorId", "==", "user123"]],
    limit: 10,
  });
  // comments is DocumentData<Comment>[]
});
```

### `getCollectionGroupCountInTx(transaction, params)`

Type-safe collection group count fetcher for use within Firestore transactions

#### Parameters

- `transaction`: Firebase Admin SDK Transaction object
- `params`: KeyParams except `parseDates`

#### Return values

Returns `Promise<number>`

```ts
await db.runTransaction(async (t) => {
  const count = await getCollectionGroupCountInTx<Comment>(t, {
    path: "comments",
    where: [["status", "==", "approved"]],
  });
  console.log(`Found ${count} approved comments`);
});
```

## Testing

Before running the test, you need to install the [Firebase tools](https://firebase.google.com/docs/cli).

```bash
npm run test:ci
```

## License

MIT
