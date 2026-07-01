import { describe, expect, it } from "vitest";
import { mergeOperativa } from "@/lib/sync/merge-operativa";

type Item = { id: string; creadaEn: string; label: string };

describe("mergeOperativa", () => {
  it("une remoto y pendientes sin duplicar por id (gana remoto)", () => {
    const remoto: Item[] = [
      { id: "a", creadaEn: "2025-01-01T10:00:00Z", label: "remoto-a" },
    ];
    const pendientes: Item[] = [
      { id: "a", creadaEn: "2025-01-01T09:00:00Z", label: "local-a" },
      { id: "b", creadaEn: "2025-01-01T11:00:00Z", label: "local-b" },
    ];
    const merged = mergeOperativa(remoto, pendientes);
    expect(merged).toHaveLength(2);
    expect(merged.find((x) => x.id === "a")?.label).toBe("remoto-a");
    expect(merged.find((x) => x.id === "b")?.label).toBe("local-b");
  });

  it("ordena por creadaEn descendente", () => {
    const merged = mergeOperativa(
      [{ id: "1", creadaEn: "2025-01-01T08:00:00Z", label: "r" }],
      [{ id: "2", creadaEn: "2025-01-01T12:00:00Z", label: "p" }],
    );
    expect(merged[0].id).toBe("2");
    expect(merged[1].id).toBe("1");
  });
});
