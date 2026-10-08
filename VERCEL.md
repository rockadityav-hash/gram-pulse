# Deploying GRAM-PULSE on Vercel

The root `app.ts` exports the Express API, and Vercel serves `public/` through its CDN. `vercel.json` selects Express and the `vercel-build` script. Local `npm start` still works.

## Required account resources

1. Import `rockadityav-hash/gram-pulse` into your Vercel account.
2. Connect a PostgreSQL database, for example through the Vercel Marketplace, to the project. Set `DATABASE_URL` to its pooled connection URL. `POSTGRES_URL` is also accepted. Keep database credentials in Vercel environment variables, never in Git.
3. Set `SEED_PASSWORD` to a strong unique password of at least 12 characters before the first deployment. Seed accounts are `admin@gram-pulse.demo`, `officer@gram-pulse.demo`, and `citizen@gram-pulse.demo`. Change their passwords after initial login. Later builds preserve existing users and records.
4. Set `UPLOAD_STORAGE=database` and `NODE_ENV=production`. On Vercel, database image storage is selected automatically as well.
5. Deploy. The build compiles the project, applies unapplied migrations transactionally, and seeds an empty database. Missing database configuration intentionally fails the build rather than publishing a nonfunctional application.
6. For a custom domain, set `APP_ORIGIN=https://your-domain`. The exact Vercel deployment and production URLs are accepted automatically for CSRF origin checks.

Images are privately served from PostgreSQL on Vercel. Local development keeps the original file storage unless `UPLOAD_STORAGE=database` is selected. Uploads are limited to 4 MB to remain below Vercel's 4.5 MB function payload limit; images are still decoded and re-encoded as WebP. Database image storage is intended for this modest demo dataset; large-scale media workloads should use a dedicated private object store.

Use a separate database for preview deployments. Builds apply additive schema migrations, so production and experimental branches should not share databases accidentally. The two included migrations preserve existing rows.

Deployment is complete only after a real Vercel build is Ready and the hosted sign-in, API health, report persistence and image upload are verified. A local passing build is not evidence of a live deployment.

References: [Express on Vercel](https://vercel.com/docs/frameworks/backend/express), [function limits](https://vercel.com/docs/functions/limitations).
