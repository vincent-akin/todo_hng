# AGENTS.md

Read this before making significant changes.

## Overview
AI Todo: a no-login todo app with AI assistance. Requirements live in `PRD.md`. Deployed on Vercel.

## Stack
Next.js (App Router), JavaScript (no TypeScript), Tailwind CSS v3, lucide-react icons. Todos persist in localStorage. AI calls go through `app/api/ai/route.js`.

## Architecture rules
- The browser never sees the AI key. Only `lib/ai.js` reads `process.env.AI_API_KEY`. Never use `NEXT_PUBLIC_` for secrets.
- All storage goes through `lib/storage.js` so localStorage can later become a database.
- All AI output is validated with `lib/validate.js` (`cleanAI`) on both server and client before use.
- Todo features must work with AI unavailable.
- AI results are suggestions: users review before anything is added.

## File organization
- `app/` routes and layout; `app/api/ai/route.js` is the only API route.
- `components/` UI. `lib/` non-UI logic (`ai.js` server-only, `storage.js` client-only, `validate.js` shared).

## Conventions
- Functional components, named handlers, 2-space indent, single quotes, relative imports.
- Files: PascalCase for components, camelCase for lib files. Todo shape is defined in `PRD.md` section 13.
- Accessibility: semantic HTML, labelled inputs, visible focus, 44px touch targets, no horizontal scroll on mobile.
- User-facing errors are plain sentences and never include keys, stack traces or provider details.

## Security
Validate API input (action allowlist, max 500 characters), rate limit `/api/ai`, render user text as text only (no `dangerouslySetInnerHTML`), keep `.env*` out of Git.

## Testing
Run `npm run build` before every commit. Add `node --test` unit tests for `lib/validate.js` and `lib/storage.js` logic when changing them. Manually check: add, edit, complete, delete, filter, refresh persistence, AI error state, mobile width.

## Git
Private GitHub repo. Small commits using `feat:`, `fix:`, `chore:`, `docs:`. Never commit secrets.

## Deployment
Vercel. Set `AI_API_KEY` (and optionally `AI_MODEL`) in project environment variables. Test the production URL after each deploy.

## Modifying the project
Keep changes minimal and within the rules above. Update `README.md` and this file if architecture or conventions change.
