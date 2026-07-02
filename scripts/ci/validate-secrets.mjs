#!/usr/bin/env node
/**
 * Comprueba que las variables de entorno requeridas existen.
 * Solo imprime NOMBRES de variables faltantes — nunca valores.
 *
 * Uso:
 *   node scripts/ci/validate-secrets.mjs migrate
 *   node scripts/ci/validate-secrets.mjs vercel-env
 *   node scripts/ci/validate-secrets.mjs vercel-redeploy
 */
const STEPS = {
  migrate: ["SUPABASE_DB_URL"],
  "vercel-env": [
    "VERCEL_TOKEN",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "NEXT_PUBLIC_RESTAURANTE_ID",
  ],
  "vercel-redeploy": ["VERCEL_TOKEN"],
  health: [],
  seed: [
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "NEXT_PUBLIC_RESTAURANTE_ID",
    "SEED_ADMIN_PASSWORD",
    "SEED_CAMARERO_PASSWORD",
  ],
};

const step = process.argv[2];
if (!step || !STEPS[step]) {
  console.error("Uso: node scripts/ci/validate-secrets.mjs <migrate|vercel-env|vercel-redeploy|health|seed>");
  process.exit(1);
}

const missing = STEPS[step].filter((name) => !process.env[name]?.trim());

if (step === "vercel-env") {
  const hasAnon =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!hasAnon && STEPS[step].includes("NEXT_PUBLIC_SUPABASE_ANON_KEY")) {
    if (!missing.includes("NEXT_PUBLIC_SUPABASE_ANON_KEY")) {
      missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    }
  } else if (hasAnon) {
    const idx = missing.indexOf("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    if (idx >= 0) missing.splice(idx, 1);
  }
}

if (missing.length > 0) {
  console.error(`Faltan secretos de GitHub Actions (${step}):`);
  for (const name of missing) {
    console.error(`  - ${name}`);
  }
  console.error("\nVer docs/GITHUB-SECRETS.md");
  process.exit(1);
}

console.log(`✓ Secretos requeridos presentes (${step})`);
