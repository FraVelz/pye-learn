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

Ver `.env.example`. El frontend usa `VITE_API_URL`.

## Preview

El frontend se puede desplegar en Vercel (root del proyecto o `apps/web` según configuración).
La API necesita un host aparte (Go + Postgres).
