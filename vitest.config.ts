/// <reference types="vitest" />
/// <reference types="vite/client" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  define: {
    "import.meta.vitest": false,
  },
  test: {
    globals: true,
    isolate: true,
    minWorkers: 1,
    maxWorkers: 1,
    environment: "jsdom",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/util/type.ts",
        "src/server/util/type.ts",
        "tests/**",
        "vite.config.ts",
        "vitest.config.ts",
      ],
    },
    includeSource: ["src/**/*.{ts,tsx}", "tests/**/*.{ts}"],
    include: ["**/*.{test,spec}.{js,ts,jsx,tsx}", "./tests/**/*.{test,spec}.{js,ts,jsx,tsx}"],
    exclude: ["**/node_modules/**", ".worktrees/**"],
    setupFiles: ["tests/setup.ts"],
    testTimeout: 50000,
    env: {
      NODE_ENV: "test",
      FIREBASE_AUTH_EMULATOR_HOST: "localhost:9099",
      FIRESTORE_EMULATOR_HOST: "localhost:8080",
      GCLOUD_PROJECT: "swr-firestore-project",
    },
  },
});
