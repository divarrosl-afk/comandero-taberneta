"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { getActiveBackendLabel } from "@/lib/data/data-layer";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { iniciarSesion, usaSupabase } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      const ok = await iniciarSesion(username, password);
      if (!ok) {
        setError("Usuario o contraseña incorrectos");
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
