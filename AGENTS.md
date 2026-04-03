# AGENTS.md — vadya50

Interactive 50th birthday congratulations app. Next.js 16 (App Router) + React 19, TypeScript strict, Tailwind CSS v4, shadcn/ui, Supabase, Three.js/R3F.

## Commands

```bash
# Development
npm run dev            # Next.js dev server (localhost:3000)
npm run dev:lan        # Dev server on 0.0.0.0:3004

# Build
npm run build          # Production build
npm run start          # Production server
npm run type-check     # tsc --noEmit (run before committing)

# Lint & Format (Biome)
npm run lint           # biome check .
npm run lint:fix       # biome check --write .

# Tests
npm run test           # Vitest (unit tests)
npm run test:ui        # Vitest with UI
npm run test:e2e       # Playwright E2E (all browsers)

# Single unit test
npx vitest run path/to/file.test.ts
npx vitest run -t "test name pattern"

# Single E2E test
npx playwright test e2e/homepage.spec.ts
npx playwright test --project="chromium" e2e/homepage.spec.ts

# UX Audit
npm run ux:аудит       # Lighthouse CI
```

## Code Style

### Formatting (Biome)
- 2-space indent, 100 char line width
- Double quotes, ES5 trailing commas
- Semicolons required
- Run `npm run lint:fix` before committing; lint-staged enforces on pre-commit

### Imports
- Use `@/*` path alias for internal imports (e.g. `@/lib/utils`, `@/components/ui/button`)
- Order: external packages → `@/` imports → relative imports
- Use `import type` for type-only imports
- Default exports for React components and hooks; named exports for utilities

### Naming Conventions
- **Components:** PascalCase (`CongratulationForm.tsx`)
- **Utils/libs/hooks:** camelCase files (`utils.ts`, `useMediaRecorder.ts`)
- **Variables/functions:** camelCase
- **Types/interfaces:** PascalCase
- **Russian identifiers:** This codebase uses Russian/Cyrillic names extensively (variables, functions, CSS classes, test files, npm scripts). Follow existing patterns — do NOT rename Russian identifiers to English.

### Types
- TypeScript strict mode enabled
- Zod schemas for runtime validation; derive types with `z.infer`
- Use `interface` for extensible object shapes, `type` for unions/mapped types
- Supabase clients are generic: `createClient<Database, "public">(...)`
- Use `as const` for literal type narrowing

### React Patterns
- Server components by default; `"use client"` at top for client components
- `next/dynamic` with `ssr: false` for heavy 3D/media components
- Custom hooks return typed interfaces
- Error boundaries for 3D rendering failures (`ГраницаОшибки3D`)

### Error Handling
- API routes: try/catch with specific error checks (`instanceof ZodError`)
- Error responses: `{ error: string, details?: object, debug?: string }`
- Debug info only in non-production: `process.env.NODE_ENV === "production" ? undefined : msg`
- Fire-and-forget side effects: `.catch(console.error)`
- Graceful degradation: Redis → in-memory fallback, 3D → static fallback, iOS skips heavy effects

### CSS/Styling
- Tailwind CSS v4 with `@import "tailwindcss"`
- Design tokens via CSS custom properties in `@theme` blocks
- Dark mode via `dark` class on `<html>`
- shadcn/ui base-nova style with OKLCH colors
- Custom CSS animations use Russian names; respect `prefers-reduced-motion`

### E2E Testing (Playwright)
- Tests in `e2e/` directory
- Projects: Chromium desktop, Chromium Android (Pixel 5), WebKit iPhone (iPhone 12)
- Fake media stream injection for audio/video recording tests
- Trace captured on first retry; HTML reporter
- CI: `forbidOnly`, 2 retries, 1 worker

### Database & Backend
- Supabase (PostgreSQL + Storage); migrations in `supabase/migrations/`
- Upstash Redis for rate limiting with in-memory fallback
- Server-side media conversion via ffmpeg-static + sharp
- Telegram Bot API for notifications

## Infrastructure — Self-Hosted Supabase

### Architecture
```
External → [Router:80/443] → [Windows portproxy:80/443] → [WSL nginx:8080/8444] → [Docker Kong:8001 → Supabase services]
```

### Key Files
- `self-hosted/supabase/docker-compose.yml` — All 8 Supabase containers
- `self-hosted/supabase/.env` — Secrets and config (values with spaces MUST be quoted)
- `self-hosted/supabase/kong/kong.yml` — **Generated** by `generate-kong-config.sh` — do NOT edit manually
- `self-hosted/supabase/kong/kong.yml.template` — Template with `${ANON_KEY}` and `${SERVICE_ROLE_KEY}` placeholders
- `self-hosted/supabase/generate-kong-config.sh` — Substitutes secrets from `.env` into `kong.yml`
- `/etc/nginx/sites-available/supabase.conf` — Nginx config (listens on 8080/8444)

### Port Mappings
| Service | Container Port | WSL Host Port | External (via portproxy) |
|---------|---------------|---------------|--------------------------|
| Kong HTTP | 8000 | 8001 | 80 |
| Kong HTTPS | 8443 | 8443 | 443 |
| Studio | 3000 | 54324 | — (via nginx /studio) |

### WSL Mirrored Mode — Critical
- `.wslconfig` has `networkingMode=mirrored` — Windows sees WSL via **localhost**, NOT via WSL IP
- Portproxy `connectaddress` MUST be `127.0.0.1`, NOT `192.168.1.224` (WSL IP)
- Test: `Test-NetConnection -ComputerName localhost -Port 8080` should succeed
- Test: `Test-NetConnection -ComputerName 192.168.1.224 -Port 8080` will fail (expected)

### Portproxy Setup (run in Windows PowerShell as Admin)
```powershell
netsh interface portproxy add v4tov4 listenport=80 listenaddress=0.0.0.0 connectport=8080 connectaddress=127.0.0.1
netsh interface portproxy add v4tov4 listenport=443 listenaddress=0.0.0.0 connectport=8444 connectaddress=127.0.0.1
```
Firewall rules "WSL HTTP 80" and "WSL HTTPS 443" must exist and be enabled.

### Router Config
- External 80 → Windows LAN IP:80
- External 443 → Windows LAN IP:443
- Do NOT map to 8080/8444 — portproxy handles the translation

### Common Issues
1. **`kong.yml` becomes a directory** — Docker mount fails with "not a directory". Fix: `rm -rf kong.yml && generate-kong-config.sh && docker compose rm -f kong && docker compose up -d kong`
2. **`.env` values with spaces** — Must be quoted: `STUDIO_DEFAULT_ORGANIZATION="Default Organization"`
3. **Docker port allocation bug** — Ports 8000 and 54323 fail to bind. Use 8001 and 54324 instead.
4. **Kong 401 on all API requests** — Expected without `apikey` header. Use `ANON_KEY` from `.env`.
5. **`pg_stat_statements` extension** — Must be created in `extensions` schema or Studio metrics fail with 500.
6. **Storage bucket limits** — Stored in `storage.buckets` table, override global `FILE_SIZE_LIMIT` env var.
7. **Meta `CRYPTO_KEY`** — Must match `PG_META_CRYPTO_KEY` in `.env` or Studio can't decrypt connection headers.

### Startup Sequence
```bash
# 1. Generate Kong config (must run before docker compose up)
bash self-hosted/supabase/generate-kong-config.sh

# 2. Start all services
docker compose -f self-hosted/supabase/docker-compose.yml up -d

# 3. Verify
curl -sI https://asevast.myftp.org/rest/v1/          # Should return 401 (Kong)
curl -sI https://asevast.myftp.org/studio              # Should return 307 (Studio)
source self-hosted/supabase/.env
curl -s -H "apikey: $ANON_KEY" https://asevast.myftp.org/rest/v1/  # Should return OpenAPI JSON
```

### External URL
- Public endpoint: `https://asevast.myftp.org`
- Railway `NEXT_PUBLIC_SUPABASE_URL=https://asevast.myftp.org`
- Let's Encrypt SSL cert (valid until Jun 30 2026)
