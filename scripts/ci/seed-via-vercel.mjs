#!/usr/bin/env node
/**
 * Ejecuta seed de usuarios vía API en Vercel (usa SUPABASE_SERVICE_ROLE_KEY del servidor).
 */
import { getVercelConfig } from "./vercel-client.mjs";

async function main() {
  const { productionUrl } = getVercelConfig();
  const token = process.env.SETUP_BOOTSTRAP_TOKEN?.trim();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD?.trim();
  const camareroPassword = process.env.SEED_CAMARERO_PASSWORD?.trim();

  if (!adminPassword || !camareroPassword) {
    console.error("Faltan SEED_ADMIN_PASSWORD o SEED_CAMARERO_PASSWORD");
    process.exit(1);
  }

  const url = `${productionUrl.replace(/\/$/, "")}/api/setup/seed`;
  console.log(`→ Seed usuarios en ${url}`);

  const start = Date.now();
  const maxMs = 300_000;

  while (Date.now() - start < maxMs) {
    try {
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({ adminPassword, camareroPassword }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        console.error("✗ 401 — SETUP_BOOTSTRAP_TOKEN no coincide con Vercel. Redeploy tras configure.");
        process.exit(1);
      }

      if (res.status === 404) {
        console.log("… esperando deploy con /api/setup/seed");
        await sleep(12_000);
        continue;
      }

      if (!res.ok) {
        console.error("✗", JSON.stringify(data));
        process.exit(1);
      }

      console.log(JSON.stringify(data, null, 2));
      if (data.userCount >= 4) {
        console.log("\n✓ Usuarios listos para login.");
        process.exit(0);
      }
    } catch {
      console.log("… reintentando seed");
    }
    await sleep(12_000);
  }

  console.error("\n✗ Timeout en seed vía Vercel");
  process.exit(1);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

main().catch((err) => {
  console.error("\n✗", err.message ?? err);
  process.exit(1);
});
