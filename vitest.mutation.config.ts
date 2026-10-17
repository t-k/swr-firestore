import { defineConfig } from "vitest/config";
import base from "./vitest.config";

export default defineConfig({
  ...base,
  test: {
    ...base.test,
    environment: "node",
    include: [
      "tests/util/path.test.ts",
      "tests/util/databaseId.test.ts",
      "tests/util/buildAggregateSpec.test.ts",
      "tests/module/mutationTargets.test.ts",
      "tests/module/query.test.ts",
      "tests/module/useGetDocsKey.test.ts",
    ],
    coverage: {
      ...base.test?.coverage,
      reportsDirectory: "coverage/mutation",
      include: [
        "src/util/{path,databaseId,buildAggregateSpec}.ts",
        "src/module/util/{normalizeKeyParams,materializeConstraint}.ts",
      ],
    },
  },
});
