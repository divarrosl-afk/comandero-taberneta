export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-bold text-primary">Sin conexión</h1>
      <p className="mt-3 text-muted">
        No hay red disponible. Comprueba el Wi-Fi del restaurante e inténtalo de
        nuevo.
      </p>
    </main>
  );
}
