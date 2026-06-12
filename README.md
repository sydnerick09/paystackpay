# Paystack Payment Page (Next.js + Vercel)

A minimal, ready-to-deploy payment page that uses Paystack's hosted checkout
(Transaction Initialize/Verify flow). No database required — Vercel
serverless functions talk to Paystack directly.

## How it works

1. User enters their email and amount on the home page (`/`).
2. The browser calls `POST /api/initialize`, which calls Paystack's
   `transaction/initialize` endpoint using your **secret key** (kept server-side).
3. The user is redirected to Paystack's hosted checkout page to complete payment.
4. After payment, Paystack redirects back to `/callback?reference=...`.
5. The callback page calls `GET /api/verify?reference=...`, which calls
   Paystack's `transaction/verify` endpoint and shows the result.

## 1. Local setup

```bash
npm install
cp .env.example .env.local
```

Edit `.env.local` and add your Paystack **secret key**:

```
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PAYSTACK_CURRENCY=KES
```

You can find your keys at:
https://dashboard.paystack.com/#/settings/developer

Run locally:

```bash
npm run dev
```

Visit http://localhost:3000

## 2. Deploy to Vercel

### Option A: Vercel CLI

```bash
npm install -g vercel
vercel
```

### Option B: Git + Vercel Dashboard

1. Push this project to a GitHub repo.
2. Go to https://vercel.com/new and import the repo.
3. Vercel will auto-detect it as a Next.js project — no build settings needed.

### Important: set environment variables on Vercel

In your Vercel project settings, go to **Settings → Environment Variables**
and add:

| Name                  | Value                                  |
|-----------------------|----------------------------------------|
| `PAYSTACK_SECRET_KEY` | Your Paystack secret key (sk_live_... for production) |
| `PAYSTACK_CURRENCY`   | `KES` (or `NGN`, `GHS`, `ZAR`, `USD`)  |

Add these for **Production**, **Preview**, and **Development** environments
as needed, then redeploy.

## 3. Going live

- Use your `sk_test_...` key while testing — Paystack test mode does not
  move real money.
- Switch to your `sk_live_...` key (and update the Vercel environment
  variable) once you're ready to accept real payments.
- Make sure your Paystack business profile is enabled for the currency you
  set in `PAYSTACK_CURRENCY` (e.g. KES for Kenya / M-Pesa).

## Common errors and fixes

- **"Server is missing PAYSTACK_SECRET_KEY"** — you forgot to set the
  environment variable on Vercel (or locally in `.env.local`), or you need
  to redeploy after adding it.
- **"Currency not supported"** from Paystack — your Paystack account isn't
  enabled for the currency you set. Try `NGN` or check your dashboard
  settings, or contact Paystack support to enable KES.
- **Redirected back but shows "Payment Failed"** — the transaction was
  cancelled or declined on Paystack's checkout page; this is expected
  behavior, not a bug.
- **CORS / network errors calling `/api/...`** — make sure you're not
  calling these routes from a different domain; they're meant to be called
  from this same Next.js app.

## Project structure

```
.
├── pages/
│   ├── _app.js          # Loads global styles
│   ├── index.js          # Payment form (home page)
│   ├── callback.js       # Handles redirect back from Paystack
│   └── api/
│       ├── initialize.js # Starts a Paystack transaction
│       └── verify.js     # Verifies a Paystack transaction
├── styles/
│   └── globals.css
├── .env.example
├── next.config.js
└── package.json
```
