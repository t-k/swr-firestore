/// <reference types="vite/client" />
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { typescriptPaths } from "rollup-plugin-typescript-paths";
import typescript from "@rollup/plugin-typescript";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  build: {
    manifest: true,
    minify: false,
    lib: {
      entry: [resolve("src", "index.ts"), resolve("src", "server")],
      name: "SwrFirestore",
      fileName: (format, entryName) => {
        const ext = format === "cjs" ? "umd.cjs" : "js";
        return entryName === "server"
          ? `server/index.${ext}`
          : `${entryName}.${ext}`;
      },
    },
    rollupOptions: {
      input: {
        index: resolve(__dirname, "src/index.ts"),
        server: resolve(__dirname, "src/server/index.ts"),
      },
      external: [
        "firebase",
        "firebase/firestore",
        "lodash-es",
        "react",
        "react-dom",
        "swr",
        "swr/subscription",
        "firebase-admin/firestore",
        "lodash/get.js",
        "lodash/fp/set.js",
      ],
      output: {
        globals: {
          "firebase/firestore": "firestore",
          "lodash-es": "lodashEs",
          react: "React",
          "react-dom": "ReactDOM",
          swr: "useSWR",
          "swr/subscription": "useSWRSubscription",
          "firebase-admin/firestore": "firestore",
          "lodash/get.js": "get$2",
          "lodash/fp/set.js": "set",
        },
      },
      plugins: [
        typescriptPaths({
          preserveExtensions: true,
        }),
        typescript({
          sourceMap: false,
          declaration: true,
          outDir: "dist",
        }),
      ],
    },
  },
});
