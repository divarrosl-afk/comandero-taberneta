#!/usr/bin/env node
/**
 * Configura variables de Vercel para impresión cloud y redeploya producción.
 *
 * Uso:
 *   VERCEL_TOKEN=xxx \
 *   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co \
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... \
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
 *   NEXT_PUBLIC_RESTAURANTE_ID=b1c2d3e4-f5a6-4789-a012-3456789abcde \
 *   node scripts/setup-vercel-cloud-print.mjs
 */
const TOKEN = process.env.VERCEL_TOKEN?.trim();
const PROJECT_ID =
  process.env.VERCEL_PROJECT_ID?.trim() ?? "prj_ei4K1jhbYegz3SKHmBrcdl3XHNZI";
const TEAM_SLUG = process.env.VERCEL_TEAM_SLUG?.trim() ?? "divarro";

const REQUIRED = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL?.trim(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  NEXT_PUBLIC_RESTAURANTE_ID:
    process.env.NEXT_PUBLIC_RESTAURANTE_ID?.trim() ??
    "b1c2d3e4-f5a6-4789-a012-3456789abcde",
  NEXT_PUBLIC_DATA_BACKEND: "supabase",
};

if (!TOKEN) {
  console.error("Falta VERCEL_TOKEN → https://vercel.com/account/tokens");
  process.exit(1);
}

for (const [key, val] of Object.entries(REQUIRED)) {
  if (!val) {
    console.error(`Falta ${key}`);
    process.exit(1);
  }
}

const API = "https://api.vercel.com";

async function vercel(path, { method = "GET", body } = {}) {
  const sep = path.includes("?") ? "&" : "?";
  const url = `${API}${path}${sep}teamId=${TEAM_SLUG}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`${method} ${path} → ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

async function upsertEnv(key, value, type = "plain") {
  const targets = ["production", "preview", "development"];
  try {
    await vercel(`/v10/projects/${PROJECT_ID}/env`, {
      method: "POST",
      body: { key, value, type, target: targets },
    });
    console.log(`  + ${key}`);
  } catch (err) {
    const msg = String(err);
    if (!msg.includes("ENV_ALREADY_EXISTS")) throw err;
    const list = await vercel(`/v9/projects/${PROJECT_ID}/env`);
    const existing = (list.envs ?? []).find((e) => e.key === key);
    if (!existing?.id) throw err;
    await vercel(`/v9/projects/${PROJECT_ID}/env/${existing.id}`, {
      method: "PATCH",
      body: { value, target: targets },
    });
    console.log(`  ~ ${key} (actualizado)`);
  }
}

async function waitForHealth(maxMs = 180_000) {
  const url = "https://comandero-taberneta.vercel.app/api/print-jobs/health";
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 8000));
  }
  return null;
}

async function main() {
  console.log("→ Configurando variables en Vercel...");
  for (const [key, value] of Object.entries(REQUIRED)) {
    const type = key.includes("KEY") ? "encrypted" : "plain";
    await upsertEnv(key, value, type);
  }

  console.log("\n→ Redeploy producción (main)...");
  const deployment = await vercel("/v13/deployments", {
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
  console.log(`  Deploy id: ${deployment.id ?? "—"}`);

  console.log("\n→ Esperando /api/print-jobs/health...");
  const health = await waitForHealth();
  if (!health) {
    console.warn("\n⚠ Health aún no responde — espera 1–2 min y abre:");
    console.warn("  https://comandero-taberneta.vercel.app/api/print-jobs/health");
    process.exit(0);
  }

  console.log("\n✓ Health:");
  console.log(JSON.stringify(health, null, 2));
  const ok =
    health.supabase?.serviceRoleConfigured === true &&
    health.printJobs?.tableExists === true;
  if (ok) {
    console.log("\n✓ Cloud print listo en Vercel.");
  } else {
    console.warn("\n⚠ Revisa Supabase (migración print_jobs) y variables.");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("\n✗", err.message ?? err);
  process.exit(1);
});
