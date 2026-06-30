import { Suspense } from "react";
import { LoginPageClient } from "@/components/auth/LoginForm";

export const metadata = {
  title: "Iniciar sesión · Comandero",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-dvh max-w-lg items-center justify-center px-4">
          <p className="text-muted">Cargando…</p>
        </main>
      }
    >
      <LoginPageClient />
    </Suspense>
  );
}
