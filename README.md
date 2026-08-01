# pye-learn

Proyecto personal de academia web (**no oficial**, no afiliado a [SomosPYE](https://github.com/somospye)).

SPA en React + Vite. Auth, cursos y progreso son **mocks en el navegador** (`localStorage`). No hay backend ni credenciales reales.

El monorepo anterior (Go API + Postgres + Railway) quedó en la rama [`archive/monorepo`](https://github.com/FraVelz/pye-learn/tree/archive/monorepo).

## Requisitos

- Node.js 20+

## Arranque local

```bash
npm install
npm run dev   # http://localhost:5173
```

## Scripts

```bash
npm run lint
npm run build
npm run preview
```

## Deploy

Vercel construye desde la raíz (`vercel.json`). No requiere variables de entorno ni proxy a API.
