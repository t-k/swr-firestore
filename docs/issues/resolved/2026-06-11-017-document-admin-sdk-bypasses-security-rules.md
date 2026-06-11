# Document that server fetchers bypass Firestore Security Rules

- Date: 2026-06-11
- Severity: minor
- Type: docs / security
- Affected: `README.md`, `README.module.md`, `firestore.test.rules`
- Found by: project review (2026-06-11)

## Problem

`grep -ci "security rules" README.md README.module.md` returns 0 for both files. The `/server` and `/module/server` entrypoints use firebase-admin, which runs with full privileges and ignores Firestore Security Rules entirely — but neither README says so. README.module.md documents the server fetchers simply as "server fetchers for SSR/SSG".

Consumers who prefetch with these helpers and pass the result as `fallbackData` can unknowingly serve documents to users that the client-side rules would never let them read (until revalidation replaces the data — or permanently, for non-revalidating configs).

## Suggested fix

- Add an explicit callout to both READMEs: server fetchers use firebase-admin and bypass all Security Rules; never import `/server` or `/module/server` into client bundles; enforce authorization in your own server code before passing data to `fallbackData`.
- Add a note that the `path` param should not be built from untrusted input (Firestore validates path syntax, but arbitrary collection targeting remains the consumer's responsibility).
- Add a header comment to `firestore.test.rules` ("TEST EMULATOR RULES ONLY - DO NOT DEPLOY"): it currently contains `allow read, write: if true` blocks that would be dangerous if copy-pasted.

## Suggested tests

- Optional docs-contract test: assert README.module.md contains a Security Rules warning substring so the safety note cannot silently regress.
