import { describe, expect, it } from "vitest";

import * as moduleFetcher from "../../src/module/fetcher";

describe("module fetcher barrel", () => {
  it("does not expose fetchDocInTx", () => {
    expect("fetchDocInTx" in moduleFetcher).toBe(false);
  });
});
