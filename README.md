<p align="center">
  <h1 align="center">⚡ IssuePulse</h1>
  <p align="center">
    GitHub Issue Notification Tracker — Monitor repos, watch labels, get notified instantly.
  </p>
</p>

<p align="center">
  <a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fabhay-codes07%2Fissuepulse&env=NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,CLERK_SECRET_KEY,DATABASE_URL,DIRECT_URL,RESEND_API_KEY,CRON_SECRET&envDescription=Required%20environment%20variables%20for%20IssuePulse&project-name=issuepulse">
    <img src="https://vercel.com/button" alt="Deploy with Vercel" />
  </a>
</p>

---

## ✨ Features

- **🔍 Repository Tracking** — Add any public GitHub repo by typing `owner/repo`
- **🏷️ Label Subscriptions** — Watch specific labels (good first issue, bug, help wanted, etc.)
- **⏱️ Automated Polling** — Cron job checks for new issues every 10 minutes
- **🔔 In-App Notifications** — Real-time notification bell with badge count & slide-over drawer
- **📧 Email Alerts** — Beautiful HTML emails via Resend with direct GitHub links
- **📱 Push Notifications** — Browser/system-level notifications via Web Push API
- **🎨 Premium Dark UI** — Dark navy theme with electric indigo accents and Framer Motion animations
- **🔐 Auth** — Clerk (GitHub OAuth + email/password)
- **🚀 Onboarding** — 3-step guided setup on first sign-in

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────┐
│                     Next.js App Router                  │
├──────────┬──────────┬──────────┬──────────┬────────────┤
│ Landing  │Dashboard │  Repo    │Settings  │  Auth      │
│ Page     │  Feed    │  Detail  │  Page    │ (Clerk)    │
├──────────┴──────────┴──────────┴──────────┴────────────┤
│                    API Routes                           │
│  /api/repos  /api/notifications  /api/web-push         │
│  /api/repos/[id]  /api/repos/[id]/labels               │
├────────────────────────────────────────────────────────┤
│              /api/cron/poll-issues                      │
│         (Vercel Cron — every 10 minutes)               │
├──────────┬──────────┬──────────┬──────────┬────────────┤
│ Prisma   │ GitHub   │ Resend   │ Web Push │  Clerk     │
│ (Supabase│ (Octokit)│ (Email)  │ (VAPID)  │  (Auth)    │
│  PgSQL)  │          │          │          │            │
└──────────┴──────────┴──────────┴──────────┴────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 App Router (TypeScript) |
| Auth | Clerk (`@clerk/nextjs`) |
| Database | Supabase PostgreSQL + Prisma ORM |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Animations | Framer Motion + react-hot-toast |
| Email | Resend |
| Push | Web Push API (`web-push`) |
| GitHub | Octokit REST |
| Cron | Vercel Cron Jobs |

---

## 📦 Database Schema

```prisma
model User {
  id, clerkId (unique), email, pushSubscription?, createdAt
  → TrackedRepo[], Notification[]
}

model TrackedRepo {
  id, userId→User, owner, repo, avatarUrl?, lastChecked,
  emailEnabled, pushEnabled, createdAt
  → LabelSubscription[]
}

model LabelSubscription {
  id, trackedRepoId→TrackedRepo, label, color?
}

model Notification {
  id, userId→User, repoFullName, issueTitle, issueUrl,
  issueNumber, labels[], isRead, createdAt
}
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm
- Accounts: [Clerk](https://clerk.com), [Supabase](https://supabase.com), [Resend](https://resend.com)

### Setup

```bash
# 1. Clone
git clone https://github.com/abhay-codes07/issuepulse.git
cd issuepulse

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env.local
# Fill in your keys in .env.local

# 4. Generate VAPID keys (for push notifications)
npx web-push generate-vapid-keys
# Add the output to .env.local

# 5. Push database schema
npx prisma db push

# 6. Generate Prisma client
npx prisma generate

# 7. Run dev server
npm run dev
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `DATABASE_URL` | Supabase pooled connection string |
| `DIRECT_URL` | Supabase direct connection string |
| `GITHUB_TOKEN` | GitHub PAT (optional, raises rate limit) |
| `RESEND_API_KEY` | Resend API key |
| `RESEND_FROM_EMAIL` | Sender email address |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Web Push VAPID public key |
| `VAPID_PRIVATE_KEY` | Web Push VAPID private key |
| `CRON_SECRET` | Secret to protect cron endpoint |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                          # Landing page
│   ├── layout.tsx                        # Root layout (Clerk, Toaster)
│   ├── globals.css                       # Design system
│   ├── sign-in/[[...sign-in]]/page.tsx   # Auth
│   ├── sign-up/[[...sign-up]]/page.tsx   # Auth
│   ├── dashboard/
│   │   ├── layout.tsx                    # Sidebar + navbar
│   │   ├── page.tsx                      # Issue feed
│   │   ├── [owner]/[repo]/page.tsx       # Repo detail
│   │   └── settings/page.tsx             # Settings
│   └── api/
│       ├── repos/route.ts                # CRUD repos
│       ├── repos/[id]/route.ts           # Update/delete repo
│       ├── repos/[id]/labels/route.ts    # Manage labels
│       ├── notifications/route.ts        # Notifications
│       ├── web-push/route.ts             # Push subscription
│       └── cron/poll-issues/route.ts     # Cron handler
├── components/
│   ├── ui/                               # shadcn/ui components
│   ├── notification-bell.tsx             # Bell + drawer
│   ├── add-repo-modal.tsx                # Add repo dialog
│   ├── label-selector.tsx                # Label multi-select
│   ├── issue-card.tsx                    # Issue feed card
│   ├── empty-state.tsx                   # Empty state
│   └── onboarding.tsx                    # 3-step onboarding
└── lib/
    ├── prisma.ts                         # DB client singleton
    ├── auth.ts                           # Clerk→DB sync
    ├── github.ts                         # Octokit wrapper
    ├── email.ts                          # Resend sender
    ├── push.ts                           # Web Push sender
    └── utils.ts                          # Tailwind merge
```

---

## 🔒 Security

- All dashboard routes protected by Clerk middleware
- Cron endpoint protected by `CRON_SECRET` bearer token
- User data isolated by `userId` on all queries
- GitHub API rate limiting handled gracefully (403/429)

---

## 📄 License

MIT
