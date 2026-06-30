import { CierreClient } from "@/components/cierre/CierreClient";
import { RequireAdmin } from "@/components/auth/RequireAdmin";

export const metadata = {
  title: "Cierre de servicio · Comandero",
};

export default function CierrePage() {
  return (
    <RequireAdmin>
      <CierreClient />
    </RequireAdmin>
  );
}
