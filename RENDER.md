# Render deployment

Create a Blueprint from this repository using `render.yaml`. It provisions a free Node web service and a free PostgreSQL database in Singapore, connects DATABASE_URL automatically, and generates SEED_PASSWORD. No passwords belong in Git.

The build installs development dependencies explicitly and compiles the app. Startup applies database migrations and seeds only an empty app schema before starting Express. HOST binds to 0.0.0.0 and Render supplies PORT. Requests use RENDER_EXTERNAL_URL for origin validation. Uploaded images are stored in PostgreSQL instead of the ephemeral service filesystem.

After deployment, find SEED_PASSWORD in the service's Environment settings to sign in as admin@gram-pulse.demo. Keep it private. Changing this variable after seeding does not change existing account passwords; use the app's profile controls.

The free web service sleeps after 15 minutes of inactivity. Render's free PostgreSQL database expires after 30 days and has no backups; upgrade or migrate before expiry for continued use. This blueprint is a demo configuration, not permanent production hosting. See https://render.com/docs/free.

For a custom domain, set APP_ORIGIN to its exact HTTPS origin. Confirm the deployment is live and /api/health returns ready before sharing its URL.
