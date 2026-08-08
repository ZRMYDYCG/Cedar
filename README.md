# Cedar

Personal site / blog — Next.js App Router + Payload CMS.

## Stack

- Next.js App Router + Tailwind CSS v4
- Payload CMS + Postgres (+ Vercel Blob in production)
- Zustand, TanStack Query / Form / Table / Virtual
- GSAP, next-intl (en / zh-CN / zh-TW)

## Local setup

```bash
cd /Users/yishao/Desktop/workspace/aurora-web

# 1) Postgres
docker compose up -d

# 2) App
pnpm install
pnpm dev
```

- Site: http://localhost:3000
- Admin: http://localhost:3000/admin

Create content in `/admin` and set status to **Published**.

Optional:

```bash
pnpm seed        # demo posts (optional)
pnpm clear:demo  # wipe demo content
```

## Notes

- `.env`: `POSTGRES_URL`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL`
