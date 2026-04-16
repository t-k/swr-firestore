/// <reference types="vite/client" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    minify: false,
    lib: {
      entry: {
        index: resolve("src", "index.ts"),
        subscription: resolve("src", "subscription.ts"),
        aggregate: resolve("src", "aggregate.ts"),
        server: resolve("src", "server", "index.ts"),
        module: resolve("src", "module", "index.ts"),
        "module/subscription": resolve("src", "module", "subscription.ts"),
        "module/query": resolve("src", "module", "query.ts"),
        "module/server": resolve("src", "module", "server", "index.ts"),
      },
      name: "SwrFirestore",
      fileName: (format, entryName) => {
        const ext = format === "cjs" ? "umd.cjs" : "js";
        if (entryName === "server") return `server/index.${ext}`;
        if (entryName === "module") return `module/index.${ext}`;
        if (entryName === "module/server") return `module/server/index.${ext}`;
        return `${entryName}.${ext}`;
      },
    },
    rolldownOptions: {
      input: {
        index: resolve(import.meta.dirname, "src/index.ts"),
        subscription: resolve(import.meta.dirname, "src/subscription.ts"),
        aggregate: resolve(import.meta.dirname, "src/aggregate.ts"),
        server: resolve(import.meta.dirname, "src/server/index.ts"),
        module: resolve(import.meta.dirname, "src/module/index.ts"),
        "module/subscription": resolve(import.meta.dirname, "src/module/subscription.ts"),
        "module/query": resolve(import.meta.dirname, "src/module/query.ts"),
        "module/server": resolve(import.meta.dirname, "src/module/server/index.ts"),
      },
      external: [
        "firebase",
        "firebase/firestore",
        "react",
        "react-dom",
        "swr",
        "swr/subscription",
        "firebase-admin/firestore",
      ],
      output: {
        globals: {
          "firebase/firestore": "firestore",
          react: "React",
          "react-dom": "ReactDOM",
          swr: "useSWR",
          "swr/subscription": "useSWRSubscription",
          "firebase-admin/firestore": "firestore",
        },
      },
    },
  },
});
