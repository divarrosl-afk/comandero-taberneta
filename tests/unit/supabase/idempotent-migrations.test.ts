import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(process.cwd(), "supabase");

describe("migraciones idempotentes", () => {
  it("schema.sql usa IF NOT EXISTS y ct_ensure_trigger", () => {
    const sql = fs.readFileSync(path.join(ROOT, "schema.sql"), "utf8");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS restaurantes");
    expect(sql).toContain("ct_ensure_trigger(");
    expect(sql).toContain("DROP POLICY IF EXISTS");
    expect(sql).toContain("ct_ensure_publication_table(");
  });

  it("print_jobs migration es idempotente", () => {
    const sql = fs.readFileSync(
      path.join(ROOT, "migrations", "20250704_print_jobs.sql"),
      "utf8",
    );
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS print_jobs");
    expect(sql).toContain("ct_ensure_trigger(");
    expect(sql).toContain("DROP POLICY IF EXISTS print_jobs_insert");
  });

  it("config_impresora migration es idempotente", () => {
    const sql = fs.readFileSync(
      path.join(ROOT, "migrations", "20250630_config_impresora.sql"),
      "utf8",
    );
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS config_impresora");
    expect(sql).not.toMatch(/^CREATE TRIGGER/m);
    expect(sql).toContain("ct_ensure_trigger(");
  });
});
