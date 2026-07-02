import { sanitizeLogMessage } from "./sanitize.mjs";

const API = "https://api.vercel.com";

export function getVercelConfig() {
  return {
    token: process.env.VERCEL_TOKEN?.trim() ?? "",
    projectId:
      process.env.VERCEL_PROJECT_ID?.trim() ?? "prj_ei4K1jhbYegz3SKHmBrcdl3XHNZI",
    teamSlug: process.env.VERCEL_TEAM_SLUG?.trim() ?? "divarro",
    productionUrl:
      process.env.VERCEL_PRODUCTION_URL?.trim() ??
      "https://comandero-taberneta.vercel.app",
  };
}

export function getVercelEnvVars() {
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    "";

  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "",
    NEXT_PUBLIC_RESTAURANTE_ID: process.env.NEXT_PUBLIC_RESTAURANTE_ID?.trim() ?? "",
    NEXT_PUBLIC_DATA_BACKEND: "supabase",
  };
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
  const type = key.includes("KEY") ? "encrypted" : "plain";

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
