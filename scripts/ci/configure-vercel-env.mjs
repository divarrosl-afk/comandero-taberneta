#!/usr/bin/env node
/**
 * Sincroniza variables de entorno en Vercel (sin redeploy).
 * No imprime valores de secretos — solo nombres de variables.
 */
import { sanitizeLogMessage } from "./sanitize.mjs";
import {
  getVercelConfig,
  getVercelEnvVars,
  upsertVercelEnv,
} from "./vercel-client.mjs";

async function main() {
  const { token, projectId, teamSlug } = getVercelConfig();
  if (!token) {
    console.error("Falta VERCEL_TOKEN");
    process.exit(1);
  }

  const vars = getVercelEnvVars();
  for (const [key, value] of Object.entries(vars)) {
    if (!value) {
      console.error(`Falta valor para ${key}`);
      process.exit(1);
    }
  }

  console.log("→ Sincronizando variables en Vercel (production, preview, development)...");
  for (const [key, value] of Object.entries(vars)) {
    await upsertVercelEnv(key, value, { token, projectId, teamSlug });
  }

  console.log("\n✓ Variables Vercel sincronizadas.");
}

main().catch((err) => {
  console.error("\n✗", sanitizeLogMessage(err.message ?? err));
  process.exit(1);
});
