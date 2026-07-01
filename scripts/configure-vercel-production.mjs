#!/usr/bin/env node
/**
 * Configura producción en Vercel:
 * - Desactiva Vercel Authentication (SSO) en Production
 * - Asegura PRINT_MODE=mock
 * - Solicita redeploy de producción
 *
 * Uso:
 *   VERCEL_TOKEN=xxx node scripts/configure-vercel-production.mjs
 */

const TOKEN = process.env.VERCEL_TOKEN?.trim();
const PROJECT_ID =
  process.env.VERCEL_PROJECT_ID?.trim() ?? "prj_ei4K1jhbYegz3SKHmBrcdl3XHNZI";
const TEAM_SLUG = process.env.VERCEL_TEAM_SLUG?.trim() ?? "divarro";

if (!TOKEN) {
  console.error("Falta VERCEL_TOKEN. Créalo en https://vercel.com/account/tokens");
  process.exit(1);
}

const API = "https://api.vercel.com";

async function vercel(path, { method = "GET", body } = {}) {
  const url = `${API}${path}${path.includes("?") ? "&" : "?"}teamId=${TEAM_SLUG}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new Error(`${method} ${path} → ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

async function main() {
  console.log("→ Desactivando Vercel Authentication (SSO)...");
  await vercel(`/v9/projects/${PROJECT_ID}`, {
    method: "PATCH",
    body: { ssoProtection: null },
  });

  console.log("→ Configurando PRINT_MODE=mock en Production...");
  try {
    await vercel(`/v10/projects/${PROJECT_ID}/env`, {
      method: "POST",
      body: {
        key: "PRINT_MODE",
        value: "mock",
        type: "plain",
        target: ["production", "preview", "development"],
      },
    });
  } catch (err) {
    const msg = String(err);
    if (!msg.includes("ENV_ALREADY_EXISTS")) {
      console.warn("  (env puede existir ya):", msg);
    }
  }

  console.log("→ Solicitando redeploy de producción...");
  const deployment = await vercel(`/v13/deployments`, {
    method: "POST",
    body: {
      name: "comandero-taberneta",
      project: PROJECT_ID,
      target: "production",
      gitSource: {
        type: "github",
        org: "divarrosl-afk",
        repo: "comandero-taberneta",
        ref: "main",
      },
    },
  });

  const url =
    deployment?.url != null
      ? `https://${deployment.url}`
      : deployment?.alias?.[0]
        ? `https://${deployment.alias[0]}`
        : "(ver dashboard)";

  console.log("\n✓ Listo");
  console.log(`  Deploy: ${url}`);
  console.log("  Producción: https://comandero-taberneta-divarro.vercel.app");
  console.log("  Alias:      https://comandero-taberneta.vercel.app");
}

main().catch((err) => {
  console.error("\n✗ Error:", err.message ?? err);
  process.exit(1);
});
