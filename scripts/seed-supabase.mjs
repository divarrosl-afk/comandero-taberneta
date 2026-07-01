#!/usr/bin/env node
/**
 * Seed inicial Supabase — Comandero Taberneta (Fase 1)
 *
 * Uso:
 *   NEXT_PUBLIC_SUPABASE_URL=... \
 *   SUPABASE_SERVICE_ROLE_KEY=... \
 *   NEXT_PUBLIC_RESTAURANTE_ID=b1c2d3e4-f5a6-4789-a012-3456789abcde \
 *   SEED_ADMIN_PASSWORD=... \
 *   SEED_CAMARERO_PASSWORD=... \
 *   node scripts/seed-supabase.mjs
 *
 * No incluye contraseñas en el repositorio.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const restauranteId =
  process.env.NEXT_PUBLIC_RESTAURANTE_ID?.trim() ??
  "b1c2d3e4-f5a6-4789-a012-3456789abcde";
const adminPassword = process.env.SEED_ADMIN_PASSWORD?.trim();
const camareroPassword = process.env.SEED_CAMARERO_PASSWORD?.trim();

if (!url || !serviceKey) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

if (!adminPassword || !camareroPassword) {
  console.error(
    "Define SEED_ADMIN_PASSWORD y SEED_CAMARERO_PASSWORD en el entorno",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const USUARIOS = [
  {
    username: "divarro",
    nombre: "Divarro",
    rol: "ADMIN",
    camareroId: null,
    password: adminPassword,
  },
  {
    username: "david",
    nombre: "David",
    rol: "CAMARERO",
    camareroId: "david",
    password: camareroPassword,
  },
  {
    username: "ingrid",
    nombre: "Ingrid",
    rol: "CAMARERO",
    camareroId: "ingrid",
    password: camareroPassword,
  },
  {
    username: "cocina",
    nombre: "Cocina",
    rol: "CAMARERO",
    camareroId: "cocina",
    password: camareroPassword,
  },
];

function email(username) {
  return `${username}@taberneta.local`;
}

async function ensureRestaurante() {
  const { data } = await supabase
    .from("restaurantes")
    .select("id")
    .eq("id", restauranteId)
    .maybeSingle();

  if (data) {
    console.log("✓ Restaurante ya existe");
    return;
  }

  const { error } = await supabase.from("restaurantes").insert({
    id: restauranteId,
    nombre: "La Taberneta de Ca la Ingrid",
    slug: "la-taberneta",
    activo: true,
  });

  if (error) throw new Error(`Restaurante: ${error.message}`);
  console.log("✓ Restaurante creado");
}

async function ensureUsuario(u) {
  const { data: existente } = await supabase
    .from("perfiles")
    .select("id, auth_user_id")
    .eq("restaurante_id", restauranteId)
    .eq("username", u.username)
    .maybeSingle();

  if (existente?.auth_user_id) {
    console.log(`✓ Usuario ${u.username} ya existe`);
    return;
  }

  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email: email(u.username),
      password: u.password,
      email_confirm: true,
    });

  if (authError || !authData.user) {
    throw new Error(`${u.username} Auth: ${authError?.message}`);
  }

  const { error: perfilError } = await supabase.from("perfiles").insert({
    auth_user_id: authData.user.id,
    restaurante_id: restauranteId,
    username: u.username,
    nombre: u.nombre,
    rol: u.rol,
    camarero_id: u.camareroId,
    activo: true,
  });

  if (perfilError) {
    await supabase.auth.admin.deleteUser(authData.user.id);
    throw new Error(`${u.username} perfil: ${perfilError.message}`);
  }

  console.log(`✓ Usuario ${u.username} creado`);
}

async function seedMesasFromJson() {
  const mesasPath = join(__dirname, "seed-data", "mesas.json");
  let mesas;
  try {
    mesas = JSON.parse(readFileSync(mesasPath, "utf8"));
  } catch {
    console.log("· Sin scripts/seed-data/mesas.json — omite mesas");
    return;
  }

  const { count } = await supabase
    .from("mesas")
    .select("id", { count: "exact", head: true })
    .eq("restaurante_id", restauranteId)
    .is("deleted_at", null);

  if (count && count > 0) {
    console.log("✓ Mesas ya existen");
    return;
  }

  const rows = mesas.map((m) => ({
    ...m,
    restaurante_id: restauranteId,
    id: crypto.randomUUID(),
  }));

  const codigoToId = new Map(rows.map((m) => [m.codigo, m.id]));
  for (const m of rows) {
    if (m.mesa_principal_codigo) {
      m.mesa_principal_id = codigoToId.get(m.mesa_principal_codigo) ?? null;
      delete m.mesa_principal_codigo;
    }
  }

  const { error } = await supabase.from("mesas").insert(rows);
  if (error) throw new Error(`Mesas: ${error.message}`);
  console.log(`✓ ${rows.length} mesas insertadas`);
}

async function main() {
  console.log("Seed Supabase — Comandero Taberneta\n");

  await ensureRestaurante();

  for (const u of USUARIOS) {
    await ensureUsuario(u);
  }

  await seedMesasFromJson();

  console.log("\nListo. Configura .env.local y prueba login en /login");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
