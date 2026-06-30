import { redirect } from "next/navigation";

export const metadata = {
  title: "Catálogo · Comandero",
};

/** Redirige al nuevo editor de carta */
export default function CatalogoConfigPage() {
  redirect("/configuracion/carta");
}
