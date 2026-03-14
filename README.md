# Contract Analysis Deployment Guide

This repo has two apps:

- `client` (Next.js)
- `server` (Express API)

## Monolith Deployment (Single Server)

If you want a single Node server that serves both the API and the Next.js app:

1. Install dependencies in both apps:
   - `client/`
   - `server/`
2. Build the client:
   - `npm run build` in `client/`
3. Build the server:
   - `npm run build` in `server/`
4. Start the server with `SERVE_CLIENT=true` and `NODE_ENV=production`.

The server will serve the Next.js app from `client/.next` and keep existing API routes.

## Single-Click Vercel Deployment (One Project)

This repo now supports a single Vercel project that deploys both the Next.js app
and the Express API with rewrites. You do **not** need separate Vercel projects.

Vercel config: `vercel.json` at repo root routes `/auth`, `/contracts`, `/payments`,
and `/healthz` to the Express API function.

Required env vars (same project):

- `NODE_ENV=production`
- `MONGODB_URI=...`
- `SESSION_SECRET=...`
- `CLIENT_URL=https://<your-domain>`
- `CLIENT_URLS=https://<your-domain>,https://<optional-preview-domain>`
- `GEMINI_API_KEY=...`
- `GOOGLE_CLIENT_ID=...`
- `GOOGLE_CLIENT_SECRET=...`
- `RESEND_API_KEY=...`
- `STRIPE_SECRET_KEY=...`
- `STRIPE_WEBHOOK_SECRET=...`
- `ENABLE_DEMO_AUTH=false` (set true if you want demo auth in prod)
- `LOCAL_DEMO_EMAIL=...`
- `LOCAL_DEMO_PASSWORD=...`
- `NEXT_PUBLIC_API_URL=https://<your-domain>` (no `/api` prefix needed)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...`
- `NEXT_PUBLIC_ENABLE_DEMO_AUTH=false`

Notes:

- Stripe webhook should point to `https://<your-domain>/payments/webhook`
- Google OAuth callback URL:
  `https://<your-domain>/auth/google/callback`

## Legacy: Separate Vercel Deployments

If you still want to deploy separately, use the instructions below.

## 1. Deploy Server (`/server`) to Vercel

Set Vercel project root to `server`.

Required env vars:

- `NODE_ENV=production`
- `PORT=8080`
- `MONGODB_URI=...`
- `SESSION_SECRET=...` (long random string)
- `CLIENT_URL=https://<your-client-domain>`
- `CLIENT_URLS=https://<your-client-domain>,https://<optional-preview-domain>`
- `GEMINI_API_KEY=...`
- `GOOGLE_CLIENT_ID=...`
- `GOOGLE_CLIENT_SECRET=...`
- `RESEND_API_KEY=...`
- `STRIPE_SECRET_KEY=...`
- `STRIPE_WEBHOOK_SECRET=...`
- `ENABLE_DEMO_AUTH=false`
- `LOCAL_DEMO_EMAIL=...`
- `LOCAL_DEMO_PASSWORD=...`

Notes:

- The server uses `server/vercel.json` and `server/api/index.ts` for serverless routing.
- Webhook endpoint is `POST /payments/webhook`.

## 2. Deploy Client (`/client`) to Vercel

Set Vercel project root to `client`.

Required env vars:

- `NEXT_PUBLIC_API_URL=https://<your-server-domain>`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...`
- `NEXT_PUBLIC_ENABLE_DEMO_AUTH=false`

## 3. OAuth and Stripe setup

- Google OAuth callback URL:
  - `https://<your-server-domain>/auth/google/callback`
- Stripe checkout/webhook should point to the server domain.

## 4. Production checklist

- Demo auth disabled (`ENABLE_DEMO_AUTH=false` and `NEXT_PUBLIC_ENABLE_DEMO_AUTH=false`)
- `CLIENT_URL` matches the exact deployed client domain
- MongoDB Atlas IP/network access configured for Vercel
- Session secret rotated and strong
