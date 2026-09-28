const STORAGE_KEY = "todos-v2";

const ICON_PATHS = {
  idea: "M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z",
  food: "M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 21V3c-2 1.5-3 4-3 7v3h3",
  work: "M9 4h6v3H9zM7 5.5H6a2 2 0 0 0-2 2V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5a2 2 0 0 0-2-2h-1M9 14l2 2 4-4",
  sport: "M6 8v8M3 10v4M18 8v8M21 10v4M6 12h12",
  music: "M9 18V6l10-2v12M9 18a3 3 0 1 1-3-3 3 3 0 0 1 3 3zM19 16a3 3 0 1 1-3-3 3 3 0 0 1 3 3z",
  trash: "M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3",
};
const CATEGORIES = [
  { id: "idea", label: "Idea" },
  { id: "food", label: "Food" },
  { id: "work", label: "Work" },
  { id: "sport", label: "Sport" },
  { id: "music", label: "Music" },
];

const $ = (id) => document.getElementById(id);
const list = $("list");
const daysEl = $("days");
const dialog = $("dialog");
const form = $("task-form");
const filterButtons = document.querySelectorAll("[data-filter]");

// Static icon markup only, never user text.
function icon(name) {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + ICON_PATHS[name] + '"/></svg>';
}

function toISO(d) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + m + "-" + day;
}
function fromISO(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

let todos = load();
let selected = toISO(new Date());
let filter = "all";

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (e) {
    return [];
  }
}
function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (e) {
    /* storage unavailable; the list still works for this session */
  }
}

function weekDays() {
  const today = new Date();
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - ((today.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i));
}

function dayTodos() {
  return todos
    .filter((t) => t.date === selected)
    .sort((a, b) => a.start.localeCompare(b.start));
}

function renderDays() {
  daysEl.textContent = "";
  weekDays().forEach((d) => {
    const iso = toISO(d);
    const b = document.createElement("button");
    b.type = "button";
    b.className = "day" + (todos.some((t) => t.date === iso) ? " has" : "");
    b.setAttribute("aria-pressed", String(iso === selected));
    const num = document.createElement("b");
    num.textContent = d.getDate();
    const dow = document.createElement("small");
    dow.textContent = d.toLocaleDateString(undefined, { weekday: "short" });
    const dot = document.createElement("i");
    dot.className = "dot";
    b.append(num, dow, dot);
    b.addEventListener("click", () => {
      selected = iso;
      render();
    });
    daysEl.appendChild(b);
  });
}

function renderHero() {
  const d = fromISO(selected);
  const isToday = selected === toISO(new Date());
  $("hero-date").textContent = d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
  $("hero-title").textContent = isToday ? "Today" : d.toLocaleDateString(undefined, { weekday: "long" });
  const n = dayTodos().length;
  $("hero-sub").textContent = n + (n === 1 ? " Task" : " Tasks");
}

function renderList() {
  list.textContent = "";
  const all = dayTodos();
  const firstOpen = all.find((t) => !t.done);
  const shown = all.filter((t) =>
    filter === "active" ? !t.done : filter === "done" ? t.done : true
  );

  shown.forEach((todo) => {
    const li = document.createElement("li");
    li.className = "item" + (todo.done ? " done" : "") + (todo === firstOpen ? " current" : "");

    const tile = document.createElement("span");
    tile.className = "tile";
    tile.innerHTML = icon(todo.category);

    const info = document.createElement("div");
    info.className = "info";
    const time = document.createElement("span");
    time.className = "time";
    time.textContent = todo.start + " - " + todo.end;
    const title = document.createElement("span");
    title.className = "title";
    title.textContent = todo.title;
    info.append(time, title);
    if (todo.desc) {
      const desc = document.createElement("span");
      desc.className = "desc";
      desc.textContent = todo.desc;
      info.append(desc);
    }

    const del = document.createElement("button");
    del.type = "button";
    del.className = "del";
    del.innerHTML = icon("trash");
    del.setAttribute("aria-label", "Delete: " + todo.title);
    del.addEventListener("click", () => {
      todos = todos.filter((t) => t.id !== todo.id);
      save();
      render();
    });

    const box = document.createElement("input");
    box.type = "checkbox";
    box.checked = todo.done;
    box.setAttribute("aria-label", "Mark done: " + todo.title);
    box.addEventListener("change", () => {
      todo.done = box.checked;
      save();
      render();
    });

    li.append(tile, info, del, box);
    list.appendChild(li);
  });

  $("empty").hidden = shown.length > 0;
  if (!shown.length) {
    $("empty-text").textContent = all.length
      ? "No tasks in this view."
      : "No tasks for this day. Tap Add New to create one.";
  }
  $("clear-btn").hidden = !all.some((t) => t.done);
  filterButtons.forEach((b) =>
    b.setAttribute("aria-pressed", String(b.dataset.filter === filter))
  );
}

function render() {
  renderDays();
  renderHero();
  renderList();
}

function buildCategoryPicker() {
  const wrap = $("cats");
  CATEGORIES.forEach((c, i) => {
    const label = document.createElement("label");
    label.className = "cat";
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "category";
    radio.value = c.id;
    radio.checked = i === 0;
    const span = document.createElement("span");
    span.innerHTML = icon(c.id);
    span.append(c.label);
    label.append(radio, span);
    wrap.appendChild(label);
  });
}

function openDialog() {
  form.reset();
  $("f-date").value = selected;
  $("f-start").value = "09:00";
  $("f-end").value = "10:00";
  $("form-error").hidden = true;
  dialog.showModal();
  $("f-title").focus();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const start = $("f-start").value;
  const end = $("f-end").value;
  if (end <= start) {
    $("form-error").hidden = false;
    return;
  }
  const date = $("f-date").value;
  todos.push({
    id: Date.now(),
    title: $("f-title").value.trim(),
    desc: $("f-desc").value.trim(),
    category: form.elements.category.value,
    date,
    start,
    end,
    done: false,
  });
  selected = date;
  filter = "all";
  save();
  render();
  dialog.close();
});

$("open-add").addEventListener("click", openDialog);
$("fab").addEventListener("click", openDialog);
$("close-dlg").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) dialog.close();
});
$("clear-btn").addEventListener("click", () => {
  todos = todos.filter((t) => !(t.date === selected && t.done));
  save();
  render();
});
filterButtons.forEach((b) =>
  b.addEventListener("click", () => {
    filter = b.dataset.filter;
    render();
  })
);

buildCategoryPicker();
render();
