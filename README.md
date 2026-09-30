# Household Renewal Tracker

A shared family vault for CNIC, passport, vehicle, and insurance dates — so one household stops missing renewals.

Built for parents and adult children, not a personal reminder app.

---

## What it does

- Shows what is expiring, whose paper it is, and how soon
- Color states: safe, due in 30 days, due in 7 days, expired
- Filters the due-soon list by person and document type
- Keeps the family in one shared space (Owner, Member, Viewer)

## Stack

| Layer | Choice |
|-------|--------|
| App | Next.js 16 (App Router) + TypeScript |
| UI | React 19, Tailwind CSS |
| Data | PostgreSQL + Prisma |
| Auth | Auth.js (email/password, optional Google and magic link) |
| Hosting | Vercel-ready |

## Quick start

```bash
npm install
cp .env.example .env
# set DATABASE_URL to household_renewal_tracker
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes

| Path | Purpose |
|------|---------|
| `/` | Public home |
| `/login` | Sign in |
| `/signup` | Create an account |
| `/dashboard` | Due-soon list |
| `/documents/new` | Add a paper |
| `/family` | Members and invites |
| `/settings` | Account |

## Environment

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Postgres URL for `household_renewal_tracker` |
| `AUTH_SECRET` | Session signing key |
| `AUTH_URL` | App URL, e.g. `http://localhost:3000` |
| `GOOGLE_CLIENT_ID` | Optional Google sign-in |
| `GOOGLE_CLIENT_SECRET` | Optional Google sign-in |
| `RESEND_API_KEY` | Optional magic-link email |
| `EMAIL_FROM` | Sender for magic-link email |

Use a dedicated database. Do not point this app at another project’s database.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run db:migrate
npm run db:studio
```

## License

[MIT](LICENSE) · [@Aminaa-Ashraf](https://github.com/Aminaa-Ashraf)
