import { UsuariosConfigClient } from "@/components/usuarios/UsuariosConfigClient";
import { RequireAdmin } from "@/components/auth/RequireAdmin";

export const metadata = {
  title: "Usuarios · Comandero",
};

export default function UsuariosConfigPage() {
  return (
    <RequireAdmin>
      <UsuariosConfigClient />
    </RequireAdmin>
  );
}
