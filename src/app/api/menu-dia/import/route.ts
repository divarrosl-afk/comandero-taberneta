import { NextResponse } from "next/server";
import { extractText, getDocumentProxy } from "unpdf";
import { importadosDesdeParsed } from "@/lib/menu-dia/menu-platos-comanda";
import { guardarMenuConToken } from "@/lib/menu-dia/menu-dia-server";
import {
  parseMenuDiaTexto,
  reformatMenuPdfTexto,
} from "@/lib/menu-dia/parse-menu-texto";
import { verifyAdminRequest } from "@/lib/supabase/api-auth";
import type { MenuDiaConfig } from "@/types/menu-dia";

export const runtime = "nodejs";

function configDesdeParsed(
  parsed: ReturnType<typeof parseMenuDiaTexto>,
): MenuDiaConfig {
  const { primerosImportados, segundosImportados } = importadosDesdeParsed(
    parsed.primeros,
    parsed.segundos,
  );

  return {
    fecha: parsed.fecha ?? new Date().toISOString().slice(0, 10),
    precioMenu: parsed.precioMenu ?? 14,
    primerosIds: [],
    segundosIds: [],
    postresIncluidosIds: [],
    primerosImportados,
    segundosImportados,
    observaciones: parsed.observaciones,
    activo: primerosImportados.length > 0 || segundosImportados.length > 0,
  };
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    let texto = "";

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");
      if (!(file instanceof File)) {
        return NextResponse.json(
          { error: "Falta el archivo PDF" },
          { status: 400 },
        );
      }
      const buffer = new Uint8Array(await file.arrayBuffer());
      const pdf = await getDocumentProxy(buffer);
      const extracted = await extractText(pdf, { mergePages: true });
      const raw = extracted.text;
      texto = Array.isArray(raw) ? raw.join(" ") : String(raw ?? "");
    } else {
      const body = (await request.json()) as { texto?: string };
      texto = body.texto?.trim() ?? "";
    }

    if (!texto) {
      return NextResponse.json({ error: "Texto vacío" }, { status: 400 });
    }

    const textoFormateado = texto.includes("\n")
      ? texto
      : reformatMenuPdfTexto(texto);
    const parsed = parseMenuDiaTexto(textoFormateado);

    const auth = await verifyAdminRequest(request);
    let menu: MenuDiaConfig | undefined;
    let guardadoEnServidor = false;
    let errorGuardado: string | undefined;

    if (auth.ok) {
      try {
        const config = configDesdeParsed(parsed);
        menu = await guardarMenuConToken(
          request.headers.get("authorization")!.slice(7),
          config,
        );
        guardadoEnServidor = true;
      } catch (error) {
        errorGuardado =
          error instanceof Error ? error.message : "Error al guardar en servidor";
      }
    }

    return NextResponse.json({
      texto: textoFormateado,
      parsed,
      menu,
      guardadoEnServidor,
      errorGuardado,
    });
  } catch (error) {
    console.error("[menu-dia/import]", error);
    return NextResponse.json(
      { error: "No se pudo leer el menú" },
      { status: 500 },
    );
  }
}
