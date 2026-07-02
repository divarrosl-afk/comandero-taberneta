#!/usr/bin/env node
/**
 * Comprueba /api/print-jobs/health en producción.
 * Solo imprime campos públicos de diagnóstico (sin secretos).
 */
import { getVercelConfig } from "./vercel-client.mjs";

const POLL_MS = 12_000;
const MAX_WAIT_MS = Number(process.env.HEALTH_MAX_WAIT_MS ?? 300_000);

function publicHealthSummary(data) {
  return {
    ok: data.ok,
    runtime: data.runtime,
    supabase: {
      publicEnvOk: data.supabase?.publicEnvOk,
      missing: data.supabase?.missing ?? [],
      restauranteId: data.supabase?.restauranteId,
      serviceRoleConfigured: data.supabase?.serviceRoleConfigured,
    },
    printJobs: {
      tableExists: data.printJobs?.tableExists,
      tableError: data.printJobs?.tableError,
      pendingCount: data.printJobs?.pendingCount,
    },
  };
}

async function fetchHealth(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}

async function main() {
  const { productionUrl } = getVercelConfig();
  const healthUrl = `${productionUrl.replace(/\/$/, "")}/api/print-jobs/health`;

  console.log(`→ Comprobando ${healthUrl}`);
  const start = Date.now();

  while (Date.now() - start < MAX_WAIT_MS) {
    try {
      const data = await fetchHealth(healthUrl);
      const summary = publicHealthSummary(data);
      const ready =
        summary.supabase?.serviceRoleConfigured === true &&
        summary.printJobs?.tableExists === true &&
        Boolean(summary.supabase?.restauranteId);

      console.log(JSON.stringify(summary, null, 2));

      if (ready) {
        console.log("\n✓ Cloud print listo en producción.");
        process.exit(0);
      }

      console.log("\n⚠ Health responde pero aún no está listo — reintentando...");
    } catch {
      console.log("… esperando deploy");
    }
    await new Promise((r) => setTimeout(r, POLL_MS));
  }

  console.error("\n✗ Timeout esperando health listo.");
  process.exit(1);
}

main().catch((err) => {
  console.error("\n✗", err.message ?? err);
  process.exit(1);
});
