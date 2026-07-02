"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import type { LoginError } from "@/lib/auth/auth-repository";
import { getActiveBackendLabel } from "@/lib/data/data-layer";

function loginErrorMessage(error: LoginError | undefined): string {
  switch (error) {
    case "no_perfil":
      return "El usuario existe en Auth pero no tiene perfil. Ejecuta Supabase seed en GitHub Actions.";
    case "inactive":
      return "Usuario desactivado. Contacta con el administrador.";
    case "credentials":
      return "Usuario o contraseña incorrectos. En producción usa la contraseña de SEED_ADMIN_PASSWORD (GitHub Secrets), no «admin» del modo local.";
    default:
      return "Usuario o contraseña incorrectos";
  }
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { iniciarSesion, usaSupabase } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [seedHint, setSeedHint] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!usaSupabase) return;
    void fetch("/api/auth/status")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.seedRequired) {
          setSeedHint(
            "Aún no hay usuarios en Supabase. GitHub → Actions → Supabase seed → Run workflow → indica admin_password y camarero_password.",
          );
        }
      })
      .catch(() => {
        /* opcional */
      });
  }, [usaSupabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      const result = await iniciarSesion(username, password);
      if (!result.sesion) {
        setError(loginErrorMessage(result.error));
        return;
      }

      const redirect = searchParams.get("redirect");
      router.replace(redirect && redirect.startsWith("/") ? redirect : "/");
    } catch {
      setError("No se pudo iniciar sesión. Comprueba la conexión.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {seedHint && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {seedHint}
        </p>
      )}

      <div>
        <label
          htmlFor="username"
          className="mb-1 block text-sm font-semibold text-foreground"
        >
          Usuario
        </label>
        <input
          id="username"
          type="text"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full rounded-xl border-2 border-border bg-card px-4 py-3 text-base outline-none focus:border-primary"
          placeholder="divarro, david…"
          required
          disabled={cargando}
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1 block text-sm font-semibold text-foreground"
        >
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border-2 border-border bg-card px-4 py-3 text-base outline-none focus:border-primary"
          required
          disabled={cargando}
        />
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
          {error}
        </p>
      )}

      <Button type="submit" fullWidth size="lg" disabled={cargando}>
        {cargando ? "Entrando…" : "Iniciar sesión"}
      </Button>

      <p className="text-center text-xs text-muted">
        Backend: {getActiveBackendLabel()}
        {usaSupabase ? " · Supabase Auth" : " · acceso local"}
      </p>

      {usaSupabase && (
        <p className="text-center text-xs text-muted">
          Usuario <strong>divarro</strong> · contraseña = la de{" "}
          <code className="text-[10px]">SEED_ADMIN_PASSWORD</code> en GitHub Secrets
        </p>
      )}
    </form>
  );
}

export function LoginPageClient() {
  const { usaSupabase } = useAuth();

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-4 py-8">
      <header className="mb-8 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-accent">
          La Taberneta de Ca la Ingrid
        </p>
        <h1 className="mt-2 text-3xl font-bold text-primary">Comandero</h1>
        <p className="mt-2 text-muted">Inicia sesión para continuar</p>
      </header>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <LoginForm />
      </section>

      {!usaSupabase && (
        <footer className="mt-8 text-center text-xs text-muted">
          <p>Usuarios de prueba: divarro / admin · david / camarero</p>
        </footer>
      )}
    </main>
  );
}
