import { ImpresoraConfigClient } from "@/components/configuracion/ImpresoraConfigClient";
import { RequireAdmin } from "@/components/auth/RequireAdmin";

export const metadata = {
  title: "Configurar impresora · Comandero",
};

export default function ImpresoraConfigPage() {
  return (
    <RequireAdmin>
      <ImpresoraConfigClient />
    </RequireAdmin>
  );
}
