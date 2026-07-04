import { describe, expect, it } from "vitest";
import { APP_SYNC_EVENT, dispatchAppSync } from "@/lib/sync/app-sync";

describe("app-sync events", () => {
  it("dispara evento global de sincronización", () => {
    let received = false;
    const handler = () => {
      received = true;
    };

    window.addEventListener(APP_SYNC_EVENT, handler);
    dispatchAppSync();
    window.removeEventListener(APP_SYNC_EVENT, handler);

    expect(received).toBe(true);
  });
});
