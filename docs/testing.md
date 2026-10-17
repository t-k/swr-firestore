# Testing

Install dependencies with `pnpm install --frozen-lockfile`. Use a supported Node.js version (Node 20.19+, 22.12+, or 24) for the Vite-based test suite. CI uses Node 20, 22, and 24 for integration tests and Node 24 for mutation and compatibility tests.

## Integration tests

`pnpm test:ci` starts the pinned [fireemu](https://github.com/t-k/fireemu) runtime, runs all Vitest tests with coverage, and shuts it down. Java is not required. `fireemu.json` selects the `strict` profile and reuses the rules, indexes, and other settings from `firebase.json`. The required query indexes are declared in `firestore.indexes.test.json`; missing-index checks remain enabled. Test runs use dynamically assigned Firestore ports; both client and Admin SDK tests consume `FIRESTORE_EMULATOR_HOST`.

`pnpm test:official` runs the same suite against the official Firestore emulator using the pinned local Firebase CLI. This requires Java 21 and port 8080. Only Firestore is started because this library's tests do not use Auth or Storage emulators. The compatibility CI job runs this suite independently of the fireemu matrix.

`pnpm emulator` starts an interactive fireemu session on the configured port. Stop it with Ctrl-C after use.

When running multiple coverage commands in one checkout, set `COVERAGE_REPORTS_DIRECTORY` to independent sibling directories, such as `docs.local/coverage-node20` and `docs.local/coverage-node24`. A coverage run cleans its output directory recursively; do not run a parent output directory concurrently with its descendants.

## TypeScript mutation tests

`pnpm test:mutation` runs [StrykerJS](https://stryker-mutator.io/docs/stryker-js/vitest-runner/) with the Vitest runner. The default scope is five implementation files: `src/util/path.ts`, `src/util/databaseId.ts`, `src/util/buildAggregateSpec.ts`, `src/module/util/normalizeKeyParams.ts`, and `src/module/util/materializeConstraint.ts`. These cover unsafe property paths, database cache identities, aggregate specification construction, and modular query materialization. This is a focused mutation gate, not a whole-library mutation score.

The mutation-specific Vitest configuration runs focused unit tests in Node without an emulator. All five targets have direct unit coverage, so mutants do not repeat the complete SDK integration suite. Stryker runs one worker for reproducible execution. A score below 75 fails the job. HTML and JSON reports are written under `reports/mutation` and uploaded by CI. Surviving mutants remain visible in the reports; equivalent mutants are not automatically excluded. To expand the mutation scope, update `mutate` in `stryker.config.json` and the corresponding test includes in `vitest.mutation.config.ts`. Emulator-backed tests can run through `pnpm exec fireemu exec --only firestore --project swr-firestore-project --firestore-port 0 --hub-port 0 --logging-port 0 -- stryker run`.

## Rules mutation and differential tests

`pnpm test:rules` first tests the comparison harness, then replays the same deterministic corpus against the official emulator and fireemu. Java 21 and port 8080 are required for the official run. Each backend is stopped before starting the next one. Results are written to `reports/rules/{official,fireemu,summary}.json` and uploaded by CI.

The corpus checks every simple read/write match in `firestore.test.rules`, including denied reads, recursive wildcard paths, document reads, collection queries, and writes. A separate restrictive Rules contract exercises anonymous users, owners, strangers, admin claims, filtered and unfiltered queries, create/update/delete, immutable ownership, integer validation, missing fields, and the boundaries 0 and 10.

Ten named Rules mutants change authentication, ownership, public access, boolean conjunction, integer validation, lower and upper bounds, ownership transfer, admin access, and deletion. Each variant runs against freshly cleared data. The harness requires all of the following:

- The baseline agrees with an explicit permission model on each backend.
- Every variant's complete permission vector agrees between backends.
- Every mutant changes at least one baseline permission on the official emulator; the report records its witnesses.
- Repository Rules permissions agree with their declared allow/deny expectations.

Only `permission-denied` counts as a denial. Compilation failures, transport failures, and other SDK errors fail the run. The comparison tests verify that shared baseline errors, surviving mutants, and backend disagreements cannot pass silently.

These checks establish compatibility for the checked corpus and the pinned emulator versions. They do not prove universal equivalence or production Firestore behavior. In particular, the repository's test Rules intentionally allow all writes through a recursive match; mutating only a more specific write rule would be equivalent because matching grants are combined with OR. The restrictive fixture avoids that problem.
