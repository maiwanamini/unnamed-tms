# TMS Dashboard

Next.js (App Router) dashboard UI for the Unnamed TMS.

This README is focused on getting a fresh clone running reliably.

## Prerequisites

- Node.js: Node 20 LTS recommended (this project uses Next 16 + React 19)
- npm: use the npm that ships with Node

## Clone & Run (recommended)

This dashboard lives inside a multi-project repo.

### 1) Clone

```bash
git clone https://github.com/maiwanamini/unnamed-tms.git
cd unnamed-tms/tms-dashboard
```

### 2) Install deps (lockfile)

Use `npm ci` so everyone gets the same dependency tree.

```bash
npm ci
```

### 3) Configure API (choose one)

By default, the dashboard will use the deployed backend:

```text
https://unnamed-tms-backend.onrender.com/api
```

If you want to override this (example: local backend for testing), create an env file:

Windows (PowerShell):

```powershell
Copy-Item .env-example .env.local
```

macOS/Linux:

```bash
cp .env-example .env.local
```

Then set:

```text
NEXT_PUBLIC_API_BASE_URL=https://unnamed-tms-backend.onrender.com/api
```

Local testing example:

```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
```

Notes:
- `.env.local` is ignored by git (do not commit secrets)
- After changing `.env.local`, restart the dev server
- Only `NEXT_PUBLIC_API_BASE_URL` is used by the dashboard (see `src/lib/fetcher.js`).

### 4) Start the dashboard

```bash
npm run dev
```

Open http://localhost:3000

## Running the backend locally (optional testing)

If you cloned this monorepo-like workspace, you likely already have the backend folder next to `unnamed-tms/`:

```
TMS working/
	unnamed-tms/
		tms-dashboard/
	unnamed-tms-backend/
```

### 1) Configure backend env

Create `unnamed-tms-backend/.env` with at least:

```text
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=4000
```

Uploads (avatars/logos) are optional; if you want them working locally, also set:

```text
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### 2) Install + run backend

From the dashboard folder:

Windows (PowerShell):

```powershell
cd ..\..\unnamed-tms-backend
npm ci
npm run dev
```

macOS/Linux:

```bash
cd ../../unnamed-tms-backend
npm ci
npm run dev
```

The backend defaults to http://localhost:4000

### 3) Point the dashboard at the backend

Ensure `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api` in `.env.local` and restart `npm run dev`.

### Alternative: separate backend repo

Backend repo: https://github.com/maiwanamini/unnamed-tms-backend

Typical flow:

```bash
git clone https://github.com/maiwanamini/unnamed-tms-backend.git
cd unnamed-tms-backend
npm ci
npm run dev
```

Then point the dashboard at it via `NEXT_PUBLIC_API_BASE_URL`.

## Uploads (avatars/logos)

The Register page supports an optional profile picture upload, and Create Company supports an optional logo upload.
Uploads go through the backend and require Cloudinary configuration on the backend.

## Common issues

### Commands run from the wrong folder

Run all dashboard commands from the folder that contains this README and `package.json`:

```bash
cd unnamed-tms/tms-dashboard
```

### Clean install

Windows (PowerShell):

```powershell
Remove-Item -Recurse -Force node_modules, .next
npm ci
```

macOS/Linux:

```bash
rm -rf node_modules .next
npm ci
```

### Backend mismatch / wrong API URL

If one machine is hitting a different backend than others, confirm `NEXT_PUBLIC_API_BASE_URL`.

If you see errors like “Failed to reach API … Check NEXT_PUBLIC_API_BASE_URL”, it means the dashboard can’t reach the backend URL.

### 401 Unauthorized / stuck login

The dashboard stores tokens in `localStorage` (and sometimes `sessionStorage` during onboarding).
If you switch between backends, clear site storage and log in again.

### Next.js dev server lock

If you see a `.next/dev/lock` issue, it usually means another `next dev` is still running.
Stop the old process, or delete `.next` and restart.

## Scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run start` — run production server
- `npm run lint` — lint