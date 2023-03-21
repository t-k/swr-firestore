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
      entry: resolve("src", "index.ts"),
      name: "SwrFirestore",
      fileName: "index",
    },
    rollupOptions: {
      external: ["react", "react-dom", "firebase", "firebase/firestore"],
      output: {
        globals: {
          "firebase/firestore": "firestore",
          react: "React",
          "react-dom": "ReactDOM",
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
