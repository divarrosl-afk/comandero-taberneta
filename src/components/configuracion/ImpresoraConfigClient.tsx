"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { PrintStatusBanner } from "@/components/impresion/PrintStatusBanner";
import { probarConexionImpresora, probarImpresora } from "@/modules/impresion-wifi";
import { PRINT_MESSAGES } from "@/modules/impresion-wifi/types";
import {
  getImpresoraConfig,
  guardarImpresoraConfig,
} from "@/lib/impresora/impresora-config-service";
import {
  checkPrintServerHealth,
  describePrintSetup,
  detectDeployContext,
  getPrintServerConfig,
  resolvePrintTransport,
  savePrintServerConfig,
} from "@/lib/print/print-server-config";
import type { PrintServerConfig } from "@/types/print-server";
import { PRINT_SERVER_CONFIG_DEFAULT } from "@/types/print-server";
import {
  IMPRESORA_DEFAULT,
  TEST_IMPRESORA_TEXTO,
  type AnchoPapel,
  type ImpresoraConfig,
  type ModoImpresora,
} from "@/types/impresora";

export function ImpresoraConfigClient() {
  const [config, setConfig] = useState<ImpresoraConfig>(IMPRESORA_DEFAULT);
  const [printServer, setPrintServer] = useState<PrintServerConfig>(
    PRINT_SERVER_CONFIG_DEFAULT,
  );
  const [deployCtx, setDeployCtx] = useState("unknown");
  const [transport, setTransport] = useState("cloud-queue");
  const [guardado, setGuardado] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [connLoading, setConnLoading] = useState(false);
  const [serverLoading, setServerLoading] = useState(false);
  const [testMsg, setTestMsg] = useState<string | null>(null);
  const [connMsg, setConnMsg] = useState<string | null>(null);
  const [serverMsg, setServerMsg] = useState<string | null>(null);
  const [testError, setTestError] = useState(false);
  const [connError, setConnError] = useState(false);
  const [serverError, setServerError] = useState(false);

  useEffect(() => {
    void getImpresoraConfig().then(setConfig);
    setPrintServer(getPrintServerConfig());
    setDeployCtx(detectDeployContext());
    setTransport(resolvePrintTransport());
  }, []);

  const update = <K extends keyof ImpresoraConfig>(
    key: K,
    value: ImpresoraConfig[K],
  ) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setGuardado(false);
  };

  const handleGuardar = async () => {
    await guardarImpresoraConfig(config);
    savePrintServerConfig(printServer);
    setGuardado(true);
    setTransport(resolvePrintTransport(printServer));
    setTimeout(() => setGuardado(false), 2500);
  };

  const handleProbarPrintServer = async () => {
    savePrintServerConfig(printServer);
    setServerLoading(true);
    setServerMsg(null);
    try {
      const health = await checkPrintServerHealth();
      setServerMsg(health.ok ? `✅ ${health.message}` : `❌ ${health.message}`);
      setServerError(!health.ok);
    } catch {
      setServerMsg("❌ No se pudo comprobar el print-server");
      setServerError(true);
    } finally {
      setServerLoading(false);
    }
  };

  const handleProbarConexion = async () => {
    await guardarImpresoraConfig(config);
    setConnLoading(true);
    setConnMsg(null);
    try {
      const result = await probarConexionImpresora(config);
      setConnMsg(
        result.ok ? PRINT_MESSAGES.impresoraConectada : PRINT_MESSAGES.impresoraNoConecta,
      );
      setConnError(!result.ok);
    } catch {
      setConnMsg("No se pudo probar la conexión");
      setConnError(true);
    } finally {
      setConnLoading(false);
    }
  };

  const handleProbar = async () => {
    await guardarImpresoraConfig(config);
    setTestLoading(true);
    setTestMsg(null);

    try {
      const result = await probarImpresora(config);
      setTestMsg(
        result.ok
          ? result.simulated
            ? result.message
            : `✅ ${PRINT_MESSAGES.impresoraConectada} — ticket enviado`
          : result.message.startsWith("❌")
            ? result.message
            : `❌ ${result.message}`,
      );
      setTestError(!result.ok);
    } catch {
      setTestMsg("Error de impresión");
      setTestError(true);
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <main className="mx-auto min-h-dvh max-w-lg px-4 py-4">
      <header className="mb-6">
        <Link
          href="/"
          className="mb-2 inline-block text-sm font-semibold text-accent"
        >
          ← Inicio
        </Link>
        <h1 className="text-2xl font-bold text-primary">Impresora principal</h1>
        <p className="mt-1 text-sm text-muted">
          Una sola impresora para cocina, barra y postres
        </p>
      </header>

      {guardado && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
          Configuración guardada
        </div>
      )}

      <div className="space-y-4 rounded-2xl border-2 border-border bg-card p-4">
        <div>
          <label className="mb-1 block text-sm font-semibold">Nombre</label>
          <input
            type="text"
            value={config.nombre}
            onChange={(e) => update("nombre", e.target.value)}
            className="min-h-12 w-full rounded-xl border-2 border-border bg-background px-3 text-base outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold">IP</label>
          <input
            type="text"
            value={config.ip}
            onChange={(e) => update("ip", e.target.value)}
            placeholder="192.168.1.100"
            className="min-h-12 w-full rounded-xl border-2 border-border bg-background px-3 text-base outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold">Puerto</label>
          <input
            type="number"
            value={config.puerto}
            onChange={(e) => update("puerto", Number(e.target.value) || 9100)}
            min={1}
            max={65535}
            className="min-h-12 w-full rounded-xl border-2 border-border bg-background px-3 text-base outline-none focus:border-primary"
          />
          <p className="mt-1 text-xs text-muted">Por defecto 9100 (ESC/POS red)</p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">Ancho papel</label>
          <div className="grid grid-cols-2 gap-2">
            {(["58mm", "80mm"] as AnchoPapel[]).map((ancho) => (
              <button
                key={ancho}
                type="button"
                onClick={() => update("anchoPapel", ancho)}
                className={[
                  "min-h-12 rounded-xl border-2 font-semibold transition active:scale-95",
                  config.anchoPapel === ancho
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background",
                ].join(" ")}
              >
                {ancho}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">Modo</label>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { id: "mock" as ModoImpresora, label: "Simulación (mock)" },
                { id: "network" as ModoImpresora, label: "Red (network)" },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => update("modo", m.id)}
                className={[
                  "min-h-12 rounded-xl border-2 px-2 text-sm font-semibold transition active:scale-95",
                  config.modo === m.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background",
                ].join(" ")}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border-2 border-border bg-background px-4 py-3">
          <div>
            <p className="font-semibold">Impresora activa</p>
            <p className="text-xs text-muted">Desactivar para no enviar tickets</p>
          </div>
          <button
            type="button"
            onClick={() => update("activa", !config.activa)}
            className={[
              "relative h-8 w-14 rounded-full transition",
              config.activa ? "bg-primary" : "bg-border",
            ].join(" ")}
            aria-pressed={config.activa}
          >
            <span
              className={[
                "absolute top-1 h-6 w-6 rounded-full bg-white shadow transition",
                config.activa ? "left-7" : "left-1",
              ].join(" ")}
            />
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-4 rounded-2xl border-2 border-border bg-card p-4">
        <div>
          <h2 className="text-lg font-bold text-primary">Print-server (Lenovo)</h2>
          <p className="mt-1 text-xs text-muted">
            Contexto: <strong>{deployCtx}</strong> · Transporte:{" "}
            <strong>{transport}</strong>
          </p>
          <p className="mt-2 text-sm text-muted">{describePrintSetup(printServer)}</p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold">URL local (LAN)</label>
          <input
            type="url"
            value={printServer.localUrl}
            onChange={(e) =>
              setPrintServer((p) => ({ ...p, localUrl: e.target.value }))
            }
            placeholder="http://192.168.1.146:3100"
            className="min-h-12 w-full rounded-xl border-2 border-border bg-background px-3 text-base outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold">
            URL remota (HTTPS / túnel)
          </label>
          <input
            type="url"
            value={printServer.remoteUrl}
            onChange={(e) =>
              setPrintServer((p) => ({ ...p, remoteUrl: e.target.value }))
            }
            placeholder="https://print.tu-dominio.com"
            className="min-h-12 w-full rounded-xl border-2 border-border bg-background px-3 text-base outline-none focus:border-primary"
          />
          <p className="mt-1 text-xs text-muted">
            En Vercel (HTTPS) use cola en nube o un túnel HTTPS al print-server.
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-dashed border-border bg-card/50 p-4">
        <p className="text-xs font-semibold uppercase text-muted">Prueba</p>
        <p className="mt-1 font-mono text-sm">{TEST_IMPRESORA_TEXTO}</p>
      </div>

      <PrintStatusBanner
        summary={connMsg}
        loading={connLoading}
        error={connError}
      />

      <PrintStatusBanner
        summary={serverMsg}
        loading={serverLoading}
        error={serverError}
      />

      <PrintStatusBanner
        summary={testMsg}
        loading={testLoading}
        error={testError}
      />

      <div className="mt-4 space-y-3">
        <Button fullWidth size="lg" onClick={handleGuardar}>
          Guardar configuración
        </Button>
        <Button
          variant="secondary"
          fullWidth
          size="lg"
          onClick={handleProbarPrintServer}
          disabled={serverLoading}
        >
          {serverLoading ? "Comprobando print-server…" : "Comprobar print-server"}
        </Button>
        <Button
          variant="secondary"
          fullWidth
          size="lg"
          onClick={handleProbarConexion}
          disabled={connLoading || !config.ip}
        >
          {connLoading ? "Probando conexión…" : "Probar conexión TCP"}
        </Button>
        <Button
          variant="secondary"
          fullWidth
          size="lg"
          onClick={handleProbar}
          disabled={testLoading}
        >
          Probar impresión
        </Button>
      </div>

      <p className="mt-6 text-center text-xs text-muted">
        Producción: la app en Vercel encola tickets en Supabase.
        <br />
        El Lenovo (print-server) los imprime por TCP 9100 en la red local.
      </p>
    </main>
  );
}
