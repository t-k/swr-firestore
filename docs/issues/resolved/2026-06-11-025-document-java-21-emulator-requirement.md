# Document the Java 21+ requirement for running tests locally

- Date: 2026-06-11
- Severity: proposal
- Type: docs / DX
- Affected: `README.md` (development section), possibly a CONTRIBUTING file
- Found by: project review (2026-06-11; reproduced locally)

## Problem

`pnpm run test:ci` aborts on machines with Java < 21:

```
Error: firebase-tools no longer supports Java version before 21.
Please install a JDK at version 21 or above to get a compatible runtime.
```

Reproduced locally with OpenJDK 17 (Ubuntu default). CI is unaffected because both workflows install Temurin 21 explicitly (`.github/workflows/test.yaml:39-43`, `publish.yml:16-20`), but nothing in the repository tells a contributor about the JDK requirement — `grep -in "java" README.md README.module.md` returns nothing.

## Suggested fix

Add a short "Development" note to README.md (or a CONTRIBUTING.md): running the emulator-backed test suite requires a JDK 21+ and the firebase-tools CLI; include the one-liner install hint for common platforms.
