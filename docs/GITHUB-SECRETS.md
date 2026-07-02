# GitHub Secrets — Comandero Taberneta

Guía para configurar **secretos en GitHub Actions** sin guardarlos en el repositorio, sin exponerlos al cliente web ni imprimirlos en los logs de CI.

---

## 1. Dónde crear los secretos

1. Abre: **https://github.com/divarrosl-afk/comandero-taberneta**
2. **Settings** → **Secrets and variables** → **Actions**
3. Pulsa **New repository secret** por cada fila de la tabla siguiente.

> Usa **Secrets** (no *Variables*). Los valores quedan cifrados y solo los leen los workflows en el servidor de GitHub.

---

## 2. Secretos obligatorios

| Nombre del secreto | Dónde obtener el valor | Notas |
|--------------------|------------------------|-------|
| `VERCEL_TOKEN` | [vercel.com/account/tokens](https://vercel.com/account/tokens) → **Create** → scope del proyecto | Token de cuenta; no lo commitees |
| `SUPABASE_DB_URL` | Supabase → **Project Settings** → **Database** → **Connection string** → **URI** | Formato `postgresql://postgres.[ref]:[PASSWORD]@...` — incluye la contraseña de la base de datos |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → **Project Settings** → **API** → **service_role** (secret) | Solo servidor. **Nunca** `NEXT_PUBLIC_` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → **API** → **Project URL** | Ej. `https://vhlzbfrzmqljngwegbde.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → **API** → **anon** *o* **publishable key** del wizard nuevo | En Vercel va como variable pública; en GitHub va como **Secret** para no filtrarla en forks/logs |
| `NEXT_PUBLIC_RESTAURANTE_ID` | UUID del restaurante en `schema.sql` | `b1c2d3e4-f5a6-4789-a012-3456789abcde` |

### Opcionales (no hace falta crearlos si usas el proyecto por defecto)

| Nombre | Valor por defecto en scripts |
|--------|------------------------------|
| `VERCEL_PROJECT_ID` | `prj_ei4K1jhbYegz3SKHmBrcdl3XHNZI` — **no crees el secreto vacío**; si no lo tienes, omítelo |
| `VERCEL_TEAM_SLUG` | `divarro` |
| `VERCEL_PRODUCTION_URL` | `https://comandero-taberneta.vercel.app` |

---

## 3. Cómo rellenar cada secreto (paso a paso)

### `VERCEL_TOKEN`

1. Vercel → tu avatar → **Account Settings** → **Tokens**
2. **Create Token** → nombre p. ej. `github-actions-comandero`
3. Copia el token **una sola vez** y pégalo en GitHub → **New repository secret** → Name: `VERCEL_TOKEN`

### `SUPABASE_DB_URL`

1. Supabase → proyecto **vhlzbfrzmqljngwegbde**
2. **Project Settings** → **Database**
3. **Connection string** → pestaña **URI**
4. Sustituye `[YOUR-PASSWORD]` por la contraseña de la base de datos del proyecto
5. Pega la URI completa en GitHub → Name: `SUPABASE_DB_URL`

### `SUPABASE_SERVICE_ROLE_KEY`

1. Supabase → **Project Settings** → **API**
2. En **Project API keys**, copia **service_role** (secret)
3. GitHub → Name: `SUPABASE_SERVICE_ROLE_KEY`

### `NEXT_PUBLIC_SUPABASE_URL`

```
https://vhlzbfrzmqljngwegbde.supabase.co
```

### `NEXT_PUBLIC_SUPABASE_ANON_KEY`

- Clave **anon** (JWT `eyJ...`) del dashboard, **o**
- Clave **publishable** (`sb_publishable_...`) del wizard nuevo de Supabase

### `NEXT_PUBLIC_RESTAURANTE_ID`

```
b1c2d3e4-f5a6-4789-a012-3456789abcde
```

---

## 4. Comprobar que los secretos están creados

En GitHub → **Settings** → **Secrets and variables** → **Actions** debes ver **6 secretos** con esos nombres exactos (mayúsculas y guiones bajos).

No podrás volver a ver los valores; solo editarlos o borrarlos.

---

## 5. Workflows disponibles

Tras crear los secretos, en **Actions** del repo:

| Workflow | Qué hace | Secretos necesarios |
|----------|----------|---------------------|
| **Supabase migrate** | `schema.sql` + migraciones | `SUPABASE_DB_URL` |
| **Vercel configure** | Sincroniza env en Vercel | Los 6 de la tabla |
| **Vercel redeploy** | Redeploy producción `main` | `VERCEL_TOKEN` |
| **Verify print health** | Comprueba `/api/print-jobs/health` | ninguno (endpoint público) |
| **Production setup** | Los 4 pasos en orden | Los 6 de la tabla |

### Ejecución recomendada (primera vez)

1. **Production setup** → **Run workflow**

O manualmente en orden:

1. **Supabase migrate**
2. **Vercel configure**
3. **Vercel redeploy**
4. **Verify print health**

---

## 6. Seguridad

Los workflows y scripts de este repo:

- **No** escriben secretos en logs (solo nombres de variables, p. ej. `+ NEXT_PUBLIC_SUPABASE_URL`)
- **No** guardan secretos en archivos del repo
- **No** exponen `SUPABASE_SERVICE_ROLE_KEY` al cliente — solo se sube a Vercel como env **encrypted** de servidor
- Sanitizan errores que pudieran contener URIs o JWT antes de imprimirlos

El endpoint `/api/print-jobs/health` solo devuelve diagnóstico público (`serviceRoleConfigured: true/false`, sin claves).

---

## 7. Resultado esperado

Tras **Verify print health** o el último job de **Production setup**:

```json
{
  "ok": true,
  "supabase": {
    "serviceRoleConfigured": true,
    "restauranteId": "b1c2d3e4-f5a6-4789-a012-3456789abcde"
  },
  "printJobs": {
    "tableExists": true
  }
}
```

Luego configura el Lenovo (`print-server/.env`) con las mismas URLs/keys y `npm run print-server` → `[cloud-poller] ACTIVO`.

---

## 8. Rotación de secretos

Si cambias contraseña de DB o rotas API keys:

1. Actualiza el secreto en GitHub (**Actions secrets**)
2. Ejecuta **Vercel configure** + **Vercel redeploy** (o **Production setup**)
3. Actualiza `print-server/.env` en el Lenovo manualmente
