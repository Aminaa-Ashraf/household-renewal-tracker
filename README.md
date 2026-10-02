# Household Renewal Tracker

A shared family vault for CNIC, passport, vehicle, and insurance dates — so one household stops missing renewals.

Built for parents and adult children, not a personal reminder app.

---

## What it does

- See what is expiring, whose it is, and how soon
- Color status: safe, due in 30 days, due in 7 days, expired
- Family profiles without login (Mother, Father, etc.) plus member accounts
- Shared household with Owner, Member, and Viewer roles
- Invite by email — copy link, WhatsApp share, resend, revoke
- Reminder preferences, CSV/PDF export, and session controls
- Private image/PDF uploads with authorized download
- Email reminders at 30 / 7 / 1 days before expiry, and on the day

## Stack

| Layer | Choice |
|-------|--------|
| App | Next.js 16 (App Router) + TypeScript |
| UI | React 19, Tailwind CSS |
| Data | PostgreSQL + Prisma |
| Auth | Auth.js (email/password, optional Google) |
| Files | Vercel Blob (local `/storage` fallback) |
| Email | Resend (console fallback in local dev) |
| Hosting | Vercel + daily cron |

## Quick start

```bash
npm install
cp .env.example .env
# set DATABASE_URL, AUTH_SECRET, AUTH_URL
npx prisma migrate dev
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Demo logins** (after seed):

| Email | Password | Role |
|-------|----------|------|
| `papa@khan.demo` | `demo-pass-123` | Owner |
| `ammi@khan.demo` | `demo-pass-123` | Member |
| `hassan@khan.demo` | `demo-pass-123` | Viewer |

## Routes

| Path | Purpose |
|------|---------|
| `/` | Public landing |
| `/login` · `/signup` | Auth |
| `/onboarding` | Create household |
| `/dashboard` | Due-soon papers |
| `/documents/new` | Add a paper |
| `/documents/[id]` | Paper details & file |
| `/family` | People, members, invites |
| `/invites/[token]` | Accept invite |
| `/settings` | Account, reminders, export |

## Environment

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | Postgres connection string |
| `AUTH_SECRET` | Yes | Session signing key |
| `AUTH_URL` | Yes | App URL (`http://localhost:3000`) |
| `CRON_SECRET` | Yes | Protects `/api/cron/reminders` |
| `GOOGLE_CLIENT_ID` | No | Google sign-in |
| `GOOGLE_CLIENT_SECRET` | No | Google sign-in |
| `RESEND_API_KEY` | No | Invite & reminder email |
| `EMAIL_FROM` | No | Sender address |
| `BLOB_READ_WRITE_TOKEN` | No | Vercel Blob private uploads |

Without `RESEND_API_KEY`, emails print to the server console. Without `BLOB_READ_WRITE_TOKEN`, files save under `/storage`.

## Deploy

1. Import this repo in [Vercel](https://vercel.com).
2. Provision hosted Postgres (e.g. Neon) and set `DATABASE_URL`.
3. Set `AUTH_SECRET`, `AUTH_URL` (your production URL), and `CRON_SECRET`.
4. Optional: Blob, Resend, Google OAuth.
5. Deploy — `npm run build` runs migrations, then `next build`.

## Scripts

```bash
npm run dev        # local development
npm run build      # migrate + production build
npm run start      # serve production build
npm run db:migrate # create/apply migrations (dev)
npm run db:deploy  # apply migrations (prod)
npm run db:seed    # demo household
npm run db:studio  # Prisma Studio
```

## License

[MIT](LICENSE) · [@Aminaa-Ashraf](https://github.com/Aminaa-Ashraf)
