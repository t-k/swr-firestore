/// <reference types="vitest" />
/// <reference types="vite/client" />
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
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
      all: true,
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["src/util/type.ts", "src/server/util/type.ts", "tests/**"],
    },
    includeSource: ["src/**/*.{ts,tsx}", "tests/**/*.{ts}"],
    include: [
      "**/*.{test,spec}.{js,ts,jsx,tsx}",
      "./tests/**/*.{test,spec}.{js,ts,jsx,tsx}",
    ],
    exclude: ["**/node_modules/**"],
    setupFiles: ["tests/setup.ts"],
    testTimeout: 50000,
    env: {
      NODE_ENV: "test",
      FIREBASE_AUTH_EMULATOR_HOST: "localhost:9099",
      FIRESTORE_EMULATOR_HOST: "localhost:8080",
      GCLOUD_PROJECT: "swr-firestore-project",
    }
  },
});
