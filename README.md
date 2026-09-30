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
| Data | PostgreSQL + Prisma (next) |
| Auth | Auth.js (next) |
| Hosting | Vercel-ready |

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes

| Path | Purpose |
|------|---------|
| `/` | Public home |
| `/dashboard` | Due-soon list |
| `/documents/new` | Add a paper |
| `/family` | Members and invites |
| `/settings` | Account |

## Environment

Copy `.env.example` when database work starts.

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string (coming next) |

## Scripts

```bash
npm run dev
npm run build
npm run start
```

## License

[MIT](LICENSE) · [@Aminaa-Ashraf](https://github.com/Aminaa-Ashraf)
