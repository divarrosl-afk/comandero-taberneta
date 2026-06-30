import { CartaConfigClient } from "@/components/configuracion/CartaConfigClient";
import { RequireAdmin } from "@/components/auth/RequireAdmin";

export const metadata = {
  title: "Carta · Comandero",
};

export default function CartaConfigPage() {
  return (
    <RequireAdmin>
      <CartaConfigClient />
    </RequireAdmin>
  );
}
