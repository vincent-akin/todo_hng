import { NextResponse } from 'next/server';
import { runAI, AIError } from '../../../lib/ai';
import { ACTIONS, MAX_INPUT } from '../../../lib/validate';

// Basic per-IP limit (in-memory; resets per serverless instance). Use a shared store for strict limits.
const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 15;
}

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  if (limited(ip)) return NextResponse.json({ error: 'Too many requests. Try again in a minute.' }, { status: 429 });

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }

  const task = typeof body?.task === 'string' ? body.task.trim() : '';
  if (!ACTIONS.includes(body?.action) || !task) return NextResponse.json({ error: 'Enter a task first.' }, { status: 400 });
  if (task.length > MAX_INPUT) return NextResponse.json({ error: `Keep it under ${MAX_INPUT} characters.` }, { status: 400 });

  try {
    return NextResponse.json(await runAI(body.action, task));
  } catch (e) {
    const known = e instanceof AIError;
    return NextResponse.json({ error: known ? e.message : 'Something went wrong. Please try again.' }, { status: known ? e.status : 500 });
  }
}
