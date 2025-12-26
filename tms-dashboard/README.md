# TMS Dashboard

Next.js (App Router) dashboard UI for the TMS project.

This README is intentionally “reproducible install”-focused so anyone who pulls the repo gets the same result.

## Requirements

- Node.js: recommend Node 20 LTS (Node 18.18+ should also work)
- npm: use the npm version that ships with your Node install

## Install (fresh machine)

1) Clone the repo

2) Go to the dashboard folder

This repo contains multiple projects. All commands below assume you are running inside this folder:

```powershell
cd tms-dashboard
```

3) Install dependencies using the lockfile (important)

```bash
npm ci
```

Why `npm ci`?

- It installs exactly what is in `package-lock.json`.
- `npm install` can update the lockfile or resolve versions differently across machines.

4) Create environment file

This repo uses a local env file that is not committed.

- Copy `.env-example` to `.env.local`

Windows (PowerShell):

```powershell
Copy-Item .env-example .env.local
```

macOS/Linux:

```bash
cp .env-example .env.local
```

5) Start the dev server

```bash
npm run dev
```

Open http://localhost:3000

If port 3000 is already in use, Next.js will automatically pick another port (for example, http://localhost:3001).

## Environment variables

Environment variables live in `.env.local` (ignored by git).

Required for API calls (optional override):

- `NEXT_PUBLIC_API_BASE_URL`
	- What: base URL for the backend API used by the frontend (see `src/lib/fetcher.js`).
	- Default: if not set, the app uses the deployed backend URL.
	- Example: `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api`

Present in `.env-example` (used only if/when server-side auth/db is enabled in this repo):

- `MONGO_URI` (or `MONGODB_URI`)
- `JWT_SECRET` (or `AUTH_SECRET`)

Note: do not commit real secrets. Share them via a secure channel.

## Key dependencies

Installed by `npm ci` from `package.json`/`package-lock.json`:

- Next.js 16
- React 19
- Tailwind CSS 4
- MUI (`@mui/material`)
- SWR, Zustand
- `@phosphor-icons/react` (icons)
