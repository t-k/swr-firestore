/// <reference types="vite/client" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

const entry = {
  index: resolve("src", "index.ts"),
  subscription: resolve("src", "subscription.ts"),
  aggregate: resolve("src", "aggregate.ts"),
  server: resolve("src", "server", "index.ts"),
  module: resolve("src", "module", "index.ts"),
  "module/aggregate": resolve("src", "module", "aggregate.ts"),
  "module/subscription": resolve("src", "module", "subscription.ts"),
  "module/query": resolve("src", "module", "query.ts"),
  "module/server": resolve("src", "module", "server", "index.ts"),
};

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    minify: false,
    lib: {
      entry,
      fileName: (format, entryName) => {
        const ext = format === "cjs" ? "cjs" : "js";
        if (entryName === "server") return `server/index.${ext}`;
        if (entryName === "module") return `module/index.${ext}`;
        if (entryName === "module/server") return `module/server/index.${ext}`;
        return `${entryName}.${ext}`;
      },
    },
    rolldownOptions: {
      input: entry,
      external: [
        "firebase",
        "firebase/firestore",
        "react",
        "react-dom",
        "swr",
        "swr/subscription",
        "firebase-admin/firestore",
      ],
    },
  },
});
