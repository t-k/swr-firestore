# Prototype pollution primitive in setByPath/getByPath

- Date: 2026-06-11
- Severity: major
- Type: security
- Affected: `src/util/path.ts:7-22` (used by `src/util/getConverter.ts:13` and `src/server/util/getConverter.ts:13`)
- Found by: project review (2026-06-11; PoC confirmed)
- Related: 010, 024

## Problem

`setByPath` walks `path.split(".")` without guarding special segments. For an intermediate segment `"__proto__"`, `current["__proto__"]` resolves to `Object.prototype` (non-null object, so the `== null` guard at `src/util/path.ts:15` does not replace it), the loop walks into it, and the final assignment writes onto `Object.prototype`.

PoC (confirmed against the repo's source):

```js
setByPath({}, "__proto__.polluted", "yes");
({}).polluted; // => "yes"  — global Object.prototype pollution
```

The `path` argument is the `parseDates` field selector. In typical usage it is developer-supplied configuration, so this is not directly attacker-reachable — but a published library must not hand consumers a global-pollution primitive. Any app that derives `parseDates` (or future path-based options) from user input, CMS data, or query strings becomes vulnerable.

## Impact

`Object.prototype` pollution can break unrelated code, bypass security checks (`if (obj.isAdmin)` patterns), and enable gadget-chain exploits in dependencies. Severity is tempered only by `parseDates` usually being static.

## Suggested fix

Reject or skip unsafe segments in both helpers, e.g.:

```ts
const UNSAFE = new Set(["__proto__", "constructor", "prototype"]);
// in setByPath loops and the final assignment: if (UNSAFE.has(key)) return obj; // or throw
```

Additionally, only traverse own properties in `getByPath` (`Object.hasOwn`) so prototype members cannot be read through the helper.

## Suggested tests

- `setByPath({}, "__proto__.x", 1)` and `setByPath({}, "constructor.prototype.y", 1)` do not modify `Object.prototype`.
- `getByPath({}, "__proto__")` returns `undefined`.
- A converter-level test: `parseDates: ["__proto__.toDate"]` cannot pollute `Object.prototype` through `getFirestoreConverter`.
