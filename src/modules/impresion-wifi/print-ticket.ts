import type {
  PrintJobStatus,
  PrintResult,
  PrintTicketRequest,
} from "@/modules/impresion-wifi/types";
import { PRINT_MESSAGES, PRINT_STATUS_LABELS } from "@/modules/impresion-wifi/types";
import {
  getEffectivePrintMode,
  resolveImpresoraConfig,
  resolvePrintTransport,
  resolveDirectPrintServerUrl,
} from "@/modules/impresion-wifi/config";
import { getSupabaseAccessToken } from "@/lib/supabase/client";
import { usesRemoteData } from "@/lib/data/backend";

const POLL_MS = 500;
const POLL_TIMEOUT_MS = 90_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function buildAuthHeaders(
  endpoint: string,
): Promise<Record<string, string>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const isAppApi = endpoint.startsWith("/api/");
  if (usesRemoteData() && isAppApi) {
    const token = await getSupabaseAccessToken();
    if (!token) return headers;
    headers.Authorization = `Bearer ${token}`;
  } else if (usesRemoteData()) {
    const token = await getSupabaseAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

function resultFromJob(
  job: PrintResult,
  mode: PrintResult["mode"],
  destino: PrintTicketRequest["destino"],
  tipo: PrintTicketRequest["tipo"],
): PrintResult {
  return {
    ...job,
    mode: job.mode ?? mode,
    destino: job.destino ?? destino,
    tipo: job.tipo ?? tipo,
    timestamp: job.timestamp ?? new Date().toISOString(),
  };
}

async function pollPrintJob(
  jobUrl: string,
  headers: Record<string, string>,
  mode: PrintResult["mode"],
  destino: PrintTicketRequest["destino"],
  tipo: PrintTicketRequest["tipo"],
): Promise<PrintResult> {
  const deadline = Date.now() + POLL_TIMEOUT_MS;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(jobUrl, { headers });
      if (!response.ok) break;

      const data = (await response.json()) as { job?: PrintResult };
      const job = data.job;
      if (!job?.jobId) break;

      if (job.status === "printed" && job.ok) {
        return resultFromJob(
          { ...job, message: job.message || PRINT_MESSAGES.impreso },
          mode,
          destino,
          tipo,
        );
      }

      if (
        job.status === "error" &&
        job.attempts !== undefined &&
        job.attempts >= 8
      ) {
        return resultFromJob(
          { ...job, ok: false, message: job.message || PRINT_MESSAGES.error },
          mode,
          destino,
          tipo,
        );
      }
    } catch {
      break;
    }

    await sleep(POLL_MS);
  }

  return {
    ok: false,
    mode,
    destino,
    tipo,
    message: `${PRINT_MESSAGES.error} — timeout esperando impresión`,
    simulated: false,
    timestamp: new Date().toISOString(),
    status: "error",
  };
}

async function postPrintRequest(
  request: PrintTicketRequest,
  endpoint: string,
): Promise<PrintResult> {
  const impresora = request.impresora ?? resolveImpresoraConfig();
  const mode = getEffectivePrintMode(impresora);
  const timestamp = new Date().toISOString();
  const payload: PrintTicketRequest = { ...request, impresora };

  const headers = await buildAuthHeaders(endpoint);
  if (
    usesRemoteData() &&
    endpoint.startsWith("/api/") &&
    !headers.Authorization
  ) {
    return {
      ok: false,
      mode,
      destino: request.destino,
      tipo: request.tipo,
      message: "Sesión requerida para imprimir — inicia sesión de nuevo",
      simulated: false,
      timestamp,
    };
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as PrintResult;

    if (response.status === 202 && data.jobId) {
      const base = endpoint.replace(/\/print$/, "");
      return pollPrintJob(
        `${base}/jobs/${data.jobId}`,
        headers,
        mode,
        request.destino,
        request.tipo,
      );
    }

    if (!response.ok) {
      return {
        ok: false,
        mode,
        destino: request.destino,
        tipo: request.tipo,
        message: data.message ?? PRINT_MESSAGES.error,
        simulated: mode === "mock",
        timestamp,
        status: data.status,
        jobId: data.jobId,
      };
    }

    return {
      ...data,
      timestamp: data.timestamp ?? timestamp,
      message:
        data.ok && !data.simulated
          ? data.message || PRINT_MESSAGES.impreso
          : data.message,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : PRINT_MESSAGES.error;
    return {
      ok: false,
      mode,
      destino: request.destino,
      tipo: request.tipo,
      message: `${PRINT_MESSAGES.error}: ${msg}`,
      simulated: mode === "mock",
      timestamp,
      status: "error",
    };
  }
}

/**
 * Envía un ticket al print-server del restaurante (nunca TCP directo desde el móvil).
 */
export async function printTicket(
  ticket: string,
  destino: PrintTicketRequest["destino"],
  options?: Omit<PrintTicketRequest, "ticket" | "destino">,
): Promise<PrintResult> {
  const impresora = resolveImpresoraConfig(options?.impresora);

  if (!impresora.activa) {
    return {
      ok: true,
      mode: "mock",
      destino,
      tipo: options?.tipo ?? destino,
      message: PRINT_MESSAGES.impresoraInactiva,
      simulated: true,
      timestamp: new Date().toISOString(),
      status: "printed",
    };
  }

  const request: PrintTicketRequest = {
    ticket,
    destino,
    tipo: options?.tipo ?? destino,
    comandaId: options?.comandaId,
    mesa: options?.mesa,
    camarero: options?.camarero,
    impresora,
  };

  const transport = resolvePrintTransport();
  const serverUrl = resolveDirectPrintServerUrl();

  if (transport === "direct" && serverUrl) {
    const result = await postPrintRequest(
      request,
      `${serverUrl}/print`,
    );
    if (result.ok) return result;
  }

  return postPrintRequest(request, "/api/impresion");
}

export function printStatusLabel(status?: PrintJobStatus): string {
  if (!status) return PRINT_MESSAGES.enviando;
  return PRINT_STATUS_LABELS[status];
}
