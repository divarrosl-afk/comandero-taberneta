#!/usr/bin/env node
/**
 * Solicita redeploy de producción en Vercel.
 * No imprime tokens ni respuestas completas de la API.
 */
import { sanitizeLogMessage } from "./sanitize.mjs";
import { getVercelConfig, redeployVercelProduction } from "./vercel-client.mjs";

async function main() {
  const { token, projectId, teamSlug } = getVercelConfig();
  if (!token) {
    console.error("Falta VERCEL_TOKEN");
    process.exit(1);
  }

  console.log("→ Solicitando redeploy de producción (main)...");
  const deployment = await redeployVercelProduction({ token, projectId, teamSlug });
  const id = deployment.id ?? "(sin id)";
  console.log(`✓ Deploy solicitado: ${id}`);
}

main().catch((err) => {
  console.error("\n✗", sanitizeLogMessage(err.message ?? err));
  process.exit(1);
});
