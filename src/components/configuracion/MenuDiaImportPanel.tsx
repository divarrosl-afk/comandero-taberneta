"use client";

import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { SectionCard } from "@/components/ui/SectionCard";
import { importadosDesdeParsed } from "@/lib/menu-dia/menu-platos-comanda";
import type { MenuDiaParseado } from "@/lib/menu-dia/parse-menu-texto";
import type { MenuDiaConfig } from "@/types/menu-dia";

interface MenuDiaImportPanelProps {
  menuActual: MenuDiaConfig;
  onAplicar: (cambios: Partial<MenuDiaConfig>) => Promise<void>;
}

function ListaPlatos({
  titulo,
  platos,
}: {
  titulo: string;
  platos: { nombre: string; suplemento?: number }[];
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-bold">{titulo}</p>
      <ul className="space-y-1 text-sm">
        {platos.map((plato, i) => (
          <li
            key={i}
            className="rounded-lg bg-green-50 px-2 py-1 text-green-900"
          >
            {plato.nombre}
            {plato.suplemento ? ` (+${plato.suplemento} €)` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}

function menuAParsed(menu: MenuDiaConfig): MenuDiaParseado | null {
  const primeros = menu.primerosImportados ?? [];
  const segundos = menu.segundosImportados ?? [];
  if (primeros.length === 0 && segundos.length === 0) return null;

  return {
    fecha: menu.fecha,
    precioMenu: menu.precioMenu,
    observaciones: menu.observaciones,
    primeros: primeros.map((p) => ({
      nombre: p.nombre,
      suplemento: p.suplemento,
    })),
    segundos: segundos.map((p) => ({
      nombre: p.nombre,
      suplemento: p.suplemento,
    })),
  };
}

export function MenuDiaImportPanel({
  menuActual,
  onAplicar,
}: MenuDiaImportPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [texto, setTexto] = useState("");
  const [parsedSesion, setParsedSesion] = useState<MenuDiaParseado | null>(
    null,
  );
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsed = useMemo(
    () => parsedSesion ?? menuAParsed(menuActual),
    [parsedSesion, menuActual],
  );

  const aplicarParsed = async (data: MenuDiaParseado) => {
    const { primerosImportados, segundosImportados } =
      importadosDesdeParsed(data.primeros, data.segundos);

    await onAplicar({
      fecha: data.fecha,
      precioMenu: data.precioMenu,
      primerosIds: [],
      segundosIds: [],
      primerosImportados,
      segundosImportados,
      observaciones: data.observaciones,
      activo: primerosImportados.length > 0 || segundosImportados.length > 0,
    });
    setParsedSesion(data);
  };

  const analizarTexto = async (contenido: string) => {
    setError(null);
    const r = await fetch("/api/menu-dia/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto: contenido }),
    });
    if (!r.ok) throw new Error("Error al analizar");
    const data = (await r.json()) as { parsed: MenuDiaParseado };
    return data.parsed;
  };

  const handleAnalizar = async () => {
    if (!texto.trim()) return;
    setCargando(true);
    try {
      const data = await analizarTexto(texto);
      await aplicarParsed(data);
    } catch {
      setError("No se pudo leer el texto del menú");
    } finally {
      setCargando(false);
    }
  };

  const handlePdf = async (file: File) => {
    setCargando(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const r = await fetch("/api/menu-dia/import", {
        method: "POST",
        body: form,
      });
      if (!r.ok) throw new Error("PDF");
      const data = (await r.json()) as {
        texto: string;
        parsed: MenuDiaParseado;
      };
      setTexto(data.texto);
      await aplicarParsed(data.parsed);
    } catch {
      setError("No se pudo leer el PDF. Prueba a pegar el texto.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <SectionCard title="Menú del día — subir PDF">
      <p className="mb-3 text-sm text-muted">
        Sube el PDF de Taberneta. El menú queda guardado en el servidor y sale
        en <strong>nueva comanda → Menú</strong> en todos los dispositivos hasta
        que subas el del día siguiente.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handlePdf(file);
          e.target.value = "";
        }}
      />

      <div className="mb-3 flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={cargando}
        >
          {cargando ? "Guardando menú…" : "Subir PDF"}
        </Button>
        <Button
          size="sm"
          onClick={handleAnalizar}
          disabled={cargando || !texto.trim()}
        >
          {cargando ? "Leyendo…" : "Analizar texto"}
        </Button>
      </div>

      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        rows={4}
        placeholder="Pega aquí el menú o sube un PDF…"
        className="mb-3 w-full rounded-xl border-2 border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
      />

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      {parsed && (
        <div className="space-y-4 border-t border-border pt-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            {parsed.fecha && (
              <p>
                <span className="font-semibold">Fecha menú:</span> {parsed.fecha}
              </p>
            )}
            {parsed.precioMenu !== undefined && (
              <p>
                <span className="font-semibold">Precio:</span> {parsed.precioMenu}{" "}
                €
              </p>
            )}
          </div>
          {parsed.observaciones && (
            <p className="text-sm text-muted">{parsed.observaciones}</p>
          )}

          <ListaPlatos titulo="Primeros" platos={parsed.primeros} />
          <ListaPlatos titulo="Segundos" platos={parsed.segundos} />

          <p className="rounded-xl bg-green-50 px-3 py-2 text-sm font-medium text-green-900">
            {menuActual.activo ? "Menú activo" : "Menú guardado"} ·{" "}
            {parsed.primeros.length} primeros, {parsed.segundos.length} segundos
            en comandas
          </p>
        </div>
      )}
    </SectionCard>
  );
}
