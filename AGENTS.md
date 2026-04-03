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
