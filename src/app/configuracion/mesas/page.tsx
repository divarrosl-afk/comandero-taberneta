import { MesasConfigClient } from "@/components/configuracion/MesasConfigClient";
import { RequireAdmin } from "@/components/auth/RequireAdmin";

export const metadata = {
  title: "Configurar mesas · Comandero",
};

export default function MesasConfigPage() {
  return (
    <RequireAdmin>
      <MesasConfigClient />
    </RequireAdmin>
  );
}
