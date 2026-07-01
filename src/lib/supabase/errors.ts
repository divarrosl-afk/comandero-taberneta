import type { PostgrestError } from "@supabase/supabase-js";

export function throwIfSupabaseError(
  error: PostgrestError | null,
  context: string,
): void {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }
}

export function isDuplicateKeyError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return (
    msg.includes("duplicate key") ||
    msg.includes("23505") ||
    msg.includes("already exists")
  );
}
