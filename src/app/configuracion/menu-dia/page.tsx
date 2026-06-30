import { MenuDiaConfigClient } from "@/components/configuracion/MenuDiaConfigClient";
import { RequireAdmin } from "@/components/auth/RequireAdmin";

export const metadata = {
  title: "Menú del día · Comandero",
};

export default function MenuDiaConfigPage() {
  return (
    <RequireAdmin>
      <MenuDiaConfigClient />
    </RequireAdmin>
  );
}
