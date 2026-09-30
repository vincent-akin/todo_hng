export const ACTIONS = ['generate', 'breakdown', 'improve', 'prioritize'];
export const PRIORITIES = ['low', 'medium', 'high'];
export const MAX_INPUT = 500;

const bad = () => { throw new Error('Invalid AI response'); };

// Never trust AI output: validate and normalize before it reaches the UI.
export function cleanAI(action, data) {
  if (!data || typeof data !== 'object') bad();
  if (action === 'generate' || action === 'breakdown') {
    if (!Array.isArray(data.tasks)) bad();
    const tasks = data.tasks
      .filter((t) => t && typeof t.title === 'string' && t.title.trim())
      .slice(0, 12)
      .map((t) => ({ title: t.title.trim().slice(0, 140), priority: PRIORITIES.includes(t.priority) ? t.priority : null }));
    if (!tasks.length) bad();
    return { tasks };
  }
  if (action === 'improve') {
    if (typeof data.title !== 'string' || !data.title.trim()) bad();
    return { title: data.title.trim().slice(0, 140) };
  }
  if (action === 'prioritize') {
    if (!PRIORITIES.includes(data.priority)) bad();
    return { priority: data.priority };
  }
  return bad();
}
