const TRACKS = [
  { id: 'bear', name: 'Bear', start: 1 },
  { id: 'elk', name: 'Elk', start: 1 },
  { id: 'fox', name: 'Fox', start: 1 },
  { id: 'hawk', name: 'Hawk', start: 1 },
  { id: 'salmon', name: 'Salmon', start: 1 },
  { id: 'pinecone', name: 'Pinecone', start: 2 },
];
const STEPS = [-3, -2, -1, 1, 2, 3];
const EXTRA_STEPS = [-6, -5, -4, 4, 5, 6];
const STORAGE_KEY = 'cascadia-rolling-counter';
const EXPANDED_KEY = 'cascadia-rolling-counter-expanded';
const HISTORY_KEY = 'cascadia-rolling-counter-history';
const DELTA_VISIBLE_MS = 2000;

const counts = load();
// Changes since the last reset, oldest first: { id, delta, value, time }
const log = loadLog();
const rows = {};

function load() {
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    // no storage or bad data: use the starting values
  }
  const result = {};
  for (const { id, start } of TRACKS) {
    result[id] = Number.isInteger(saved[id]) && saved[id] >= 0 ? saved[id] : start;
  }
  return result;
}

function loadLog() {
  let saved = [];
  try {
    saved = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch {
    // no storage or bad data: start with an empty history
  }
  if (!Array.isArray(saved)) return [];
  return saved.filter((entry) =>
    entry && TRACKS.some((t) => t.id === entry.id) &&
    Number.isInteger(entry.delta) && Number.isInteger(entry.value) && Number.isFinite(entry.time));
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
    localStorage.setItem(HISTORY_KEY, JSON.stringify(log));
  } catch {
    // counting still works without persistence
  }
}

function label(step) {
  return step > 0 ? `+${step}` : `−${-step}`;
}

function stepButton(track, step, extra = false) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = extra ? 'step extra' : 'step';
  button.textContent = label(step);
  button.setAttribute('aria-label', `${track.name} ${step > 0 ? 'plus' : 'minus'} ${Math.abs(step)}`);
  button.addEventListener('click', () => change(track.id, step));
  return button;
}

function buildRow(track) {
  const row = document.createElement('section');
  row.className = `row ${track.id}`;

  const counter = document.createElement('div');
  counter.className = 'counter';

  const icon = document.createElement('img');
  icon.src = `icons/${track.id}.png`;
  icon.alt = track.name;

  const value = document.createElement('output');
  value.className = 'value';
  value.textContent = counts[track.id];

  const delta = document.createElement('span');
  delta.className = 'delta';
  delta.setAttribute('aria-hidden', 'true');

  counter.append(icon, value, delta);
  row.append(
    ...STEPS.filter((s) => s < 0).map((s) => stepButton(track, s)),
    counter,
    ...STEPS.filter((s) => s > 0).map((s) => stepButton(track, s)),
    ...EXTRA_STEPS.map((s) => stepButton(track, s, true)),
  );

  rows[track.id] = { value, delta, pending: 0, timer: null, entry: null };
  return row;
}

function change(id, step) {
  const next = Math.max(0, counts[id] + step);
  const applied = next - counts[id];
  if (applied === 0) return;

  counts[id] = next;

  // Quick taps on the same counter are one history entry (+3 +3 +1 is logged as +7)
  const row = rows[id];
  if (row.entry && log[log.length - 1] === row.entry) {
    row.entry.delta += applied;
    row.entry.value = next;
    if (row.entry.delta === 0) {
      log.pop();
      row.entry = null;
    }
  } else {
    row.entry = { id, delta: applied, value: next, time: Date.now() };
    log.push(row.entry);
  }
  save();

  row.value.textContent = next;

  row.pending += applied;
  row.delta.textContent = label(row.pending);
  row.delta.classList.toggle('show', row.pending !== 0);
  clearTimeout(row.timer);
  row.timer = setTimeout(() => {
    row.pending = 0;
    row.entry = null;
    row.delta.classList.remove('show');
  }, DELTA_VISIBLE_MS);
}

function reset() {
  if (!confirm('Reset all counters to their starting values?')) return;
  for (const { id, start } of TRACKS) {
    counts[id] = start;
    const row = rows[id];
    row.value.textContent = start;
    row.pending = 0;
    row.entry = null;
    clearTimeout(row.timer);
    row.delta.classList.remove('show');
  }
  log.length = 0;
  save();
}

function historyItem(entry) {
  const track = TRACKS.find((t) => t.id === entry.id);
  const item = document.createElement('li');

  const icon = document.createElement('img');
  icon.src = `icons/${track.id}.png`;
  icon.alt = '';

  const name = document.createElement('span');
  name.className = 'name';
  name.textContent = track.name;

  const delta = document.createElement('span');
  delta.className = entry.delta > 0 ? 'change gain' : 'change loss';
  delta.textContent = label(entry.delta);

  const total = document.createElement('span');
  total.className = 'total';
  total.textContent = `→ ${entry.value}`;

  const time = document.createElement('time');
  time.textContent = new Date(entry.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  item.append(icon, name, delta, total, time);
  return item;
}

function showHistory() {
  // newest first
  document.getElementById('history-list').replaceChildren(...log.map(historyItem).reverse());
  document.getElementById('history-empty').hidden = log.length > 0;
  document.getElementById('history').showModal();
}

function setExpanded(expanded) {
  document.body.classList.toggle('expanded', expanded);
  const more = document.getElementById('more');
  more.textContent = expanded ? '−' : '+';
  more.setAttribute('aria-pressed', expanded);
  try {
    localStorage.setItem(EXPANDED_KEY, expanded ? '1' : '0');
  } catch {
    // the toggle still works without persistence
  }
}

function loadExpanded() {
  try {
    return localStorage.getItem(EXPANDED_KEY) === '1';
  } catch {
    return false;
  }
}

document.getElementById('rows').append(...TRACKS.map(buildRow));
setExpanded(loadExpanded());
document.getElementById('more').addEventListener('click', () => {
  setExpanded(!document.body.classList.contains('expanded'));
});
document.getElementById('reset').addEventListener('click', reset);
document.getElementById('show-history').addEventListener('click', showHistory);
document.getElementById('history').addEventListener('click', (event) => {
  // a tap on the backdrop, outside the dialog's content, closes it
  if (event.target === event.currentTarget) event.currentTarget.close();
});
