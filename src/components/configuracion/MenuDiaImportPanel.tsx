"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { SectionCard } from "@/components/ui/SectionCard";
import {
  idsDesdeMatch,
  matchMenuConCatalogo,
  type MenuDiaMatchResult,
} from "@/lib/menu-dia/match-catalogo";
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

  const analizarTexto = (contenido: string) => {
    setError(null);
    const res = fetch("/api/menu-dia/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto: contenido }),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error("Error al analizar");
        return r.json() as Promise<{
          parsed: MenuDiaParseado;
        }>;
      })
      .then((data) => {
        setParsed(data.parsed);
        setMatch(
          matchMenuConCatalogo(
            data.parsed.primeros,
            data.parsed.segundos,
            productos,
          ),
        );
      });
    return res;
  };

  const handleAnalizar = async () => {
    if (!texto.trim()) return;
    setCargando(true);
    try {
      await analizarTexto(texto);
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
      setMatch(
        matchMenuConCatalogo(
          data.parsed.primeros,
          data.parsed.segundos,
          productos,
        ),
      );
    } catch {
      setError("No se pudo leer el PDF. Prueba a pegar el texto.");
    } finally {
      setCargando(false);
    }
  };

  const handleAplicar = async () => {
    if (!parsed || !match) return;
    const { primerosIds, segundosIds, suplementosProducto } =
      idsDesdeMatch(match);

    await onAplicar(
      {
        fecha: parsed.fecha,
        precioMenu: parsed.precioMenu,
        primerosIds,
        segundosIds,
        observaciones: parsed.observaciones,
        activo: primerosIds.length > 0 || segundosIds.length > 0,
      },
      suplementosProducto,
    );
  };

  return (
    <SectionCard title="Importar menú (PDF o texto)">
      <p className="mb-3 text-xs text-muted">
        Sube el PDF del menú del día o pega el texto. Se detectan platos,
        precio, fecha y suplementos (+3 €, +5 €…).
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
          Subir PDF
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
              {match.sinMatch.length} plato(s) sin coincidencia — revísalos en
              carta o selecciónalos a mano abajo.
            </p>
          )}

          <Button fullWidth onClick={handleAplicar}>
            Aplicar al menú de hoy
          </Button>
        </div>
      )}
    </SectionCard>
  );
}
