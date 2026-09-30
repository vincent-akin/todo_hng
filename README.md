# AI Todo

A no-login todo app with AI help (generate, break down, improve, suggest priority). Next.js + Tailwind. Tasks are stored in your browser's localStorage.

## Run locally
```bash
npm install
cp .env.example .env.local   # add your AI_API_KEY
npm run dev
```
Open http://localhost:3000. Without a key, todos work and AI shows a friendly error.

## Environment variables
- `AI_API_KEY`: provider key (server-side only)
- `AI_MODEL`: optional model override (default `claude-haiku-4-5-20251001`)

## Deploy to Vercel
1. Push to a private GitHub repo.
2. Import the repo in Vercel.
3. Add `AI_API_KEY` under Settings, Environment Variables.
4. Deploy and test the production URL.

The AI provider is isolated in `lib/ai.js` if you want to swap it.
