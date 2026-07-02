import { describe, expect, it } from "vitest";
import { sanitizeLogMessage } from "../../../scripts/ci/sanitize.mjs";

describe("sanitizeLogMessage", () => {
  it("enmascara URI postgres", () => {
    const msg = "connect failed postgresql://postgres:secret@host:5432/db";
    expect(sanitizeLogMessage(msg)).toBe(
      "connect failed postgresql://***",
    );
  });

  it("enmascara JWT y publishable keys", () => {
    const msg =
      "key eyJhbGciOiJIUzI1NiJ9.abc.def sb_publishable_foo_bar";
    const out = sanitizeLogMessage(msg);
    expect(out).not.toContain("eyJhbGci");
    expect(out).not.toContain("sb_publishable_foo");
  });
});
