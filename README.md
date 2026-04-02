<p align="center">
  <img src="https://raw.githubusercontent.com/abhay-codes07/issuepulse/main/public/logo.png" alt="IssuePulse" width="72" />
</p>

<h1 align="center">⚡ IssuePulse</h1>

<p align="center">
  <strong>Track GitHub issues. Watch labels. Get notified — email, push, in-app.</strong>
</p>

<p align="center">
  <a href="https://github.com/abhay-codes07/issuepulse/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/abhay-codes07/issuepulse?style=flat-square&color=6366f1" /></a>
  <a href="https://github.com/abhay-codes07/issuepulse/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" /></a>
  <a href="https://github.com/abhay-codes07/issuepulse/blob/main/.env.example"><img alt="Env Example" src="https://img.shields.io/badge/.env.example-included-brightgreen?style=flat-square" /></a>
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" />
</p>

<p align="center">
  <a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fabhay-codes07%2Fissuepulse&env=NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,CLERK_SECRET_KEY,DATABASE_URL,RESEND_API_KEY,RESEND_FROM_EMAIL,NEXT_PUBLIC_VAPID_PUBLIC_KEY,VAPID_PRIVATE_KEY,CRON_SECRET,GITHUB_TOKEN&envDescription=Required%20API%20keys&project-name=issuepulse&repository-name=issuepulse">
    <img src="https://vercel.com/button" alt="Deploy with Vercel" />
  </a>
</p>

---

## What it does

Stop manually refreshing GitHub. IssuePulse watches repos on your behalf — when a new issue appears with a label you care about, you get notified instantly.

```
You add  →  owner/repo  +  labels to watch
IssuePulse polls →  every 10 min via Vercel Cron
New issue found  →  email + browser push + in-app bell
```

---

## How it works

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (You)                           │
│          Dashboard · Repo Detail · Settings                 │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS
┌────────────────────▼────────────────────────────────────────┐
│                  Next.js 16 App Router                      │
│                                                             │
│  /api/repos          → CRUD tracked repos                   │
│  /api/repos/[id]/labels → manage label subscriptions        │
│  /api/notifications  → read / mark as read                  │
│  /api/web-push       → subscribe / unsubscribe browser      │
│  /api/cron/poll-issues ← Vercel Cron every 10 min           │
└───┬──────────┬───────────┬───────────┬───────────┬──────────┘
    │          │           │           │           │
  Prisma    Octokit     Resend     web-push      Clerk
(Supabase) (GitHub)   (Email)    (Browser     (Auth)
                                  Push)
```

---

## Tech Stack

| | |
|---|---|
| **Framework** | Next.js 16 · App Router · TypeScript |
| **Auth** | Clerk (GitHub OAuth + Email) |
| **Database** | Supabase PostgreSQL + Prisma ORM |
| **UI** | Tailwind CSS v4 · shadcn/ui · Framer Motion |
| **Email** | Resend |
| **Push** | Web Push API (VAPID) |
| **GitHub API** | Octokit REST |
| **Cron** | Vercel Cron Jobs |

---

## Deploy on Vercel

### 1 — External Services (do this first)

| Service | What you need | Link |
|---------|--------------|------|
| **Clerk** | Publishable key + Secret key | [dashboard.clerk.com](https://dashboard.clerk.com) |
| **Supabase** | PostgreSQL connection string | [supabase.com](https://supabase.com) → Project → Settings → Database |
| **Resend** | API key + sender email | [resend.com](https://resend.com) |
| **GitHub** | Personal Access Token (optional) | [github.com/settings/tokens](https://github.com/settings/tokens) |

Generate VAPID keys locally once:
```bash
npx web-push generate-vapid-keys
# → copy NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY
```

Generate a cron secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2 — Push schema to your database

```bash
# Run once locally before/after deploying
npx prisma db push
```

### 3 — Deploy

Click **Deploy with Vercel** above or:

```bash
npm i -g vercel
vercel --prod
```

### 4 — Add environment variables in Vercel

Go to **Project → Settings → Environment Variables** and add:

| Variable | Where to get it |
|----------|----------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard |
| `CLERK_SECRET_KEY` | Clerk Dashboard |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/dashboard` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/dashboard` |
| `DATABASE_URL` | Supabase → Database → Connection string (pooled) |
| `GITHUB_TOKEN` | GitHub PAT (read:public_repo scope) |
| `RESEND_API_KEY` | Resend dashboard |
| `RESEND_FROM_EMAIL` | Your verified sender email |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | From `npx web-push generate-vapid-keys` |
| `VAPID_PRIVATE_KEY` | From `npx web-push generate-vapid-keys` |
| `CRON_SECRET` | Any random 32-char hex string |

### 5 — Configure Clerk redirect URLs

In Clerk Dashboard → **Redirect URLs**, add your Vercel domain:
```
https://your-app.vercel.app
https://your-app.vercel.app/sign-in
https://your-app.vercel.app/sign-up
https://your-app.vercel.app/dashboard
```

### 6 — Done ✓

The cron job (`vercel.json`) runs automatically every 10 minutes on Vercel's infrastructure.

---

## Run locally

```bash
git clone https://github.com/abhay-codes07/issuepulse.git
cd issuepulse
npm install

cp .env.example .env.local
# fill in .env.local

npx prisma db push       # push schema once
npm run dev              # http://localhost:3000
```

---

## Project layout

```
src/
├── app/
│   ├── page.tsx                        # Landing
│   ├── dashboard/
│   │   ├── page.tsx                    # Issue feed
│   │   ├── [owner]/[repo]/page.tsx     # Repo detail
│   │   └── settings/page.tsx           # Notification settings
│   └── api/
│       ├── repos/                      # CRUD
│       ├── notifications/              # Read / ack
│       ├── web-push/                   # Push subscribe
│       └── cron/poll-issues/           # ← Vercel runs this
├── components/
│   ├── notification-bell.tsx
│   ├── add-repo-modal.tsx
│   ├── label-selector.tsx
│   └── onboarding.tsx
└── lib/
    ├── github.ts   # Octokit
    ├── email.ts    # Resend
    └── push.ts     # Web Push
```

---

## License

MIT
