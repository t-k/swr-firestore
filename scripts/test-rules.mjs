import { spawn } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { cases, variants } from "./rules-contract.mjs";
import { compareResults } from "./rules-compare.mjs";

const directory = resolve("reports/rules");
await mkdir(directory, { recursive: true });
for (const name of ["official", "fireemu", "summary"]) {
  await rm(resolve(directory, `${name}.json`), { force: true });
}
const shellQuote = (value) => "'" + value.replaceAll("'", "'\\''") + "'";
async function run(command, args) {
  const child = spawn(command, args, { stdio: "inherit" });
  let interrupted;
  const forward = (signal) => {
    interrupted = signal;
    child.kill(signal);
  };
  const int = () => forward("SIGINT");
  const term = () => forward("SIGTERM");
  process.on("SIGINT", int);
  process.on("SIGTERM", term);
  try {
    await new Promise((resolve, reject) => {
      child.once("error", reject);
      child.once("exit", (code, signal) =>
        code === 0 && !interrupted
          ? resolve()
          : reject(new Error(`${command} failed: ${interrupted ?? code ?? signal}`)),
      );
    });
  } finally {
    process.off("SIGINT", int);
    process.off("SIGTERM", term);
  }
}
for (const backend of ["official", "fireemu"]) {
  const output = resolve(directory, `${backend}.json`);
  await rm(output, { force: true });
  if (backend === "official") {
    await run("pnpm", [
      "exec",
      "firebase",
      "emulators:exec",
      "--project",
      "swr-firestore-project",
      "--only",
      "firestore",
      `node scripts/rules-worker.mjs official ${shellQuote(output)}`,
    ]);
  } else {
    await run("pnpm", [
      "exec",
      "fireemu",
      "exec",
      "--project",
      "swr-firestore-project",
      "--only",
      "firestore",
      "--firestore-port",
      "0",
      "--hub-port",
      "0",
      "--logging-port",
      "0",
      "--",
      "node",
      "scripts/rules-worker.mjs",
      "fireemu",
      output,
    ]);
  }
}
const official = JSON.parse(await readFile(resolve(directory, "official.json"), "utf8"));
const fireemu = JSON.parse(await readFile(resolve(directory, "fireemu.json"), "utf8"));
const killed = compareResults(official, fireemu, cases);
if (killed.length !== variants.length - 1) throw new Error("Missing mutation results");
await writeFile(
  resolve(directory, "summary.json"),
  JSON.stringify(
    {
      cases: cases.length,
      repositoryPaths: official.repository.length,
      mutants: killed.length,
      killed,
    },
    null,
    2,
  ),
);
console.log(
  `Rules differential passed: ${cases.length} cases × ${variants.length} variants + ${official.repository.length} repository paths per engine; ${killed.length}/${variants.length - 1} mutants killed.`,
);
