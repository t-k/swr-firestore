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
    environment: "jsdom",
    coverage: {
      all: true,
      provider: "c8",
      reporter: ["text", "json", "html"],
      src: ["src"],
      exclude: ["src/util/type.ts", "tests/**"],
    },
    includeSource: ["src/**/*.{ts,tsx}", "tests/**/*.{ts}"],
    include: [
      "**/*.{test,spec}.{js,ts,jsx,tsx}",
      "./tests/**/*.{test,spec}.{js,ts,jsx,tsx}",
    ],
    exclude: ["**/node_modules/**"],
    setupFiles: ["tests/setup.ts"],
    testTimeout: 50000,
  },
});
