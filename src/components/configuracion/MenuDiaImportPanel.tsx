"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { SectionCard } from "@/components/ui/SectionCard";
import {
  idsDesdeMatch,
  matchMenuConCatalogo,
  type MenuDiaMatchResult,
} from "@/lib/menu-dia/match-catalogo";
import { importadosDesdeMatch } from "@/lib/menu-dia/menu-platos-comanda";
import type { MenuDiaParseado } from "@/lib/menu-dia/parse-menu-texto";
import type { MenuDiaConfig } from "@/types/menu-dia";
import type { ProductoCatalogo } from "@/types/catalogo";

interface MenuDiaImportPanelProps {
  productos: ProductoCatalogo[];
  onAplicar: (
    cambios: Partial<MenuDiaConfig>,
    suplementosProducto: { id: string; suplemento: number }[],
  ) => Promise<void>;
}

function ListaMatch({
  titulo,
  items,
}: {
  titulo: string;
  items: MenuDiaMatchResult["primeros"];
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-bold">{titulo}</p>
      <ul className="space-y-1 text-sm">
        {items.map((item, i) => (
          <li
            key={i}
            className={[
              "rounded-lg px-2 py-1",
              item.confianza === "sin_match"
                ? "bg-red-50 text-red-800"
                : item.confianza === "baja"
                  ? "bg-amber-50 text-amber-900"
                  : "bg-green-50 text-green-900",
            ].join(" ")}
          >
            {item.parseado.nombre}
            {item.parseado.suplemento
              ? ` (+${item.parseado.suplemento} €)`
              : ""}
            {item.productoNombre ? (
              <span className="block text-xs opacity-80">
                → {item.productoNombre}
              </span>
            ) : (
              <span className="block text-xs">Sin coincidencia en carta</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MenuDiaImportPanel({
  productos,
  onAplicar,
}: MenuDiaImportPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [texto, setTexto] = useState("");
  const [parsed, setParsed] = useState<MenuDiaParseado | null>(null);
  const [match, setMatch] = useState<MenuDiaMatchResult | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const aplicarResultado = async (
    parsed: MenuDiaParseado,
    matchResult: MenuDiaMatchResult,
  ) => {
    const { primerosIds, segundosIds, suplementosProducto } =
      idsDesdeMatch(matchResult);
    const { primerosImportados, segundosImportados } =
      importadosDesdeMatch(matchResult);

    await onAplicar(
      {
        fecha: parsed.fecha,
        precioMenu: parsed.precioMenu,
        primerosIds,
        segundosIds,
        primerosImportados,
        segundosImportados,
        observaciones: parsed.observaciones,
        activo: primerosImportados.length > 0 || segundosImportados.length > 0,
      },
      suplementosProducto,
    );
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
    setParsed(data.parsed);
    const matchResult = matchMenuConCatalogo(
      data.parsed.primeros,
      data.parsed.segundos,
      productos,
    );
    setMatch(matchResult);
    return { parsed: data.parsed, matchResult };
  };

  const handleAnalizar = async () => {
    if (!texto.trim()) return;
    setCargando(true);
    try {
      const { parsed, matchResult } = await analizarTexto(texto);
      await aplicarResultado(parsed, matchResult);
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
      setParsed(data.parsed);
      const matchResult = matchMenuConCatalogo(
        data.parsed.primeros,
        data.parsed.segundos,
        productos,
      );
      setMatch(matchResult);
      await aplicarResultado(data.parsed, matchResult);
    } catch {
      setError("No se pudo leer el PDF. Prueba a pegar el texto.");
    } finally {
      setCargando(false);
    }
  };

  const handleAplicar = async () => {
    if (!parsed || !match) return;
    await aplicarResultado(parsed, match);
  };

  return (
    <SectionCard title="Menú del día — subir PDF">
      <p className="mb-3 text-sm text-muted">
        Sube el PDF que generas en la app cada mañana. Los platos aparecen
        automáticamente en <strong>nueva comanda → Menú</strong> (primeros y
        segundos), listos para pulsar.
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
          {cargando ? "Cargando menú…" : "Subir PDF de hoy"}
        </Button>
        <Button size="sm" onClick={handleAnalizar} disabled={cargando || !texto.trim()}>
          {cargando ? "Leyendo…" : "Analizar texto"}
        </Button>
      </div>

      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        rows={6}
        placeholder="Pega aquí el menú o sube un PDF…"
        className="mb-3 w-full rounded-xl border-2 border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
      />

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      {parsed && match && (
        <div className="space-y-4 border-t border-border pt-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            {parsed.fecha && (
              <p>
                <span className="font-semibold">Fecha:</span> {parsed.fecha}
              </p>
            )}
            {parsed.precioMenu !== undefined && (
              <p>
                <span className="font-semibold">Precio:</span> {parsed.precioMenu} €
              </p>
            )}
          </div>
          {parsed.observaciones && (
            <p className="text-sm text-muted">{parsed.observaciones}</p>
          )}

          <ListaMatch titulo="Primeros" items={match.primeros} />
          <ListaMatch titulo="Segundos" items={match.segundos} />

          {match.sinMatch.length > 0 && (
            <p className="text-xs text-amber-800">
              {match.sinMatch.length} plato(s) sin coincidencia en carta — igual
              aparecen en comanda con el nombre del PDF.
            </p>
          )}

          {parsed && (
            <p className="rounded-xl bg-green-50 px-3 py-2 text-sm font-medium text-green-900">
              Menú activo · {parsed.primeros.length} primeros,{" "}
              {parsed.segundos.length} segundos en comandas
            </p>
          )}
        </div>
      )}
    </SectionCard>
  );
}
