import { sanitizeLogMessage } from "./sanitize.mjs";

const API = "https://api.vercel.com";
const DEFAULT_PROJECT_ID = "prj_ei4K1jhbYegz3SKHmBrcdl3XHNZI";
const DEFAULT_TEAM_SLUG = "divarro";
const DEFAULT_PRODUCTION_URL = "https://comandero-taberneta.vercel.app";

/** GitHub Actions pasa secretos ausentes como cadena vacía — no usar ?? solo. */
export function readEnv(name, fallback = "") {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : fallback;
}

export function getVercelConfig() {
  const projectId = readEnv("VERCEL_PROJECT_ID", DEFAULT_PROJECT_ID);
  const teamSlug = readEnv("VERCEL_TEAM_SLUG", DEFAULT_TEAM_SLUG);

  return {
    token: readEnv("VERCEL_TOKEN"),
    projectId,
    teamSlug,
    productionUrl: readEnv("VERCEL_PRODUCTION_URL", DEFAULT_PRODUCTION_URL),
  };
}

export function getVercelEnvVars() {
  const anonKey =
    readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY") ||
    readEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");

  const vars = {
    NEXT_PUBLIC_SUPABASE_URL: readEnv("NEXT_PUBLIC_SUPABASE_URL"),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey,
    SUPABASE_SERVICE_ROLE_KEY: readEnv("SUPABASE_SERVICE_ROLE_KEY"),
    NEXT_PUBLIC_RESTAURANTE_ID: readEnv("NEXT_PUBLIC_RESTAURANTE_ID"),
    NEXT_PUBLIC_DATA_BACKEND: "supabase",
  };

  const bootstrap = readEnv("SETUP_BOOTSTRAP_TOKEN");
  if (bootstrap) vars.SETUP_BOOTSTRAP_TOKEN = bootstrap;

  const adminPassword = readEnv("SEED_ADMIN_PASSWORD");
  if (adminPassword) vars.SEED_ADMIN_PASSWORD = adminPassword;

  const camareroPassword = readEnv("SEED_CAMARERO_PASSWORD");
  if (camareroPassword) vars.SEED_CAMARERO_PASSWORD = camareroPassword;

  return vars;
}

export async function vercelRequest(path, { method = "GET", body, token, teamSlug }) {
  const sep = path.includes("?") ? "&" : "?";
  const url = `${API}${path}${sep}teamId=${teamSlug}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const safe = sanitizeLogMessage(JSON.stringify(data));
    throw new Error(`${method} ${path} → HTTP ${res.status}: ${safe}`);
  }
  return data;
}

export async function upsertVercelEnv(key, value, { token, projectId, teamSlug }) {
  const targets = ["production", "preview", "development"];
  const type =
    key.includes("KEY") || key.includes("TOKEN") || key.includes("PASSWORD")
      ? "encrypted"
      : "plain";

  try {
    await vercelRequest(`/v10/projects/${projectId}/env`, {
      method: "POST",
      body: { key, value, type, target: targets },
      token,
      teamSlug,
    });
    console.log(`  + ${key}`);
  } catch (err) {
    const msg = sanitizeLogMessage(String(err));
    if (!msg.includes("ENV_ALREADY_EXISTS")) throw new Error(msg);
    const list = await vercelRequest(`/v9/projects/${projectId}/env`, {
      token,
      teamSlug,
    });
    const existing = (list.envs ?? []).find((e) => e.key === key);
    if (!existing?.id) throw new Error(msg);
    await vercelRequest(`/v9/projects/${projectId}/env/${existing.id}`, {
      method: "PATCH",
      body: { value, target: targets },
      token,
      teamSlug,
    });
    console.log(`  ~ ${key} (actualizado)`);
  }
}

export async function redeployVercelProduction({ token, projectId, teamSlug }) {
  return vercelRequest("/v13/deployments", {
    method: "POST",
    body: {
      name: "comandero-taberneta",
      project: projectId,
      target: "production",
      gitSource: {
        type: "github",
        org: "divarrosl-afk",
        repo: "comandero-taberneta",
        ref: "main",
      },
    },
    token,
    teamSlug,
  });
}
