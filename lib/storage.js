// All persistence lives here so localStorage can be swapped for a database later.
const KEY = 'ai-todo:v1';

export function loadTodos() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTodos(todos) {
  try {
    localStorage.setItem(KEY, JSON.stringify(todos));
    return true;
  } catch {
    return false;
  }
}

export function createTodo({ title, priority = null, description = null, dueDate = null }) {
  const now = new Date().toISOString();
  return { id: crypto.randomUUID(), title: title.trim(), description, completed: false, priority, dueDate, createdAt: now, updatedAt: now };
}
