#!/usr/bin/env bash
# Copia de seguridad del estado estable de Comandero Taberneta.
# Uso: ./scripts/backup-estado.sh [etiqueta]
# Requiere: git, opcionalmente SUPABASE_DB_URL para dump SQL.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FECHA="$(date -u +%Y-%m-%d)"
TAG="${1:-v1.0-estable-${FECHA}}"
BACKUP_DIR="${ROOT}/backups/${TAG}"

cd "$ROOT"

echo "==> Comandero Taberneta — backup ${TAG}"
mkdir -p "$BACKUP_DIR"

# 1. Snapshot del código (tag git)
if git rev-parse "$TAG" >/dev/null 2>&1; then
  echo "    Tag ${TAG} ya existe — se reutiliza."
else
  git tag -a "$TAG" -m "Estado estable pre-optimización (${FECHA})"
  echo "    Tag creado: ${TAG} ($(git rev-parse --short HEAD))"
fi

# 2. Esquema y migraciones (siempre reproducibles desde el repo)
cp -r supabase/schema.sql supabase/bootstrap-all.sql supabase/migrations "$BACKUP_DIR/"
echo "    Esquema Supabase copiado a backups/${TAG}/"

# 3. Manifesto del commit
{
  echo "tag=${TAG}"
  echo "fecha_utc=${FECHA}"
  echo "commit=$(git rev-parse HEAD)"
  echo "commit_short=$(git rev-parse --short HEAD)"
  echo "branch=$(git branch --show-current)"
  echo "node=$(node -v 2>/dev/null || echo n/a)"
  echo "tests=$(npm test -- --run 2>/dev/null | grep -E '^\\s+Tests' | tail -1 || echo n/a)"
} > "${BACKUP_DIR}/manifest.txt"

# 4. Dump PostgreSQL (opcional — necesita SUPABASE_DB_URL)
if [[ -n "${SUPABASE_DB_URL:-}" ]] && command -v pg_dump >/dev/null 2>&1; then
  echo "    Volcando tablas críticas de Supabase..."
  pg_dump "$SUPABASE_DB_URL" \
    --no-owner --no-acl \
    --table=public.productos \
    --table=public.mesas \
    --table=public.comandas_cocina \
    --table=public.comandas_postres \
    --table=public.menus_dia \
    --table=public.perfiles \
    --table=public.cierres \
    --table=public.print_jobs \
    --table=public.audit_log \
    -f "${BACKUP_DIR}/supabase-datos.sql"
  echo "    Dump guardado: backups/${TAG}/supabase-datos.sql"
elif [[ -n "${SUPABASE_DB_URL:-}" ]]; then
  echo "    AVISO: SUPABASE_DB_URL definida pero pg_dump no instalado."
else
  echo "    AVISO: Sin SUPABASE_DB_URL — solo backup de código/esquema."
  echo "    Para dump de datos: SUPABASE_DB_URL='postgresql://...' ./scripts/backup-estado.sh"
fi

# 5. Checklist de secretos (nombres, no valores)
cat > "${BACKUP_DIR}/checklist-secretos.txt" <<'EOF'
Guardar en gestor de contraseñas (1Password, Bitwarden, etc.):

Vercel (proyecto comandero-taberneta):
  - NEXT_PUBLIC_DATA_BACKEND
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY (o PUBLISHABLE_KEY)
  - NEXT_PUBLIC_RESTAURANTE_ID
  - SUPABASE_SERVICE_ROLE_KEY
  - PRINT_POLL_API_KEY (si impresión cloud)
  - SETUP_BOOTSTRAP_TOKEN (si existe)

Supabase Dashboard:
  - Database password (para SUPABASE_DB_URL)
  - Activar backups automáticos (plan Pro) o export manual semanal

Print-server (Lenovo / mini PC):
  - print-server/.env completo

GitHub (si usas Actions):
  - Ver docs/GITHUB-SECRETS.md

Restaurar:
  1. git checkout <tag>
  2. Ejecutar supabase/bootstrap-all.sql en SQL Editor
  3. Restaurar supabase-datos.sql si existe
  4. Redeploy Vercel con variables guardadas
EOF

echo ""
echo "==> Backup listo en: backups/${TAG}/"
echo "    Para publicar el tag: git push origin ${TAG}"
echo "    Para subir backup fuera del repo: comprimir backups/${TAG}/ y guardar en Drive/S3."
