"use client";

import Link from "next/link";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { CamareroAccesosBar } from "@/components/navigation/CamareroAccesosBar";
import { useAuth } from "@/contexts/AuthContext";
import { getActiveBackendLabel } from "@/lib/data/data-layer";
import { isSupabaseEnvConfigured } from "@/lib/supabase/env";

const APP_VERSION = "1.0.0";

const accionesBase = [
  {
    titulo: "Mesas",
    descripcion: "Mapa de mesas por zonas",
    href: "/mesas",
    disponible: true,
    adminOnly: false,
  },
  {
    titulo: "Nueva comanda",
    descripcion: "Crear pedido de cocina y barra",
    href: "/comanda/nueva",
    disponible: true,
    adminOnly: false,
  },
  {
    titulo: "Postres",
    descripcion: "Comandero separado de postres",
    href: "/postres/nuevo",
    disponible: true,
    adminOnly: false,
  },
  {
    titulo: "Panel cocina",
    descripcion: "Ver comandas por secciones",
    href: "/panel?tab=cocina",
    disponible: true,
    adminOnly: false,
  },
  {
    titulo: "Historial",
    descripcion: "Comandas del día",
    href: "/historial",
    disponible: true,
    adminOnly: false,
  },
  {
    titulo: "Configurar mesas",
    descripcion: "Zonas, códigos y mesas B en Rambla",
    href: "/configuracion/mesas",
    disponible: true,
    adminOnly: true,
    permiso: "mesas" as const,
  },
  {
    titulo: "Usuarios",
    descripcion: "Crear camareros y gestionar accesos",
    href: "/configuracion/usuarios",
    disponible: true,
    adminOnly: true,
    permiso: "usuarios" as const,
  },
  {
    titulo: "Cierre de servicio",
    descripcion: "Resumen, exportar y cerrar el día",
    href: "/cierre",
    disponible: true,
    adminOnly: true,
    permiso: "cierre" as const,
  },
  {
    titulo: "Carta",
    descripcion: "Almuerzo, bebidas, postres y cenas",
    href: "/configuracion/carta",
    disponible: true,
    adminOnly: true,
    permiso: "carta" as const,
  },
  {
    titulo: "Menú del día",
    descripcion: "Configurar menú de hoy",
    href: "/configuracion/menu-dia",
    disponible: true,
    adminOnly: true,
    permiso: "menuDia" as const,
  },
  {
    titulo: "Impresora",
    descripcion: "Configurar impresora principal",
    href: "/configuracion/impresora",
    disponible: true,
    adminOnly: true,
    permiso: "impresora" as const,
  },
];

export function HomeClient() {
  const {
    sesion,
    usaSupabase,
    puedeConfigCarta,
    puedeConfigMenuDia,
    puedeConfigImpresora,
    puedeCierre,
    puedeAdminUsuarios,
    puedeConfigMesas,
  } = useAuth();

  const acciones = accionesBase.filter((accion) => {
    if (!accion.adminOnly) return true;
    if (accion.permiso === "mesas") return puedeConfigMesas;
    if (accion.permiso === "usuarios") return puedeAdminUsuarios;
    if (accion.permiso === "cierre") return puedeCierre;
    if (accion.permiso === "carta") return puedeConfigCarta;
    if (accion.permiso === "menuDia") return puedeConfigMenuDia;
    if (accion.permiso === "impresora") return puedeConfigImpresora;
    return true;
  });

  const backendLabel = getActiveBackendLabel();
  const supabaseConfigurado = isSupabaseEnvConfigured();

  const estadoItems: { color: "green" | "amber" | "red"; text: string }[] = [
    {
      color: "green",
      text: "Carta y menú del día configurables",
    },
    {
      color: "green",
      text: "Panel cocina, mesas e historial operativos",
    },
    {
      color: usaSupabase && supabaseConfigurado ? "green" : "amber",
      text:
        usaSupabase && supabaseConfigurado
          ? "Supabase conectado · sync automática ~10s entre dispositivos"
          : usaSupabase
            ? `Supabase pendiente de configurar (${backendLabel})`
            : "Modo local (datos solo en este dispositivo)",
    },
    {
      color: "green",
      text: usaSupabase
        ? "Usuarios y roles en Supabase"
        : "Usuarios y roles locales",
    },
  ];

  return (
    <RequireAuth>
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col px-4 py-6">
        <header className="mb-8 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-accent">
            La Taberneta de Ca la Ingrid
          </p>
          <h1 className="mt-2 text-3xl font-bold text-primary">Comandero</h1>
          <p className="mt-2 text-muted">
            {sesion ? `Hola, ${sesion.nombre}` : "Web app para camareros"}
          </p>
        </header>

        <CamareroAccesosBar className="mb-6" />

        <section className="mb-8 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Acceso rápido</h2>
          <p className="mt-1 text-sm text-muted">Toca una opción para empezar</p>

          <ul className="mt-4 space-y-3">
            {acciones.map((accion) => (
              <li key={accion.titulo}>
                {accion.disponible ? (
                  <Link
                    href={accion.href}
                    className="flex min-h-14 items-center justify-between rounded-xl bg-primary px-4 py-3 text-primary-foreground transition active:scale-[0.98]"
                  >
                    <div>
                      <p className="font-semibold">{accion.titulo}</p>
                      <p className="text-sm opacity-80">{accion.descripcion}</p>
                    </div>
                    <span aria-hidden="true">→</span>
                  </Link>
                ) : (
                  <div
                    className="flex min-h-14 items-center justify-between rounded-xl border border-border bg-background px-4 py-3 opacity-60"
                    aria-disabled="true"
                  >
                    <div>
                      <p className="font-semibold">{accion.titulo}</p>
                      <p className="text-sm text-muted">{accion.descripcion}</p>
                    </div>
                    <span className="rounded-full bg-border px-2 py-0.5 text-xs font-medium text-muted">
                      Próximamente
                    </span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-dashed border-border bg-card/50 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Estado del proyecto
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            {estadoItems.map((item) => (
              <li key={item.text} className="flex items-center gap-2">
                <span
                  className={[
                    "h-2 w-2 shrink-0 rounded-full",
                    item.color === "green"
                      ? "bg-green-500"
                      : item.color === "amber"
                        ? "bg-amber-500"
                        : "bg-red-500",
                  ].join(" ")}
                />
                {item.text}
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-auto pt-8 text-center text-xs text-muted">
          <p>comandero-taberneta v{APP_VERSION}</p>
          <p className="mt-1">Guarda esta web en la pantalla de inicio del móvil</p>
        </footer>
      </main>
    </RequireAuth>
  );
}
