# Client converter drops SnapshotOptions: pending serverTimestamp() arrives as null

- Date: 2026-06-11
- Severity: minor
- Type: bug
- Affected: `src/util/getConverter.ts:20-21`
- Found by: project review (2026-06-11)

## Problem

`fromFirestore(snapshot)` ignores the second `SnapshotOptions` argument that the client SDK passes, and calls `snapshot.data()` with defaults (`serverTimestamps: "none"`):

```ts
fromFirestore(snapshot: QueryDocumentSnapshot) {
  const data = snapshot.data();   // options dropped
```

With latency compensation, a locally written `serverTimestamp()` field is delivered as `null` in the immediate snapshot after a write. The README's own pattern (`x.createdAt.toLocaleString()`) throws on the writer's own screen until the server ack arrives. Consumers also have no way to opt into `estimate`/`previous`.

## Suggested fix

Forward the options: `fromFirestore(snapshot, options)` → `snapshot.data(options)`. Optionally expose a `serverTimestamps` param on the hooks so consumers can choose `"estimate"` (note: if it is added to params it must be excluded from SWR keys or included consistently client/server — see the key-parity issues).

## Suggested tests

- "a document written with serverTimestamp() exposes an estimated date in the immediate snapshot when serverTimestamps is estimate".
