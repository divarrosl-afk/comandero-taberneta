"use client";

import Link from "next/link";
import { useState } from "react";
import { UsuarioEditor } from "@/components/usuarios/UsuarioEditor";
import { Button } from "@/components/ui/Button";
import { useUsuarios } from "@/hooks/useUsuarios";
import { useAuth } from "@/contexts/AuthContext";
import type { UsuarioInput } from "@/types/auth";

function formatUltimoAcceso(iso: string | null): string {
  if (!iso) return "Nunca";
  return new Date(iso).toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function UsuariosConfigClient() {
  const { sesion } = useAuth();
  const { usuarios, crear, actualizar, puedeDesactivar } = useUsuarios();
  const [editando, setEditando] = useState<string | null>(null);
  const [nuevo, setNuevo] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const lista = [...usuarios].sort((a, b) =>
    a.username.localeCompare(b.username, "es"),
  );

  const handleCrear = (datos: UsuarioInput) => {
    try {
      crear(datos);
      setNuevo(false);
      setMensaje(`Usuario ${datos.username} creado`);
    } catch (e) {
      setMensaje(e instanceof Error ? e.message : "Error al crear usuario");
    }
  };

  const handleActualizar = (username: string, datos: UsuarioInput) => {
    const cambios: Partial<typeof datos> = {
      nombre: datos.nombre,
      rol: datos.rol,
      camareroId: datos.camareroId,
      activo: datos.activo,
    };
    if (datos.password) cambios.password = datos.password;

    actualizar(username, cambios);
    setEditando(null);
    setMensaje(`Usuario ${username} actualizado`);
  };

  return (
    <main className="mx-auto min-h-dvh max-w-lg px-4 py-4 pb-8">
      <header className="mb-4">
        <Link
          href="/"
          className="mb-2 inline-block text-sm font-semibold text-accent"
        >
          ← Inicio
        </Link>
        <h1 className="text-2xl font-bold text-primary">Usuarios</h1>
        <p className="mt-1 text-sm text-muted">
          Administración de accesos · localStorage
        </p>
      </header>

      {mensaje && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
          {mensaje}
          <button
            type="button"
            onClick={() => setMensaje(null)}
            className="ml-2 underline"
          >
            Cerrar
          </button>
        </div>
      )}

      <div className="mb-4">
        <Button
          variant="outline"
          fullWidth
          onClick={() => {
            setNuevo(true);
            setEditando(null);
          }}
        >
          + Crear usuario
        </Button>
      </div>

      {nuevo && (
        <div className="mb-4">
          <UsuarioEditor
            usuario={{ username: "", rol: "CAMARERO", activo: true }}
            esNuevo
            puedeDesactivar
            onGuardar={handleCrear}
            onCancelar={() => setNuevo(false)}
          />
        </div>
      )}

      <div className="space-y-2">
        {lista.map((u) =>
          editando === u.username ? (
            <UsuarioEditor
              key={u.username}
              usuario={u}
              puedeDesactivar={puedeDesactivar(u.username)}
              onGuardar={(datos) => handleActualizar(u.username, datos)}
              onCancelar={() => setEditando(null)}
            />
          ) : (
            <article
              key={u.username}
              className={[
                "rounded-xl border-2 bg-card p-4",
                u.activo ? "border-border" : "border-dashed opacity-60",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold">
                    {u.nombre}
                    {u.username === sesion?.username && (
                      <span className="ml-2 text-xs font-normal text-muted">
                        (tú)
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-muted">@{u.username}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span
                      className={[
                        "rounded-full px-2 py-0.5 text-xs font-bold uppercase",
                        u.rol === "ADMIN"
                          ? "bg-amber-100 text-amber-900"
                          : "bg-sky-100 text-sky-900",
                      ].join(" ")}
                    >
                      {u.rol === "ADMIN" ? "Admin" : "Camarero"}
                    </span>
                    <span
                      className={[
                        "rounded-full px-2 py-0.5 text-xs font-semibold",
                        u.activo
                          ? "bg-green-100 text-green-800"
                          : "bg-stone-200 text-stone-600",
                      ].join(" ")}
                    >
                      {u.activo ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted">
                    Último acceso: {formatUltimoAcceso(u.ultimoAcceso)}
                  </p>
                  {u.camareroId && (
                    <p className="text-xs text-muted">
                      Camarero ID: {u.camareroId}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditando(u.username);
                    setNuevo(false);
                  }}
                  className="shrink-0 rounded-lg border border-border px-3 py-2 text-sm font-semibold"
                >
                  Editar
                </button>
              </div>
            </article>
          ),
        )}
      </div>
    </main>
  );
}
