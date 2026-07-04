import { describe, expect, it } from "vitest";
import {
  estadoPanelToLegacyDbEnum,
  isInvalidEstadoPanelEnumError,
} from "@/lib/supabase/estado-panel-db";

describe("estado-panel-db", () => {
  it("mapea sentados a pendiente (enum legacy)", () => {
    expect(estadoPanelToLegacyDbEnum("sentados")).toBe("pendiente");
  });

  it("detecta error de enum ct_estado_panel", () => {
    expect(
      isInvalidEstadoPanelEnumError(
        'invalid input value for enum ct_estado_panel: "sentados"',
      ),
    ).toBe(true);
    expect(isInvalidEstadoPanelEnumError("duplicate key")).toBe(false);
  });
});
