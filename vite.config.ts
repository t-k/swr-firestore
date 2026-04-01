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
      entry: [
        resolve("src", "index.ts"),
        resolve("src", "subscription.ts"),
        resolve("src", "aggregate.ts"),
        resolve("src", "server"),
      ],
      name: "SwrFirestore",
      fileName: (format, entryName) => {
        const ext = format === "cjs" ? "umd.cjs" : "js";
        if (entryName === "server") return `server/index.${ext}`;
        return `${entryName}.${ext}`;
      },
    },
    rolldownOptions: {
      input: {
        index: resolve(import.meta.dirname, "src/index.ts"),
        subscription: resolve(import.meta.dirname, "src/subscription.ts"),
        aggregate: resolve(import.meta.dirname, "src/aggregate.ts"),
        server: resolve(import.meta.dirname, "src/server/index.ts"),
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
