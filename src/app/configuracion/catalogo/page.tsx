import { CatalogoConfigClient } from "@/components/configuracion/CatalogoConfigClient";
import { RequireAdmin } from "@/components/auth/RequireAdmin";

export const metadata = {
  title: "Catálogo de platos · Comandero",
};

export default function CatalogoConfigPage() {
  return (
    <RequireAdmin>
      <CatalogoConfigClient />
    </RequireAdmin>
  );
}
