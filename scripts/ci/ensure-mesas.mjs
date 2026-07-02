#!/usr/bin/env node
import { getVercelConfig } from "./vercel-client.mjs";

const POLL_MS = 8_000;
const MAX_WAIT_MS = 120_000;

async function main() {
  const { productionUrl } = getVercelConfig();
  const url = `${productionUrl.replace(/\/$/, "")}/api/mesas/ensure`;

  console.log(`→ Mesas ${url}`);
  const start = Date.now();

  while (Date.now() - start < MAX_WAIT_MS) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
      const data = await res.json();
      console.log(JSON.stringify(data, null, 2));

      if (res.ok && data.mesaCount > 0) {
        console.log("\n✓ Mesas listas.");
        process.exit(0);
      }
    } catch {
      console.log("… esperando deploy /api/mesas/ensure");
    }
    await new Promise((r) => setTimeout(r, POLL_MS));
  }

  console.error("\n✗ Sin mesas");
  process.exit(1);
}

main().catch((err) => {
  console.error("\n✗", err.message ?? err);
  process.exit(1);
});
