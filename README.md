# Household Renewal Tracker

A shared family vault for CNIC, passport, vehicle, and insurance dates — so one household stops missing renewals.

Built for parents and adult children, not a personal reminder app.

---

## What it does

- Shows what is expiring, whose it is, and how soon
- Color states: safe, due in 30 days, due in 7 days, expired
- Shared household with Owner, Member, and Viewer roles
- Invite family by email and accept an invite link
- Private image/PDF uploads with authorized download
- Daily reminder emails at 30 / 7 / 1 days and on expiry day

## Stack

| Layer | Choice |
|-------|--------|
| App | Next.js 16 (App Router) + TypeScript |
| UI | React 19, Tailwind CSS |
| Data | PostgreSQL + Prisma |
| Auth | Auth.js (email/password, optional Google and magic link) |
| Files | Vercel Blob (or local `/storage` fallback) |
| Email | Resend (or console log in local dev) |
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

Demo login after seed:

- `papa@khan.demo` / `demo-pass-123` (owner)
- `ammi@khan.demo` / `demo-pass-123` (member)
- `hassan@khan.demo` / `demo-pass-123` (viewer)

## Routes

| Path | Purpose |
|------|---------|
| `/` | Public home |
| `/login` | Sign in |
| `/signup` | Create an account |
| `/onboarding` | Create your household |
| `/dashboard` | Due-soon list |
| `/documents/new` | Add a paper |
| `/documents/[id]` | Paper details, file preview, reminders |
| `/family` | Members and invites |
| `/invites/[token]` | Accept invite |
| `/settings` | Account |

## Environment

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Postgres URL for `household_renewal_tracker` |
| `AUTH_SECRET` | Session signing key |
| `AUTH_URL` | App URL, e.g. `http://localhost:3000` |
| `GOOGLE_CLIENT_ID` | Optional Google sign-in |
| `GOOGLE_CLIENT_SECRET` | Optional Google sign-in |
| `RESEND_API_KEY` | Optional invite + reminder email |
| `EMAIL_FROM` | Sender address |
| `BLOB_READ_WRITE_TOKEN` | Optional Vercel Blob private uploads |
| `CRON_SECRET` | Protects the daily reminder job |

Without `RESEND_API_KEY`, emails print to the server console. Without `BLOB_READ_WRITE_TOKEN`, files save under `/storage` and stay private through `/api/files/[id]`.

## Test reminders locally

1. Seed or create a paper with an expiry date 7 days from today.
2. Run:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/reminders
```

3. Check the terminal for `[email:dev]` output (or your Resend inbox).
4. Open the paper — the reminder log should show the window once.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run db:migrate
npm run db:studio
npm run db:seed
```

## License

[MIT](LICENSE) · [@Aminaa-Ashraf](https://github.com/Aminaa-Ashraf)
