# module/server applyModuleConstraints silently drops unknown constraint types

- Date: 2026-06-11
- Severity: minor
- Type: bug
- Affected: `src/module/server/util/buildQuery.ts:41-42`
- Found by: project review (2026-06-11)

## Problem

The admin-side constraint applier ends with:

```ts
default:
  return current;
```

An unrecognized constraint type is silently ignored, while the client-side materializer would throw (`constraint[MATERIALIZE_CLIENT]()`, `src/module/util/materializeConstraint.ts:10`). A malformed constraint (e.g. revived from JSON with its symbol lost) or a future constraint type added client-side first would drop a `where` on the server, so the SSR fallback silently contains a broader result set than the client query — data that the client's security rules context might never be allowed to read.

## Suggested fix

Throw on unrecognized `type` in the `default` branch, matching client behavior, so the divergence fails loudly during development.

## Suggested tests

- "applyModuleConstraints throws on an unknown constraint type".
