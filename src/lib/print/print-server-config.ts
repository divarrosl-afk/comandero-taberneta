import type {
  DeployContext,
  PrintServerConfig,
  PrintServerHealth,
  PrintTransport,
} from "@/types/print-server";
import { PRINT_SERVER_CONFIG_DEFAULT } from "@/types/print-server";

const STORAGE_KEY = "comandero-taberneta:print-server-config";

function envPrintServerUrl(): string {
  return (
    process.env.NEXT_PUBLIC_PRINT_SERVER_URL?.trim() ||
    process.env.PRINT_SERVER_URL?.trim() ||
    ""
  );
}

export function detectDeployContext(): DeployContext {
  if (typeof window === "undefined") {
    if (process.env.VERCEL === "1") return "vercel";
    return "unknown";
  }

  const host = window.location.hostname.toLowerCase();
  if (
    process.env.NEXT_PUBLIC_VERCEL === "1" ||
    host.endsWith(".vercel.app") ||
    host.includes("vercel.app")
  ) {
    return "vercel";
  }
  if (host === "localhost" || host === "127.0.0.1") return "localhost";
  if (
    /^192\.168\.\d{1,3}\.\d{1,3}$/.test(host) ||
    /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(host)
  ) {
    return "lan";
  }
  return "unknown";
}

/** HTTPS (Vercel) no puede llamar a HTTP en IP privada — mixed content. */
export function isMixedContentBlocked(targetUrl: string): boolean {
  if (typeof window === "undefined") return false;
  if (window.location.protocol !== "https:") return false;
  try {
    return new URL(targetUrl).protocol === "http:";
  } catch {
    return true;
  }
}

export function normalizePrintServerUrl(url: string): string {
  return url.trim().replace(/\/$/, "");
}

export function getPrintServerConfig(): PrintServerConfig {
  const envUrl = envPrintServerUrl();
  const base: PrintServerConfig = {
    ...PRINT_SERVER_CONFIG_DEFAULT,
    remoteUrl: envUrl,
    localUrl: envUrl.startsWith("http://192.168.") ? envUrl : "",
  };

  if (typeof window === "undefined") return base;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<PrintServerConfig>;
    return {
      localUrl: parsed.localUrl?.trim() ?? base.localUrl,
      remoteUrl: parsed.remoteUrl?.trim() || envUrl || base.remoteUrl,
      autoDetect: parsed.autoDetect ?? true,
    };
  } catch {
    return base;
  }
}

export function savePrintServerConfig(config: PrintServerConfig): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      localUrl: config.localUrl.trim(),
      remoteUrl: config.remoteUrl.trim(),
      autoDetect: config.autoDetect,
    }),
  );
}

export function resolvePrintTransport(
  config: PrintServerConfig = getPrintServerConfig(),
): PrintTransport {
  const ctx = detectDeployContext();
  const directUrl = resolveDirectPrintServerUrl(config);

  if (ctx === "vercel" && !directUrl) return "cloud-queue";
  if (directUrl) return "direct";
  if (ctx === "localhost" || ctx === "lan") return "api-local";
  return "cloud-queue";
}

/** URL para fetch directo al print-server desde el navegador (si no hay mixed-content). */
export function resolveDirectPrintServerUrl(
  config: PrintServerConfig = getPrintServerConfig(),
): string | null {
  const ctx = detectDeployContext();
  const envUrl = envPrintServerUrl();

  if (!config.autoDetect) {
    const manual = config.remoteUrl || config.localUrl || envUrl;
    if (!manual) return null;
    const normalized = normalizePrintServerUrl(manual);
    if (isMixedContentBlocked(normalized)) return null;
    return normalized;
  }

  if (ctx === "vercel") {
    const remote = config.remoteUrl || envUrl;
    if (!remote) return null;
    const normalized = normalizePrintServerUrl(remote);
    if (isMixedContentBlocked(normalized)) return null;
    return normalized;
  }

  if (ctx === "localhost") {
    const local =
      config.localUrl ||
      (envUrl && !isMixedContentBlocked(envUrl) ? envUrl : "") ||
      "http://localhost:3100";
    return normalizePrintServerUrl(local);
  }

  if (ctx === "lan" && typeof window !== "undefined") {
    const hostUrl = `http://${window.location.hostname}:3100`;
    const local = config.localUrl || envUrl || hostUrl;
    const normalized = normalizePrintServerUrl(local);
    if (isMixedContentBlocked(normalized)) {
      const remote = config.remoteUrl;
      if (remote && !isMixedContentBlocked(remote)) {
        return normalizePrintServerUrl(remote);
      }
      return null;
    }
    return normalized;
  }

  const fallback = config.remoteUrl || config.localUrl || envUrl;
  if (!fallback) return null;
  const normalized = normalizePrintServerUrl(fallback);
  if (isMixedContentBlocked(normalized)) return null;
  return normalized;
}

export function getPrintServerUrl(): string | null {
  return resolveDirectPrintServerUrl();
}

export function describePrintSetup(
  config: PrintServerConfig = getPrintServerConfig(),
): string {
  const transport = resolvePrintTransport(config);
  const ctx = detectDeployContext();

  if (transport === "cloud-queue") {
    return "Modo nube: los tickets se encolan en Supabase y el Lenovo del restaurante los imprime automáticamente.";
  }
  if (transport === "direct") {
    return `Impresión directa al print-server (${ctx}).`;
  }
  return "Impresión vía API local del Comandero.";
}

export async function checkPrintServerHealth(
  url?: string | null,
): Promise<PrintServerHealth> {
  const config = getPrintServerConfig();
  const transport = resolvePrintTransport(config);
  const target = url ?? resolveDirectPrintServerUrl(config);

  if (transport === "cloud-queue") {
    return {
      ok: true,
      message:
        "Modo nube activo — el print-server del restaurante recoge los tickets desde Supabase.",
      transport,
      mixedContentBlocked: Boolean(
        (config.remoteUrl || config.localUrl) &&
          isMixedContentBlocked(config.localUrl || config.remoteUrl),
      ),
    };
  }

  if (!target) {
    return {
      ok: false,
      message:
        "No hay URL de print-server accesible. En Vercel use cola en nube o configure una URL HTTPS (túnel).",
      transport,
      mixedContentBlocked: isMixedContentBlocked(
        config.localUrl || config.remoteUrl || "http://0.0.0.0",
      ),
    };
  }

  if (isMixedContentBlocked(target)) {
    return {
      ok: false,
      message:
        "Mixed-content bloqueado: la app HTTPS no puede llamar a un print-server HTTP. Use cola en nube o un túnel HTTPS.",
      transport,
      url: target,
      mixedContentBlocked: true,
    };
  }

  try {
    const res = await fetch(`${target}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(4000),
    });
    const data = (await res.json()) as { ok?: boolean; queuePending?: number };
    return {
      ok: Boolean(data.ok),
      message: data.ok
        ? `Print-server conectado (${target})`
        : `Print-server no responde (${target})`,
      transport,
      url: target,
    };
  } catch {
    return {
      ok: false,
      message: `No se alcanza el print-server en ${target}`,
      transport,
      url: target,
    };
  }
}
