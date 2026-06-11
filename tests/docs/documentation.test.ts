import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("documentation safety notes", () => {
  it("documents that server fetchers bypass Firestore Security Rules", () => {
    const readme = readFileSync("README.md", "utf8");
    const moduleReadme = readFileSync("README.module.md", "utf8");

    expect(readme).toContain("Firestore Security Rules");
    expect(readme).toContain("firebase-admin");
    expect(moduleReadme).toContain("Firestore Security Rules");
    expect(moduleReadme).toContain("firebase-admin");
  });

  it("documents Java 21 as a local test prerequisite", () => {
    const readme = readFileSync("README.md", "utf8");

    expect(readme).toContain("JDK 21");
  });

  it("marks emulator rules as test-only", () => {
    const rules = readFileSync("firestore.test.rules", "utf8");

    expect(rules).toContain("TEST EMULATOR RULES ONLY");
  });
});
