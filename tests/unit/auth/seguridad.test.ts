import { describe, expect, it } from "vitest";
import { autenticarUsuario } from "@/lib/auth/credentials";
import { guardarUsuarios } from "@/lib/storage/usuarios";
import { usuariosIniciales } from "@/data/usuarios";

describe("seguridad auth local", () => {
  it("camarero autentica con credenciales válidas", () => {
    const sesion = autenticarUsuario("david", "camarero");
    expect(sesion?.rol).toBe("CAMARERO");
    expect(sesion?.username).toBe("david");
  });

  it("admin autentica", () => {
    const sesion = autenticarUsuario("divarro", "admin");
    expect(sesion?.rol).toBe("ADMIN");
  });

  it("usuario inactivo no puede entrar", () => {
    const inactivos = usuariosIniciales.map((u) =>
      u.username === "david" ? { ...u, activo: false } : u,
    );
    guardarUsuarios(inactivos);
    expect(autenticarUsuario("david", "camarero")).toBeNull();
  });

  it("contraseña incorrecta rechazada", () => {
    expect(autenticarUsuario("david", "mala")).toBeNull();
  });
});
