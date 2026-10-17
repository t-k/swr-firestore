import { test } from "node:test";
import assert from "node:assert/strict";
import { compareResults } from "./rules-compare.mjs";

test("rejects a shared baseline bug", () => {
  const results = {
    baseline: [{ id: "read", outcome: "denied" }],
    mutant: [{ id: "read", outcome: "allowed" }],
  };
  assert.throws(
    () => compareResults(results, results, [{ id: "read", allowed: true }]),
    /baseline/,
  );
});

test("rejects a surviving mutant", () => {
  const results = {
    baseline: [{ id: "read", outcome: "allowed" }],
    mutant: [{ id: "read", outcome: "allowed" }],
  };
  assert.throws(
    () => compareResults(results, results, [{ id: "read", allowed: true }]),
    /survived/,
  );
});

test("rejects an engine mismatch", () => {
  const official = {
    baseline: [{ id: "read", outcome: "allowed" }],
    mutant: [{ id: "read", outcome: "denied" }],
  };
  assert.throws(
    () => compareResults(official, { ...official, mutant: [] }, [{ id: "read", allowed: true }]),
    /mismatch/,
  );
});

test("records witnesses for a killed mutant", () => {
  const results = {
    baseline: [{ id: "read", outcome: "allowed" }],
    mutant: [{ id: "read", outcome: "denied" }],
  };
  assert.deepEqual(compareResults(results, results, [{ id: "read", allowed: true }]), [
    { id: "mutant", witnesses: ["read"] },
  ]);
});

test("rejects missing cases even when both engines agree", () => {
  const results = { baseline: [{ id: "read", outcome: "allowed" }], mutant: [] };
  assert.throws(
    () => compareResults(results, results, [{ id: "read", allowed: true }]),
    /Incomplete/,
  );
});

test("rejects runs without mutants", () => {
  const results = { baseline: [{ id: "read", outcome: "allowed" }] };
  assert.throws(
    () => compareResults(results, results, [{ id: "read", allowed: true }]),
    /No mutants/,
  );
});
