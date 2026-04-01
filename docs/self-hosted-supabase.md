# Self-Hosted Supabase (Draft Config)

This folder contains a starter Docker Compose setup for running Supabase in a
self-hosted environment. It is designed as a **baseline** for a VPS/VDS and is
meant to be customized (secrets, ports, storage, backups).

## Files

- `self-hosted/supabase/docker-compose.yml` - core services (db, auth, rest, realtime, storage, studio, kong)
- `self-hosted/supabase/kong/kong.yml` - API gateway routes + basic auth/cors
- `self-hosted/supabase/.env.example` - environment variables template

## Quick Start (local/dev)

1. Copy `.env.example` to `.env` and fill secrets:
   - `POSTGRES_PASSWORD`
   - `JWT_SECRET`
   - `ANON_KEY`
   - `SERVICE_ROLE_KEY`
2. Start:
   ```bash
   cd self-hosted/supabase
   docker compose --env-file .env up -d
   ```
3. API URL:
   - `http://localhost:8000` (Kong)
4. Studio URL:
   - `http://localhost:54323`

## App Configuration

Update your app env:

```bash
NEXT_PUBLIC_SUPABASE_URL=http://<host>:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY>
SUPABASE_SERVICE_ROLE_KEY=<SERVICE_ROLE_KEY>
```

## Notes

- This stack uses file-based storage by default (local volume). For production,
  replace with S3-compatible storage (MinIO / AWS S3) and configure the storage
  API environment accordingly.
- Lock image versions once you finalize the target environment.
- Ensure TLS/HTTPS on the gateway (Kong) for production.
