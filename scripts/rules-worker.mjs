import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { initializeTestEnvironment } from "@firebase/rules-unit-testing";
import { cases, variants } from "./rules-contract.mjs";

const [host, port] = process.env.FIRESTORE_EMULATOR_HOST.split(":");
const projectId = "swr-firestore-project";
let env;
async function outcome(operation) {
  try {
    await operation();
    return "allowed";
  } catch (error) {
    if (error.code === "permission-denied") return "denied";
    throw error;
  }
}
async function install(rules) {
  if (env) await env.cleanup();
  env = await initializeTestEnvironment({
    projectId,
    firestore: { host, port: Number(port), rules },
  });
}
const results = {};
try {
  for (const variant of variants) {
    await install(variant.rules);
    results[variant.id] = [];
    for (const scenario of cases) {
      await env.clearFirestore();
      await env.withSecurityRulesDisabled(async (context) => {
        await context.firestore().doc("items/existing").set({ owner: "alice", score: 5 });
      });
      const context =
        scenario.actor === null
          ? env.unauthenticatedContext()
          : env.authenticatedContext(scenario.actor, { admin: scenario.actor === "admin" });
      const db = context.firestore();
      const doc = db.doc("items/existing");
      const operations = {
        get: () => doc.get(),
        list: () => db.collection("items").get(),
        "list-own": () => db.collection("items").where("owner", "==", scenario.actor).get(),
        create: () => db.doc("items/new").set(scenario.data),
        update: () => doc.update(scenario.data),
        delete: () => doc.delete(),
      };
      const result = await outcome(operations[scenario.op]);
      if (variant.id === "baseline")
        assert.equal(result, scenario.allowed ? "allowed" : "denied", scenario.id);
      results[variant.id].push({ id: scenario.id, outcome: result });
    }
    console.log(`${process.argv[2]}: ${variant.id}: ${cases.length} cases`);
  }

  const repositoryRules = await readFile(
    new URL("../firestore.test.rules", import.meta.url),
    "utf8",
  );
  await install(repositoryRules);
  results.repository = [];
  const matches = [
    ...repositoryRules.matchAll(
      /match \/(\S+) \{\s*allow read: if (true|false);\s*allow write: if true;/g,
    ),
  ];
  assert.ok(matches.length > 30, "Repository rules were not enumerated");
  assert.equal(
    matches.length,
    [...repositoryRules.matchAll(/\ballow read:/g)].length,
    "Unsupported repository rule shape; extend the corpus before proceeding",
  );
  for (const [, pattern, readable] of matches) {
    const path = pattern
      .trim()
      .replaceAll(/\{[^}=]+=\*\*\}/g, "parent/root")
      .replaceAll(/\{[^}]+\}/g, "example");
    const docPath = path === "parent/root" ? "Unlisted/example" : path;
    const db = env.unauthenticatedContext().firestore();
    const doc = db.doc(docPath);
    assert.equal(await outcome(() => doc.set({ value: 1 })), "allowed", `${docPath}: write`);
    const get = await outcome(() => doc.get());
    assert.equal(get, readable === "true" ? "allowed" : "denied", `${docPath}: get`);
    const list = await outcome(() => doc.parent.get());
    assert.equal(list, readable === "true" ? "allowed" : "denied", `${docPath}: list`);
    results.repository.push({ id: docPath, get, list, write: "allowed" });
  }
  await writeFile(process.argv[3], JSON.stringify(results, null, 2));
} finally {
  await env?.cleanup();
}
