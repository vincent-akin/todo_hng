# agents.md

Instructions for any AI coding agent working on this project. Read this before changing anything.

## Project
A mobile-style todo list web app. Users pick a day from a week strip, create tasks (category, name, description, date, start/end time), tick them off, delete them, and filter by All / To do / Done. Tasks persist in the browser via localStorage.

## Stack
- Plain HTML, CSS, and JavaScript. No frameworks, no build step, no dependencies.
- Files: `index.html`, `style.css`, `script.js`.

## How to run
Open `index.html` in a browser, or run `python3 -m http.server` in this folder and visit http://localhost:8000.

## Conventions
- Vanilla JS, `const`/`let`, no `var`. Small functions with one job each.
- State lives in one `todos` array of `{id, title, desc, category, date (YYYY-MM-DD), start, end, done}`; every change goes through it, then calls `save()` and `render()`.
- Icons are inline SVG paths in `ICON_PATHS`; no icon libraries.
- Never insert user text with `innerHTML`. Use `textContent`.
- CSS colors and spacing come from the variables in `:root`.
- Keep the UI keyboard-accessible with visible focus styles.
- Button labels are verbs: "Add task", "Delete", "Clear completed".

## Workflow
1. Make one small change at a time.
2. Test in the browser: add, complete, delete, filter, refresh (tasks must persist).
3. Commit with a short message describing the change.

## Do not
- Add libraries or a build tool without being asked.
- Rewrite files that don't need to change.
- Commit secrets or API keys.

## Deploy
Static site. Publish the repo root (no build command, no output folder) on Netlify, Vercel, GitHub Pages, or Cloudflare Pages.
