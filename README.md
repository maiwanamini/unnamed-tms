# Unnamed TMS

This repository contains the frontend projects for Unnamed TMS:

- `tms-dashboard/` — the operations dashboard (Next.js)
- `tms-app/` — the customer-facing app (if/when used)

Backend (API): https://github.com/maiwanamini/unnamed-tms-backend

## Clone

```bash
git clone https://github.com/maiwanamini/unnamed-tms.git
cd unnamed-tms
```

## Run the Dashboard

See the dashboard README for the complete setup guide:

- `tms-dashboard/README.md`

Quick start:

```bash
cd tms-dashboard
npm ci
npm run dev
```

## Run the Backend (optional)

If you want to run everything locally, clone the backend repo and point the dashboard to it via `NEXT_PUBLIC_API_BASE_URL`.
