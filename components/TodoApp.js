'use client';
import { useEffect, useMemo, useState } from 'react';
import { Check, CircleCheck, Flag, LayoutGrid, ListChecks, ListTree, Pencil, Plus, Sparkles, Sun, Moon, Trash2, X } from 'lucide-react';
import { createTodo, loadTodos, saveTodos } from '../lib/storage';
import { MAX_INPUT, PRIORITIES, cleanAI } from '../lib/validate';

const BADGE = {
  high: 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
};
const card = 'rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5';
const field = 'rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5';

const AI_ACTIONS = [
  { id: 'generate', label: 'Generate with AI', title: 'Generate Tasks', hint: 'Turn your goals into actionable todo items.', Icon: Sparkles, chip: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300', tile: 'bg-violet-500' },
  { id: 'breakdown', label: 'Break down a task', title: 'Break Down a Task', hint: 'Split large tasks into smaller steps.', Icon: ListTree, chip: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300', tile: 'bg-emerald-500' },
  { id: 'improve', label: 'Improve task', title: 'Improve Task', hint: 'Get a clearer version of a vague task.', Icon: Pencil, chip: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300', tile: 'bg-sky-500' },
  { id: 'prioritize', label: 'Suggest priority', title: 'Suggest Priority', hint: 'Let AI recommend the right priority level.', Icon: Flag, chip: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300', tile: 'bg-amber-500' },
];

export default function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [ready, setReady] = useState(false);
  const [dark, setDark] = useState(false);
  const [text, setText] = useState('');
  const [priority, setPriority] = useState('');
  const [filter, setFilter] = useState('all');
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState('');
  const [ai, setAi] = useState({ loading: false, error: '', action: null, result: null, picked: [] });

  useEffect(() => {
    setTodos(loadTodos());
    setDark(document.documentElement.classList.contains('dark') || localStorage.getItem('ai-todo:theme') === 'dark');
    setReady(true);
  }, []);
  useEffect(() => { if (ready) saveTodos(todos); }, [todos, ready]);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    if (ready) { try { localStorage.setItem('ai-todo:theme', dark ? 'dark' : 'light'); } catch {} }
  }, [dark, ready]);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(''), 2000); return () => clearTimeout(t); } }, [toast]);

  const done = todos.filter((t) => t.completed).length;
  const active = todos.length - done;
  const overdue = todos.filter((t) => !t.completed && t.dueDate && t.dueDate < new Date().toISOString().slice(0, 10)).length;
  const shown = useMemo(() => todos.filter((t) => filter === 'all' || (filter === 'active' ? !t.completed : t.completed)), [todos, filter]);
  const pct = todos.length ? done / todos.length : 0;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const add = (items) => {
    setTodos((prev) => [...items.map((i) => createTodo(i)), ...prev]);
    setToast('Task added.');
  };
  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    add([{ title: text.slice(0, 140), priority: priority || null }]);
    setText(''); setPriority('');
  };
  const patch = (id, changes) => setTodos((p) => p.map((t) => (t.id === id ? { ...t, ...changes, updatedAt: new Date().toISOString() } : t)));
  const clearDone = () => {
    if (done > 1 && !window.confirm(`Delete ${done} completed tasks?`)) return;
    setTodos((p) => p.filter((t) => !t.completed));
  };

  async function runAI(action) {
    if (ai.loading) return;
    if (!text.trim()) return setAi({ loading: false, error: 'Type a task or goal first.', action: null, result: null, picked: [] });
    setAi({ loading: true, error: '', action, result: null, picked: [] });
    try {
      const res = await fetch('/api/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, task: text }) });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || 'Something went wrong. Please try again.');
      const result = cleanAI(action, data);
      setAi({ loading: false, error: '', action, result, picked: result.tasks ? result.tasks.map((_, i) => i) : [] });
    } catch (e) {
      setAi({ loading: false, error: e.message === 'Invalid AI response' ? 'Something went wrong. Please try again.' : e.message, action: null, result: null, picked: [] });
    }
  }
  const closeAI = () => setAi({ loading: false, error: '', action: null, result: null, picked: [] });

  const navBtn = (id, label, Icon, count) => (
    <button key={id} onClick={() => setFilter(id)} aria-current={filter === id ? 'page' : undefined}
      className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium ${filter === id ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5'}`}>
      <Icon size={18} /> <span className="hidden md:inline">{label}</span>
      {count != null && <span className="ml-auto hidden rounded-full bg-indigo-500/10 px-2 text-xs md:inline">{count}</span>}
    </button>
  );

  return (
    <div className="mx-auto flex min-h-screen max-w-[1400px]">
      <aside className="sticky top-0 flex h-screen w-16 shrink-0 flex-col gap-2 border-r border-slate-200/70 p-3 md:w-60 dark:border-white/10">
        <div className="mb-4 flex items-center gap-3 px-1 pt-2">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 text-white"><Check size={22} /></div>
          <div className="hidden md:block"><p className="font-bold leading-tight">AI Todo</p><p className="text-xs text-slate-500 dark:text-slate-400">Smarter Tasks. Greater Focus.</p></div>
        </div>
        <nav aria-label="Task views" className="flex flex-col gap-1">
          {navBtn('all', 'Overview', LayoutGrid)}
          {navBtn('active', 'My Tasks', ListChecks, active)}
          {navBtn('completed', 'Completed', CircleCheck)}
        </nav>
        <p className="mt-auto hidden px-2 pb-4 text-sm text-slate-500 md:block dark:text-slate-400">Tasks are saved in this browser only.</p>
      </aside>

      <main className="min-w-0 flex-1 p-4 md:p-8">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">{greeting} 👋</h1>
            <p className="text-slate-500 dark:text-slate-400">You've got this! Make today count.</p>
          </div>
          <div className="flex items-center gap-3">
            <time className="hidden text-sm text-slate-500 sm:block dark:text-slate-400">{ready ? new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : ''}</time>
            <button onClick={() => setDark(!dark)} aria-label="Toggle dark mode" className={`${card} grid h-11 w-11 place-items-center`}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <div className="min-w-0 space-y-6">
            <section className={`${card} p-5`} aria-labelledby="add-h">
              <h2 id="add-h" className="text-lg font-semibold">What do you need to accomplish?</h2>
              <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">Add a task, or let AI help you generate, break down, or improve your to-dos.</p>
              <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
                <label htmlFor="task" className="sr-only">Task</label>
                <input id="task" value={text} maxLength={MAX_INPUT} onChange={(e) => setText(e.target.value)} placeholder="e.g. Finish backend assignment, Build a hospital management API…" className={`${field} min-h-11 flex-1`} />
                <label htmlFor="prio" className="sr-only">Priority</label>
                <select id="prio" value={priority} onChange={(e) => setPriority(e.target.value)} className={`${field} min-h-11`}>
                  <option value="">No priority</option>
                  {PRIORITIES.map((p) => <option key={p} value={p}>{p[0].toUpperCase() + p.slice(1)}</option>)}
                </select>
                <button className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 px-5 font-semibold text-white"><Plus size={18} /> Add Task</button>
              </form>
              <div className="mt-3 flex flex-wrap gap-2">
                {AI_ACTIONS.map(({ id, label, Icon, chip }) => (
                  <button key={id} type="button" disabled={ai.loading} onClick={() => runAI(id)} className={`${chip} flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-medium disabled:opacity-50`}><Icon size={16} /> {label}</button>
                ))}
              </div>
              <div aria-live="polite">
                {ai.loading && <p className="mt-4 text-sm text-slate-500">AI is thinking…</p>}
                {ai.error && <p role="alert" className="mt-4 text-sm text-red-600 dark:text-red-400">{ai.error}</p>}
                {ai.result && (
                  <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 dark:border-indigo-400/20 dark:bg-indigo-500/10">
                    {ai.result.tasks && (<>
                      <p className="mb-2 text-sm font-medium">Review before adding</p>
                      <ul className="space-y-1">
                        {ai.result.tasks.map((t, i) => (
                          <li key={i}><label className="flex min-h-9 items-center gap-2 text-sm">
                            <input type="checkbox" checked={ai.picked.includes(i)} onChange={() => setAi({ ...ai, picked: ai.picked.includes(i) ? ai.picked.filter((x) => x !== i) : [...ai.picked, i] })} />
                            <span className="flex-1">{t.title}</span>
                            {t.priority && <span className={`rounded-full px-2 py-0.5 text-xs ${BADGE[t.priority]}`}>{t.priority}</span>}
                          </label></li>
                        ))}
                      </ul>
                      <div className="mt-3 flex gap-2">
                        <button disabled={!ai.picked.length} onClick={() => { add(ai.picked.map((i) => ai.result.tasks[i])); setText(''); closeAI(); }} className="min-h-10 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white disabled:opacity-50">Add selected ({ai.picked.length})</button>
                        <button onClick={closeAI} className="min-h-10 rounded-lg px-4 text-sm">Dismiss</button>
                      </div>
                    </>)}
                    {ai.result.title && (<>
                      <p className="text-sm text-slate-500">Suggested rewrite</p>
                      <p className="my-1 font-medium">{ai.result.title}</p>
                      <div className="mt-2 flex gap-2">
                        <button onClick={() => { setText(ai.result.title); closeAI(); }} className="min-h-10 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white">Accept</button>
                        <button onClick={closeAI} className="min-h-10 rounded-lg px-4 text-sm">Reject</button>
                      </div>
                    </>)}
                    {ai.result.priority && (<>
                      <p className="text-sm">Suggested priority: <span className={`rounded-full px-2 py-0.5 text-xs ${BADGE[ai.result.priority]}`}>{ai.result.priority}</span></p>
                      <div className="mt-2 flex gap-2">
                        <button onClick={() => { setPriority(ai.result.priority); closeAI(); }} className="min-h-10 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white">Use it</button>
                        <button onClick={closeAI} className="min-h-10 rounded-lg px-4 text-sm">Reject</button>
                      </div>
                    </>)}
                  </div>
                )}
              </div>
            </section>

            <section className={`${card} p-5`} aria-labelledby="tasks-h">
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <h2 id="tasks-h" className="mr-auto text-lg font-semibold">My Tasks</h2>
                <div role="group" aria-label="Filter tasks" className="flex gap-1">
                  {[['all', 'All', todos.length], ['active', 'Active', active], ['completed', 'Completed', done]].map(([id, label, n]) => (
                    <button key={id} onClick={() => setFilter(id)} aria-pressed={filter === id} className={`min-h-10 rounded-full px-4 text-sm font-medium ${filter === id ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300'}`}>{label} <span className="opacity-70">{n}</span></button>
                  ))}
                </div>
                {done > 0 && <button onClick={clearDone} className="min-h-10 text-sm text-slate-500 underline dark:text-slate-400">Clear completed</button>}
              </div>
              {ready && shown.length === 0 && <p className="py-10 text-center text-slate-500 dark:text-slate-400">{todos.length === 0 ? "You don't have any tasks yet. Add your first todo." : 'No tasks in this view.'}</p>}
              <ul className="divide-y divide-slate-200/70 dark:divide-white/10">
                {shown.map((t) => (
                  <li key={t.id} className="flex flex-wrap items-center gap-3 py-3">
                    <button role="checkbox" aria-checked={t.completed} aria-label={`Mark "${t.title}" ${t.completed ? 'active' : 'completed'}`} onClick={() => patch(t.id, { completed: !t.completed })}
                      className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg border-2 ${t.completed ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 dark:border-slate-500'}`}>{t.completed && <Check size={16} />}</button>
                    {editing === t.id ? (
                      <form className="flex min-w-0 flex-1 flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.target); const title = String(f.get('title')).trim(); if (title) patch(t.id, { title: title.slice(0, 140), priority: f.get('priority') || null, dueDate: f.get('due') || null }); setEditing(null); }}>
                        <input name="title" defaultValue={t.title} aria-label="Title" className={`${field} min-w-0 flex-1`} autoFocus />
                        <select name="priority" defaultValue={t.priority || ''} aria-label="Priority" className={field}><option value="">None</option>{PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}</select>
                        <input name="due" type="date" defaultValue={t.dueDate || ''} aria-label="Due date" className={field} />
                        <button className="min-h-10 rounded-lg bg-indigo-600 px-3 text-sm text-white">Save</button>
                        <button type="button" onClick={() => setEditing(null)} aria-label="Cancel edit" className="grid h-10 w-10 place-items-center"><X size={16} /></button>
                      </form>
                    ) : (<>
                      <div className="min-w-0 flex-1">
                        <p className={`break-words font-medium ${t.completed ? 'text-slate-400 line-through' : ''}`}>{t.title}</p>
                        {t.description && <p className="text-sm text-slate-500 dark:text-slate-400">{t.description}</p>}
                      </div>
                      {t.priority && <span className={`rounded-full px-3 py-1 text-xs font-medium ${BADGE[t.priority]}`}>{t.priority[0].toUpperCase() + t.priority.slice(1)}</span>}
                      {t.dueDate && <span className="text-sm text-slate-500 dark:text-slate-400">{new Date(t.dueDate + 'T00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>}
                      <button onClick={() => setEditing(t.id)} aria-label={`Edit "${t.title}"`} className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 dark:bg-white/10"><Pencil size={16} /></button>
                      <button onClick={() => setTodos((p) => p.filter((x) => x.id !== t.id))} aria-label={`Delete "${t.title}"`} className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 dark:bg-white/10"><Trash2 size={16} /></button>
                    </>)}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="space-y-6">
            <section className={`${card} p-5`} aria-label="Today's progress">
              <h2 className="mb-4 text-lg font-semibold">Today's Progress</h2>
              <div className="flex items-center gap-5">
                <div className="relative h-32 w-32 shrink-0">
                  <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90" aria-hidden="true">
                    <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="3" className="stroke-slate-200 dark:stroke-white/10" />
                    <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="3" strokeLinecap="round" stroke="#3b82f6" strokeDasharray={`${pct * 100} 100`} />
                  </svg>
                  <div className="absolute inset-0 grid place-items-center text-center"><div><p className="text-2xl font-bold">{done}/{todos.length}</p><p className="text-xs text-slate-500 dark:text-slate-400">tasks completed</p></div></div>
                </div>
                <dl className="flex-1 space-y-2 text-sm">
                  {[['Completed', done, 'bg-emerald-500'], ['Active', active, 'bg-blue-500'], ['Overdue', overdue, 'bg-red-500']].map(([l, n, c]) => (
                    <div key={l} className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${c}`} /><dt className="flex-1">{l}</dt><dd className="font-medium">{n}</dd></div>
                  ))}
                </dl>
              </div>
            </section>
            <section className={`${card} p-5`} aria-label="AI assistant">
              <h2 className="text-lg font-semibold">AI Assistant</h2>
              <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">Type a task above, then pick an action.</p>
              <div className="space-y-2">
                {AI_ACTIONS.map(({ id, title, hint, Icon, tile }) => (
                  <button key={id} disabled={ai.loading} onClick={() => runAI(id)} className="flex w-full items-center gap-3 rounded-xl border border-slate-200/70 p-3 text-left disabled:opacity-50 dark:border-white/10">
                    <span className={`${tile} grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white`}><Icon size={20} /></span>
                    <span><span className="block font-medium">{title}</span><span className="block text-xs text-slate-500 dark:text-slate-400">{hint}</span></span>
                  </button>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </main>
      {toast && <div role="status" className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 px-5 py-2 text-sm text-white">{toast}</div>}
    </div>
  );
}
