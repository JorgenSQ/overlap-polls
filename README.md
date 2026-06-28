# Overlap

A free, login-free scheduling poll — like Doodle, but simpler. Create a poll, share a unique link, and find when your group can meet.

Built with **Next.js**, **Prisma**, and **SQLite** (local) / **PostgreSQL** (production on Vercel, Railway, or Supabase).

## Features

- **No accounts** — share a short link (`/p/abc123XY`)
- **Create polls** with title, location, notes, and multiple date/time slots
- **Respond** with Yes / Maybe / No per slot
- **Results grid** with best-time highlighting and participant avatars
- **ICS calendar export** for any slot or the best time
- **Edit your response** — stored locally via edit token (no login)
- **Mobile-friendly** warm UI with coral accent and cream background

## Local development

```bash
npm install
npm run dev        # syncs schema + starts http://localhost:3000
```

`npm run dev` runs `prisma db push` first so the SQLite file stays in sync after schema changes. To sync without starting the server:

```bash
npm run db:push    # creates/updates prisma/dev.db
```

### Try the flow

1. Open [http://localhost:3000](http://localhost:3000) and create a poll
2. Copy the share link and open it in another tab (or incognito)
3. Submit availability and view results



## Quick deploy (Vercel + Neon)

1. Push this repo to GitHub and **Import** it in [Vercel](https://vercel.com/new).
2. Create a free [Neon](https://neon.tech) PostgreSQL database; copy the connection string.
3. In `prisma/schema.prisma`, set `provider = "postgresql"` (keep `sqlite` for local dev only).
4. In Vercel **Environment Variables** (Production):
   - `DATABASE_URL` — Neon connection string (include `?sslmode=require` if needed)
   - `NEXT_PUBLIC_APP_URL` — your Vercel URL, e.g. `https://overlap-polls.vercel.app`
5. Redeploy. The `vercel-build` script runs `prisma db push` against production Postgres.

If the Vercel CLI is logged in locally: `npx vercel --prod` from the project root.

## Production deployment

### Database (Supabase / Railway / Vercel Postgres)

1. Create a PostgreSQL database
2. In `prisma/schema.prisma`, change `provider` from `sqlite` to `postgresql`
3. Set `DATABASE_URL` to your Postgres connection string
4. Run `npx prisma db push` (or `prisma migrate deploy`)

### Vercel

```bash
vercel
```

Set environment variables:

- `DATABASE_URL` — Postgres connection string
- `NEXT_PUBLIC_APP_URL` — e.g. `https://your-app.vercel.app` (for correct share links)

### Railway

Deploy this repository. Add `DATABASE_URL` and `NEXT_PUBLIC_APP_URL` in Railway variables.

## Project structure

```
├── prisma/schema.prisma   # Poll, Slot, Response, Vote models
├── public/logo.svg        # App logo (overlapping circles)
├── src/
│   ├── app/
│   │   ├── page.tsx              # Create poll
│   │   ├── p/[id]/page.tsx       # Respond
│   │   ├── p/[id]/share/         # Share link after create
│   │   └── p/[id]/results/       # Availability grid
│   ├── components/               # UI components
│   └── lib/                        # scoring, ICS, formatting
└── Design/                         # Original design prototype (reference)
```

## Design reference

The UI uses a warm cream background (`#FBF7F0`), coral accent (`#EC6B4E`), and Bricolage Grotesque + Hanken Grotesk fonts. The original prototype lives in `Design/Pencil.dc.html`.

## License

MIT
