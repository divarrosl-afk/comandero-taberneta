#!/usr/bin/env node
/**
 * Asegura catálogo por defecto en Supabase vía API Vercel.
 */
import { getVercelConfig } from "./vercel-client.mjs";

const POLL_MS = 8_000;
const MAX_WAIT_MS = 120_000;

async function main() {
  const { productionUrl } = getVercelConfig();
  const url = `${productionUrl.replace(/\/$/, "")}/api/catalogo/ensure`;

  console.log(`→ Catálogo ${url}`);
  const start = Date.now();

  while (Date.now() - start < MAX_WAIT_MS) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
      const data = await res.json();
      console.log(JSON.stringify(data, null, 2));

      if (res.ok && data.productCount > 0) {
        console.log("\n✓ Catálogo listo.");
        process.exit(0);
      }
    } catch {
      console.log("… esperando deploy /api/catalogo/ensure");
    }
    await new Promise((r) => setTimeout(r, POLL_MS));
  }

  console.error("\n✗ Sin platos en catálogo");
  process.exit(1);
}

main().catch((err) => {
  console.error("\n✗", err.message ?? err);
  process.exit(1);
});
