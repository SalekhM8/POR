This is a wellness bookings website built with Next.js (App Router), Tailwind, and Prisma.

## Run locally
1. Create a `.env` file at the project root with:
```
DATABASE_URL="file:./dev.db"
ADMIN_PASSWORD="change-me-please"
```
2. Install deps and start dev server:
```
npm install
npx prisma migrate deploy
npm run dev
```

## Hero video
- Put your 16:9 MP4 at `public/hero.mp4`. Optionally add `public/poster.jpg`.

## Pages
- Landing: full-screen video hero with CTA
- `My story`: `/story`
- `Treatments`: `/treatments`
- `Case studies`: `/cases`
- `Contact us`: `/contact` (includes Sign in for admin)
- Start your journey form: `/start`
- Admin dashboard: `/admin` (password from `ADMIN_PASSWORD`)
