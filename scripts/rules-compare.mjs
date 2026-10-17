import assert from "node:assert/strict";

export function compareResults(official, fireemu, cases) {
  assert.deepEqual(fireemu, official, "Engine mismatch");
  const expected = cases.map(({ id, allowed }) => ({
    id,
    outcome: allowed ? "allowed" : "denied",
  }));
  assert.deepEqual(official.baseline, expected, "Unexpected baseline permissions");
  const killed = [];
  for (const [id, results] of Object.entries(official)) {
    if (id === "baseline" || id === "repository") continue;
    assert.deepEqual(
      results.map((result) => result.id),
      expected.map((result) => result.id),
      `Incomplete mutant: ${id}`,
    );
    const witnesses = results.filter((result, index) => result.outcome !== expected[index].outcome);
    assert.ok(witnesses.length > 0, `Mutant survived: ${id}`);
    killed.push({ id, witnesses: witnesses.map((result) => result.id) });
  }
  assert.ok(killed.length > 0, "No mutants executed");
  return killed;
}
