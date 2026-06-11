# Subscription errors are terminal and the recovery path is undocumented

- Date: 2026-06-11
- Severity: minor
- Type: docs / behavior
- Affected: `src/hooks/useCollection.ts:34-36`, `src/hooks/useDoc.ts`, `src/hooks/useCollectionGroup.ts:76-78`, module subscription hooks, `README.md`
- Found by: project review (2026-06-11)

## Problem

When `onSnapshot` reports an error, the hooks forward it via `next(error)`. Firestore cancels the listener after the error callback, and `swr/subscription` only re-invokes `subscribe` when the key's ref count drops to 0 and a new subscriber appears. Consequently a transient error — most commonly `permission-denied` because auth state was not ready yet at mount — leaves a dead listener and a sticky error for as long as any component holds the key.

The practical escape hatch is conditional fetching (`useDoc(user ? { path } : null)` so the key changes/unmounts), but the README does not state that subscription errors are unrecoverable in place, nor that auth-gated data must use conditional params.

## Suggested fix

- Document the behavior: subscription errors are terminal for the mounted key; gate params on auth readiness (`params || null` pattern) to recover.
- Optionally consider re-subscribing on error with backoff as a feature (more invasive; evaluate against SWR's subscription model before attempting).

## Suggested tests

- "a permission-denied subscription recovers after params switch from null to a valid value" (documents the recommended pattern).
