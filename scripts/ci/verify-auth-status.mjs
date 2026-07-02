#!/usr/bin/env node
/**
 * Comprueba /api/auth/status — usuarios creados para login.
 */
import { getVercelConfig } from "./vercel-client.mjs";

const POLL_MS = 8_000;
const MAX_WAIT_MS = 120_000;

async function main() {
  const { productionUrl } = getVercelConfig();
  const url = `${productionUrl.replace(/\/$/, "")}/api/auth/status`;

  console.log(`→ Comprobando ${url}`);
  const start = Date.now();

  while (Date.now() - start < MAX_WAIT_MS) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      console.log(JSON.stringify(data, null, 2));

      if (data.userCount >= 4 && data.seedRequired === false) {
        console.log("\n✓ Login listo (divarro + camareros).");
        process.exit(0);
      }
    } catch {
      console.log("… esperando usuarios");
    }
    await new Promise((r) => setTimeout(r, POLL_MS));
  }

  console.error("\n✗ Sin usuarios — revisa seed y secretos SEED_*");
  process.exit(1);
}

main().catch((err) => {
  console.error("\n✗", err.message ?? err);
  process.exit(1);
});
