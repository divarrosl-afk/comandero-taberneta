/** Supabase Auth exige mínimo 6 caracteres en contraseñas. */
export const MIN_SEED_PASSWORD_LENGTH = 6;

export function isSeedPasswordTooShort(password) {
  return (password?.trim() ?? "").length < MIN_SEED_PASSWORD_LENGTH;
}

export function formatSeedPasswordError(secretName) {
  return `${secretName} debe tener al menos ${MIN_SEED_PASSWORD_LENGTH} caracteres (requisito Supabase Auth). Actualiza el secreto en GitHub → Settings → Secrets → Actions.`;
}

/**
 * Valida longitud sin imprimir valores. Devuelve mensajes de error.
 */
export function collectSeedPasswordIssues(env = process.env) {
  const issues = [];
  const admin = env.SEED_ADMIN_PASSWORD?.trim() ?? "";
  const camarero = env.SEED_CAMARERO_PASSWORD?.trim() ?? "";

  if (!admin) {
    issues.push("Falta SEED_ADMIN_PASSWORD");
  } else if (isSeedPasswordTooShort(admin)) {
    issues.push(formatSeedPasswordError("SEED_ADMIN_PASSWORD"));
  }

  if (!camarero) {
    issues.push("Falta SEED_CAMARERO_PASSWORD");
  } else if (isSeedPasswordTooShort(camarero)) {
    issues.push(formatSeedPasswordError("SEED_CAMARERO_PASSWORD"));
  }

  return issues;
}
