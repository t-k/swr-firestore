# module/server lacks InTx parity and module fetchDocInTx is dead code

- Date: 2026-06-11
- Severity: proposal
- Type: feature parity / dead code
- Affected: `src/module/server/index.ts`, `src/server/index.ts:40-44`, `src/module/fetcher/fetchDocInTx.ts`, `src/module/fetcher/index.ts`
- Found by: project review (2026-06-11)

## Problem

- The legacy server entrypoint exports five transaction variants (`getDocInTx`, `getCollectionInTx`, `getCollectionCountInTx`, `getCollectionGroupInTx`, `getCollectionGroupCountInTx`); `src/module/server/index.ts` exports none. Anyone migrating to the module entrypoint who uses transactions must keep importing the legacy server entry, which blunts the migration story.
- `src/module/fetcher/fetchDocInTx.ts` exists but is excluded from the barrel (`src/module/fetcher/index.ts`), and `tests/module/fetcherBarrel.test.ts` asserts it is not exposed. Coverage shows 0%. It is dead code signaling unfinished work.

## Suggested fix

Decide the intended scope and act:

- If InTx belongs in the module API: port the server InTx variants to `module/server`, export the client `fetchDocInTx`, and add tests mirroring `tests/server/*InTx*`.
- If not: delete `src/module/fetcher/fetchDocInTx.ts` and document that transaction helpers remain on the legacy `/server` entrypoint.
