"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { camareros } from "@/data/camareros";
import {
  ROLES,
  type Rol,
  type Usuario,
  type UsuarioInput,
} from "@/types/auth";

interface UsuarioEditorProps {
  usuario: Partial<Usuario> & { username: string };
  esNuevo?: boolean;
  puedeDesactivar: boolean;
  onGuardar: (datos: UsuarioInput) => void;
  onCancelar: () => void;
}

export function UsuarioEditor({
  usuario,
  esNuevo = false,
  puedeDesactivar,
  onGuardar,
  onCancelar,
}: UsuarioEditorProps) {
  const [username, setUsername] = useState(usuario.username);
  const [password, setPassword] = useState(usuario.password ?? "");
  const [nombre, setNombre] = useState(usuario.nombre ?? "");
  const [rol, setRol] = useState<Rol>(usuario.rol ?? "CAMARERO");
  const [camareroId, setCamareroId] = useState(
    usuario.camareroId ?? usuario.username ?? "",
  );
  const [activo, setActivo] = useState(usuario.activo ?? true);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    setError(null);
    if (!username.trim()) {
      setError("El usuario es obligatorio");
      return;
    }
    if (!nombre.trim()) {
      setError("El nombre visible es obligatorio");
      return;
    }
    if (esNuevo && !password.trim()) {
      setError("La contraseña es obligatoria para usuarios nuevos");
      return;
    }
    if (rol === "CAMARERO" && !camareroId.trim()) {
      setError("Indica el ID de camarero");
      return;
    }
    if (!activo && !puedeDesactivar) {
      setError("No puedes desactivar al único administrador activo");
      return;
    }

    onGuardar({
      username: username.trim().toLowerCase(),
      password: password.trim() || usuario.password || "",
      nombre: nombre.trim(),
      rol,
      camareroId: rol === "CAMARERO" ? camareroId.trim().toLowerCase() : null,
      activo,
    });
  };

  return (
    <div className="space-y-4 rounded-xl border-2 border-primary/30 bg-background p-4">
      <div>
        <label className="mb-1 block text-xs font-semibold text-muted">
          Usuario (login)
        </label>
        <input
          type="text"
          value={username}
          disabled={!esNuevo}
          onChange={(e) => setUsername(e.target.value.toLowerCase())}
          className="min-h-11 w-full rounded-xl border-2 border-border bg-card px-3 outline-none focus:border-primary disabled:opacity-60"
          autoComplete="off"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-muted">
          Nombre visible
        </label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="min-h-11 w-full rounded-xl border-2 border-border bg-card px-3 outline-none focus:border-primary"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-muted">
          {esNuevo ? "Contraseña" : "Nueva contraseña (dejar vacío para no cambiar)"}
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={esNuevo ? "" : "••••••••"}
          className="min-h-11 w-full rounded-xl border-2 border-border bg-card px-3 outline-none focus:border-primary"
          autoComplete="new-password"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted">
            Rol
          </label>
          <select
            value={rol}
            onChange={(e) => setRol(e.target.value as Rol)}
            className="min-h-11 w-full rounded-xl border-2 border-border bg-card px-3 outline-none focus:border-primary"
          >
            {ROLES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        {rol === "CAMARERO" && (
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted">
              ID camarero
            </label>
            {esNuevo ? (
              <input
                type="text"
                value={camareroId}
                onChange={(e) => setCamareroId(e.target.value.toLowerCase())}
                placeholder={username || "id-camarero"}
                className="min-h-11 w-full rounded-xl border-2 border-border bg-card px-3 outline-none focus:border-primary"
              />
            ) : (
              <select
                value={camareroId}
                onChange={(e) => setCamareroId(e.target.value)}
                className="min-h-11 w-full rounded-xl border-2 border-border bg-card px-3 outline-none focus:border-primary"
              >
                {camareros
                  .filter((c) => c.activo)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} ({c.id})
                    </option>
                  ))}
              </select>
            )}
          </div>
        )}
      </div>

      <button
        type="button"
        disabled={!activo && !puedeDesactivar}
        onClick={() => setActivo((v) => !v)}
        className={[
          "rounded-full border-2 px-4 py-2 text-sm font-semibold",
          activo
            ? "border-green-300 bg-green-50 text-green-800"
            : "border-border bg-card text-muted",
        ].join(" ")}
      >
        {activo ? "Usuario activo" : "Usuario inactivo"}
      </button>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <Button variant="outline" size="sm" fullWidth onClick={onCancelar}>
          Cancelar
        </Button>
        <Button size="sm" fullWidth onClick={handleSubmit}>
          Guardar
        </Button>
      </div>
    </div>
  );
}
