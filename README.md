# swr-firestore

React Hooks library for Firestore, built using the Firebase v9 modular SDK. It utilizes the [`useSWRSubscription`](https://swr.vercel.app/ja/docs/subscription) function from SWR library to enable subscription-based data fetching and caching.

## Usage

```tsx
import { useCollection, useCollectionCount } from "@t-k/swr-firestore";
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
          path: "Posts",
          where: [["status", "==", "published"]],
          orderBy: [["createdAt", "desc"]],
          parseDates: ["createdAt"],
        }
      : null
  );
  const { data: postCount } = useCollectionCount<Post>({
    path: "Posts",
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

## API

### Type definitions for parameters

```ts
import type { orderBy, where } from "firebase/firestore";
// First argument of hook, specifies options to firestore, and is also used as a key for SWR.
type KeyParams<T> = {
  // The path to the collection or document of Firestore.
  path: string;
  where?: [Extract<keyof T, string>, Parameters<typeof where>[1], ValueOf<T>][];
  orderBy?: [Extract<keyof T, string>, Parameters<typeof orderBy>[1]][];
  limit?: number;
  // Array of field names that should be parsed as dates.
  parseDates?: Extract<keyof T, string>[];
};
```

### Type definitions for return data

```ts
import type { QueryDocumentSnapshot } from "firebase/firestore";

type DocumentData<T> = T & Pick<QueryDocumentSnapshot, "exists" | "id" | "ref">;
```

### `useCollection(params)`

Subscription for collection

#### Parameters

- `params`: KeyParams | null

#### Return values

- `data`: data for given path's collection
- `error`: FirestoreError | Error

```ts
import { useCollection } from "@t-k/swr-firestore";

const { data, error } = useCollection<Post>({
  path: "Posts",
});
```

### `useCollectionCount(params, swrOptions)`

Wrapper for getCountFromServer for collection

#### Parameters

- `params`: KeyParams except `orderBy`, `parseDates` | null
- `swrOptions`: [Options for SWR hook](https://swr.vercel.app/docs/api#options) except `fetcher`

#### Return values

Returns [`SWRResponse`](https://swr.vercel.app/docs/api#return-values)

- `data`: number for given path's collection count result
- `error`: FirestoreError | Error
- `isLoading`: if there's an ongoing request and no "loaded data". Fallback data and previous data are not considered "loaded data"
- `isValidating`: if there's a request or revalidation loading
- `mutate(data?, options?)`: function to mutate the cached data (details)

```ts
import { useCollectionCount } from "@t-k/swr-firestore";

const {
  data: postCount,
  error,
  isLoading,
} = useCollectionCount<Post>({
  path: "Posts",
});
```

### `useCollectionGroup(params)`

Subscription for collectionGroup

#### Parameters

- `params`: KeyParams | null

#### Return values

- `data`: data for given path's collectionGroup
- `error`: FirestoreError | Error

### `useCollectionGroupCount(params, swrOptions)`

Wrapper for getCountFromServer for collectionGroup

#### Parameters

- `params`: KeyParams except `orderBy`, `parseDates` | null
- `swrOptions`: [Options for SWR hook](https://swr.vercel.app/docs/api#options) except `fetcher`

#### Return values

Returns [`SWRResponse`](https://swr.vercel.app/docs/api#return-values)

- `data`: number for given path's collectionGroup count result
- `error`: FirestoreError | Error
- `isLoading`: if there's an ongoing request and no "loaded data". Fallback data and previous data are not considered "loaded data"
- `isValidating`: if there's a request or revalidation loading
- `mutate(data?, options?)`: function to mutate the cached data (details)

### `useDoc(params)`

Subscription for document

#### Parameters

- `params`: KeyParams except `where`, `orderBy`, `limit` | null

#### Return values

- `data`: data for given path's document
- `error`: FirestoreError | Error

```ts
import { useDoc } from "@t-k/swr-firestore";

const { data, error } = useDoc<Post>({
  path: `Posts/${postId}`,
});
```

## Testing

Before running the test, you need to install the [Firebase tools](https://firebase.google.com/docs/cli).

```bash
npm run test:ci
```

## License

MIT
