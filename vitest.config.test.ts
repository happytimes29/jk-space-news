import { describe, expect, it } from "vitest";

import { vitestExcludes } from "./tests/vitest-boundaries";

describe("Vitest discovery boundaries", () => {
  it("does not collect tests from nested Git worktrees", () => {
    expect(vitestExcludes).toContain("**/.worktrees/**");
  });
});
