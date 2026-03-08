# Contract Analysis Deployment Guide

This repo has two apps:

- `client` (Next.js): deploy to Vercel
- `server` (Express API): deploy to Vercel as a separate project

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
