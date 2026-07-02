import { NextResponse } from "next/server";
import { extractText, getDocumentProxy } from "unpdf";
import {
  parseMenuDiaTexto,
  reformatMenuPdfTexto,
} from "@/lib/menu-dia/parse-menu-texto";

export const runtime = "nodejs";

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

    return NextResponse.json({ texto: textoFormateado, parsed });
  } catch (error) {
    console.error("[menu-dia/import]", error);
    return NextResponse.json(
      { error: "No se pudo leer el menú" },
      { status: 500 },
    );
  }
}
