const AUTH_EMAIL_DOMAIN = "taberneta.local";

export function usernameToAuthEmail(username: string): string {
  return `${username.trim().toLowerCase()}@${AUTH_EMAIL_DOMAIN}`;
}

export function authEmailToUsername(email: string): string {
  const lower = email.trim().toLowerCase();
  const suffix = `@${AUTH_EMAIL_DOMAIN}`;
  if (!lower.endsWith(suffix)) return lower.split("@")[0] ?? lower;
  return lower.slice(0, -suffix.length);
}
