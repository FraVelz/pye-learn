# pye-learn

Plataforma web de aprendizaje de la comunidad PyE.

Monorepo: API en Go (`apps/api`) + frontend React (`apps/web`) + Postgres.

## Requisitos

- Go 1.22+
- Node.js 20+
- Docker / Docker Compose

## Arranque local

```bash
cp .env.example .env
make db
make migrate
make seed
make api   # http://localhost:8080
make web   # http://localhost:5173
```

Opcional: `./scripts/dev.sh` levanta la DB, migra y hace seed.

## Estructura

```
apps/api   # REST API (chi, pgx, JWT)
apps/web   # Vite + React + TypeScript
```

## Variables de entorno

Ver `.env.example`.

Auth usa cookie `HttpOnly` (`pye_session`). El front llama a `/api/...` en el **mismo origen**:

- Local: proxy de Vite → `localhost:8080`
- Preview: rewrite de Vercel → Railway

Así la cookie es first-party y no la bloquea Chrome. Dejá `VITE_API_URL` vacío en Vercel.

Si pegás el front directo a otro dominio de API (sin proxy), necesitás:

```bash
COOKIE_SECURE=true
COOKIE_SAMESITE=none
CORS_ORIGINS=https://pye-learn.vercel.app
```

## CI

GitHub Actions en `.github/workflows/`:

| Workflow | Qué hace |
|---|---|
| `ci.yml` | Go vet/build/test, web lint + build, Docker build de la API |
| `react-doctor.yml` | Escaneo React Doctor sobre `apps/web` (advisory, no bloquea) |

Local:

```bash
cd apps/web && npm run lint && npm run build
cd apps/web && npm run doctor
make doctor   # alias
```

## Preview

Frontend: Vercel (root del monorepo; `vercel.json` hace proxy de `/api` a Railway).
API: Railway (`apps/api` + Postgres).
