import { describe, expect, it } from "vitest";
import { authRepositoryLocal } from "@/lib/auth/auth-repository-local";

describe("authRepositoryLocal", () => {
  it("login válido devuelve sesión", async () => {
    const result = await authRepositoryLocal.login("david", "camarero");
    expect(result.sesion?.username).toBe("david");
  });

  it("login inválido devuelve null", async () => {
    const result = await authRepositoryLocal.login("david", "wrong");
    expect(result.sesion).toBeNull();
    expect(result.error).toBe("credentials");
  });

  it("restoreSession tras login", async () => {
    await authRepositoryLocal.login("ingrid", "camarero");
    const restored = await authRepositoryLocal.restoreSession();
    expect(restored?.username).toBe("ingrid");
    await authRepositoryLocal.logout();
    expect(await authRepositoryLocal.restoreSession()).toBeNull();
  });
});
