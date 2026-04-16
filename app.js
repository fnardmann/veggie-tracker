'use strict';

const STORAGE_KEY = 'veggie-tracker-v1';
const WEEKLY_GOAL = 30;

const FOODS = [
  // Vegetables
  'Artichoke', 'Arugula', 'Asparagus', 'Aubergine', 'Avocado',
  'Bamboo Shoots', 'Bean Sprouts', 'Beetroot', 'Bell Pepper', 'Bitter Melon',
  'Bok Choy', 'Broccoli', 'Brussels Sprouts', 'Butternut Squash', 'Cabbage',
  'Carrot', 'Cauliflower', 'Celeriac', 'Celery', 'Chard',
  'Chicory', 'Chilli', 'Chives', 'Courgette', 'Cucumber',
  'Edamame', 'Endive', 'Fennel', 'Garlic', 'Ginger',
  'Green Beans', 'Jalapeño', 'Kale', 'Kohlrabi', 'Leek',
  'Lettuce', 'Lotus Root', 'Mangetout', 'Mushroom', 'Okra',
  'Onion', 'Oyster Mushroom', 'Pak Choi', 'Parsnip', 'Peas',
  'Portobello', 'Potato', 'Pumpkin', 'Radicchio', 'Radish',
  'Red Cabbage', 'Red Onion', 'Rocket', 'Romanesco', 'Savoy Cabbage',
  'Shallot', 'Shiitake', 'Spinach', 'Spring Onion', 'Squash',
  'Swede', 'Sweet Corn', 'Sweet Potato', 'Swiss Chard', 'Taro',
  'Tenderstem Broccoli', 'Tomato', 'Turnip', 'Watercress',
  'White Cabbage', 'Yam', 'Zucchini',
  // Fruits
  'Apple', 'Apricot', 'Banana', 'Blackberry', 'Blackcurrant',
  'Blueberry', 'Cherry', 'Clementine', 'Cranberry', 'Date',
  'Dragon Fruit', 'Elderberry', 'Fig', 'Gooseberry', 'Grape',
  'Grapefruit', 'Guava', 'Jackfruit', 'Kiwi', 'Lemon',
  'Lime', 'Lychee', 'Mango', 'Melon', 'Nectarine',
  'Orange', 'Papaya', 'Passion Fruit', 'Peach', 'Pear',
  'Pineapple', 'Plum', 'Pomegranate', 'Raspberry', 'Redcurrant',
  'Satsuma', 'Strawberry', 'Tangerine', 'Watermelon',
  // Seeds
  'Chia Seeds', 'Flaxseeds', 'Hemp Seeds', 'Pumpkin Seeds',
  'Sesame Seeds', 'Sunflower Seeds', 'Poppy Seeds',
  // Nuts
  'Almonds', 'Brazil Nuts', 'Cashews', 'Hazelnuts', 'Macadamia Nuts',
  'Peanuts', 'Pecans', 'Pine Nuts', 'Pistachios', 'Walnuts',
].sort();

// ── Helpers ───────────────────────────────────────────────────────────────────

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function toTitleCase(str) {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

// ── Data ──────────────────────────────────────────────────────────────────────

function getData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"entries":[]}');
  } catch {
    return { entries: [] };
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Returns 'ok' | 'duplicate' | 'empty'
function addEntry(date, vegetable) {
  const trimmed = vegetable.trim();
  if (!trimmed) return 'empty';
  const data = getData();
  const norm = trimmed.toLowerCase();
  if (data.entries.some(e => e.date === date && e.vegetable.toLowerCase() === norm)) return 'duplicate';
  data.entries.push({ id: crypto.randomUUID(), date, vegetable: toTitleCase(trimmed) });
  data.entries.sort((a, b) => b.date.localeCompare(a.date) || a.vegetable.localeCompare(b.vegetable));
  saveData(data);
  return 'ok';
}

function removeEntry(id) {
  const data = getData();
  data.entries = data.entries.filter(e => e.id !== id);
  saveData(data);
}

// ── Date utils ────────────────────────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

// Offset dateStr by n days using UTC noon to avoid DST jumps
function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().split('T')[0];
}

// Returns ISO date string for the Monday of the week containing dateStr
function getWeekStart(dateStr) {
  const d = new Date(dateStr + 'T12:00:00Z');
  const dow = d.getUTCDay(); // 0=Sun
  return addDays(dateStr, dow === 0 ? -6 : 1 - dow);
}

function fmtDate(dateStr) {
  const [y, m, day] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, day).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function fmtWeekRange(weekStart) {
  return `${fmtDate(weekStart)}–${fmtDate(addDays(weekStart, 6))}`;
}

function fmtMonthKey(mk) {
  const [y, m] = mk.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
}

// ── Analytics ─────────────────────────────────────────────────────────────────

function uniqueVeggies(entries) {
  return [...new Set(entries.map(e => e.vegetable.toLowerCase()))];
}

function entriesInRange(entries, from, to) {
  return entries.filter(e => e.date >= from && e.date <= to);
}

function thisWeekEntries() {
  const { entries } = getData();
  const ws = getWeekStart(todayStr());
  return entriesInRange(entries, ws, addDays(ws, 6));
}

// ── Chart data builders ────────────────────────────────────────────────────────

function dailyChartData(days = 14) {
  const { entries } = getData();
  const today = todayStr();
  return Array.from({ length: days }, (_, i) => {
    const date = addDays(today, -(days - 1 - i));
    const count = uniqueVeggies(entries.filter(e => e.date === date)).length;
    return { label: fmtDate(date), count };
  });
}

function weeklyChartData(weeks = 12) {
  const { entries } = getData();
  const ws0 = getWeekStart(todayStr());
  return Array.from({ length: weeks }, (_, i) => {
    const ws = addDays(ws0, -(weeks - 1 - i) * 7);
    const we = addDays(ws, 6);
    const count = uniqueVeggies(entriesInRange(entries, ws, we)).length;
    return { label: fmtWeekRange(ws), count, metGoal: count >= WEEKLY_GOAL };
  });
}

function monthlyChartData(months = 12) {
  const { entries } = getData();
  const now = new Date();
  return Array.from({ length: months }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
    const mk = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const count = uniqueVeggies(entries.filter(e => e.date.startsWith(mk))).length;
    return { label: fmtMonthKey(mk), count };
  });
}

// ── Streak calculations ────────────────────────────────────────────────────────

function dailyStreak() {
  const { entries } = getData();
  const dates = new Set(entries.map(e => e.date));
  let streak = 0, d = todayStr();
  while (dates.has(d)) { streak++; d = addDays(d, -1); }
  return streak;
}

function weeklyGoalStreak() {
  const { entries } = getData();
  let streak = 0;
  let ws = getWeekStart(todayStr());
  for (let i = 0; i < 104; i++) {
    const we = addDays(ws, 6);
    if (uniqueVeggies(entriesInRange(entries, ws, we)).length >= WEEKLY_GOAL) {
      streak++;
      ws = addDays(ws, -7);
    } else break;
  }
  return streak;
}

// Returns streak info per vegetable, sorted by active streak then total days
function veggieStreaks() {
  const { entries } = getData();
  const map = new Map();
  for (const e of entries) {
    const key = e.vegetable.toLowerCase();
    if (!map.has(key)) map.set(key, { name: e.vegetable, dates: new Set() });
    map.get(key).dates.add(e.date);
  }
  const today = todayStr();
  const yesterday = addDays(today, -1);

  return [...map.values()].map(({ name, dates }) => {
    const last = [...dates].sort().reverse()[0];
    let streak = 0;
    // Streak is active only if the vegetable was eaten today or yesterday
    if (last === today || last === yesterday) {
      let d = last;
      while (dates.has(d)) { streak++; d = addDays(d, -1); }
    }
    return { name, streak, last, total: dates.size };
  }).sort((a, b) => b.streak - a.streak || b.total - a.total || a.name.localeCompare(b.name));
}

// ── Chart rendering ───────────────────────────────────────────────────────────

const C = {
  dark:     '#2d6a4f',
  main:     '#40916c',
  light:    '#74c69d',
  pale:     '#b7e4c7',
  amber:    'rgba(231,111,81,0.85)',
};

const chartInstances = {};

function mkChart(id, config) {
  if (chartInstances[id]) chartInstances[id].destroy();
  chartInstances[id] = new Chart(document.getElementById(id), config);
}

function renderDailyChart() {
  const data = dailyChartData(14);
  mkChart('dailyChart', {
    type: 'bar',
    data: {
      labels: data.map(d => d.label),
      datasets: [{
        data: data.map(d => d.count),
        backgroundColor: data.map(d => d.count > 0 ? C.light : C.pale),
        borderColor: data.map(d => d.count > 0 ? C.main : C.pale),
        borderWidth: 1,
        borderRadius: 4,
        label: 'Unique vegetables',
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, precision: 0 },
          grid: { color: '#f0f5f2' },
        },
        x: { grid: { display: false }, ticks: { font: { size: 10 } } },
      },
    },
  });
}

function renderWeeklyChart() {
  const data = weeklyChartData(12);
  mkChart('weeklyChart', {
    type: 'bar',
    data: {
      labels: data.map(d => d.label),
      datasets: [
        {
          type: 'bar',
          data: data.map(d => d.count),
          backgroundColor: data.map(d => d.metGoal ? C.main : C.light),
          borderColor: data.map(d => d.metGoal ? C.dark : C.main),
          borderWidth: 1,
          borderRadius: 4,
          label: 'Unique vegetables',
        },
        {
          type: 'line',
          data: data.map(() => WEEKLY_GOAL),
          borderColor: C.amber,
          borderWidth: 2,
          borderDash: [6, 4],
          pointRadius: 0,
          fill: false,
          tension: 0,
          label: 'Goal (30)',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, labels: { boxWidth: 12, font: { size: 11 } } },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: Math.max(WEEKLY_GOAL + 5, Math.max(...data.map(d => d.count)) + 3),
          grid: { color: '#f0f5f2' },
        },
        x: { grid: { display: false }, ticks: { font: { size: 9 }, maxRotation: 45 } },
      },
    },
  });
}

function renderMonthlyChart() {
  const data = monthlyChartData(12);
  mkChart('monthlyChart', {
    type: 'bar',
    data: {
      labels: data.map(d => d.label),
      datasets: [{
        data: data.map(d => d.count),
        backgroundColor: data.map(d => d.count >= WEEKLY_GOAL ? C.main : C.light),
        borderColor: data.map(d => d.count >= WEEKLY_GOAL ? C.dark : C.main),
        borderWidth: 1,
        borderRadius: 4,
        label: 'Unique vegetables',
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: '#f0f5f2' } },
        x: { grid: { display: false } },
      },
    },
  });
}

function renderWeeklyProgress() {
  const entries = thisWeekEntries();
  const count = uniqueVeggies(entries).length;
  document.getElementById('weeklyCount').textContent = count;

  mkChart('weeklyProgressChart', {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [Math.min(count, WEEKLY_GOAL), Math.max(0, WEEKLY_GOAL - count)],
        backgroundColor: [count >= WEEKLY_GOAL ? C.main : C.light, C.pale],
        borderWidth: 0,
      }],
    },
    options: {
      cutout: '74%',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
    },
  });

  const uniqueNames = [...new Map(
    entries.map(e => [e.vegetable.toLowerCase(), e.vegetable])
  ).values()].sort();

  document.getElementById('weeklyVeggies').innerHTML =
    uniqueNames.map(v => `<span class="chip">${esc(v)}</span>`).join('') ||
    '<p class="empty">None yet this week.</p>';
}

// ── Section renderers ─────────────────────────────────────────────────────────

function renderToday() {
  const today = todayStr();
  document.getElementById('todayHeading').textContent =
    `Today · ${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}`;

  const { entries } = getData();
  const todayEntries = entries.filter(e => e.date === today);
  const container = document.getElementById('todayList');

  if (todayEntries.length === 0) {
    container.innerHTML = '<p class="empty">No vegetables logged today yet.</p>';
  } else {
    container.innerHTML = todayEntries.map(e => `
      <div class="entry-row">
        <span class="entry-veggie">${esc(e.vegetable)}</span>
        <button class="delete-btn" data-id="${esc(e.id)}" title="Remove">×</button>
      </div>
    `).join('');
    container.querySelectorAll('.delete-btn').forEach(btn =>
      btn.addEventListener('click', () => { removeEntry(btn.dataset.id); renderAll(); })
    );
  }
}

function renderQuickAdd() {
  const { entries } = getData();
  const today = todayStr();
  const todayVeggies = new Set(entries.filter(e => e.date === today).map(e => e.vegetable.toLowerCase()));

  // Most recently eaten unique veggies not yet logged today
  const seen = new Set();
  const recent = [];
  for (const e of entries) {
    const key = e.vegetable.toLowerCase();
    if (!seen.has(key) && !todayVeggies.has(key)) {
      seen.add(key);
      recent.push(e.vegetable);
      if (recent.length >= 8) break;
    }
  }

  const container = document.getElementById('quickAdd');
  if (recent.length === 0) {
    container.innerHTML = '<p class="empty" style="font-size:.75rem">All recent veg already logged today!</p>';
    return;
  }
  container.innerHTML = recent
    .map(v => `<button class="quick-chip" data-veggie="${esc(v)}">${esc(v)}</button>`)
    .join('');
  container.querySelectorAll('[data-veggie]').forEach(btn =>
    btn.addEventListener('click', () => { addEntry(today, btn.dataset.veggie); renderAll(); })
  );
}

function renderStreaks() {
  const ds = dailyStreak();
  const ws = weeklyGoalStreak();
  document.getElementById('dailyStreak').textContent = ds;
  document.getElementById('weeklyStreak').textContent = ws;
  document.getElementById('headerDailyStreak').textContent =
    ds === 0 ? 'No streak' : `${ds} day streak`;
  document.getElementById('headerWeeklyStreak').textContent =
    ws === 0 ? 'No week streak' : `${ws} week streak`;

  const streaks = veggieStreaks();
  const container = document.getElementById('veggieStreaks');

  if (streaks.length === 0) {
    container.innerHTML = '<p class="empty">Log vegetables to see streaks.</p>';
    return;
  }

  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Vegetable</th>
          <th>Current streak</th>
          <th>Total days</th>
          <th>Last eaten</th>
        </tr>
      </thead>
      <tbody>
        ${streaks.map(s => `
          <tr>
            <td>${esc(s.name)}</td>
            <td>${s.streak > 0 ? `🔥 ${s.streak} day${s.streak > 1 ? 's' : ''}` : '—'}</td>
            <td>${s.total}</td>
            <td>${fmtDate(s.last)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function renderHistory() {
  const { entries } = getData();
  const container = document.getElementById('historyList');

  if (entries.length === 0) {
    container.innerHTML = '<p class="empty">No history yet.</p>';
    return;
  }

  // Group by date (entries are pre-sorted newest first)
  const byDate = new Map();
  for (const e of entries) {
    if (!byDate.has(e.date)) byDate.set(e.date, []);
    byDate.get(e.date).push(e);
  }
  const dates = [...byDate.keys()].slice(0, 60);

  container.innerHTML = dates.map(date => {
    const dayEntries = byDate.get(date);
    const uniq = uniqueVeggies(dayEntries).length;
    return `
      <div class="history-day">
        <div class="history-date">
          ${fmtDate(date)}
          <span class="history-count"> · ${uniq} veg</span>
        </div>
        <div class="history-chips">
          ${dayEntries.map(e => `
            <span class="chip">
              ${esc(e.vegetable)}
              <button class="chip-delete" data-id="${esc(e.id)}" title="Remove">×</button>
            </span>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.chip-delete').forEach(btn =>
    btn.addEventListener('click', () => { removeEntry(btn.dataset.id); renderAll(); })
  );
}

// ── DGE weekly reference values (Deutsche Gesellschaft für Ernährung) ─────────
// Based on DGE Referenzwerte for adults 25–51, daily × 7 for weekly targets.
const DGE = [
  { key: 'fibre',     label: 'Fibre',      unit: 'g',   daily: 30,   note: '30 g/day'          },
  { key: 'vita',      label: 'Vitamin A',  unit: 'µg',  daily: 800,  note: '700–850 µg/day'    },
  { key: 'b1',        label: 'Vitamin B1', unit: 'mg',  daily: 1.1,  note: '1.0–1.3 mg/day'    },
  { key: 'b2',        label: 'Vitamin B2', unit: 'mg',  daily: 1.2,  note: '1.1–1.4 mg/day'    },
  { key: 'b3',        label: 'Vitamin B3', unit: 'mg',  daily: 14,   note: '11–17 mg/day'      },
  { key: 'b5',        label: 'Vitamin B5', unit: 'mg',  daily: 5,    note: '5 mg/day'           },
  { key: 'b6',        label: 'Vitamin B6', unit: 'mg',  daily: 1.4,  note: '1.2–1.6 mg/day'    },
  { key: 'b9',        label: 'Folate',     unit: 'µg',  daily: 300,  note: '300 µg/day'         },
  { key: 'vitc',      label: 'Vitamin C',  unit: 'mg',  daily: 100,  note: '95–110 mg/day'      },
  { key: 'vitd',      label: 'Vitamin D',  unit: 'µg',  daily: 20,   note: '20 µg/day'          },
  { key: 'vite',      label: 'Vitamin E',  unit: 'mg',  daily: 12,   note: '11–15 mg/day'       },
  { key: 'vitk',      label: 'Vitamin K',  unit: 'µg',  daily: 70,   note: '60–80 µg/day'       },
  { key: 'iron',      label: 'Iron',       unit: 'mg',  daily: 12,   note: '10–15 mg/day'       },
  { key: 'calcium',   label: 'Calcium',    unit: 'mg',  daily: 1000, note: '1000 mg/day'        },
  { key: 'magnesium', label: 'Magnesium',  unit: 'mg',  daily: 325,  note: '300–350 mg/day'     },
  { key: 'potassium', label: 'Potassium',  unit: 'mg',  daily: 4000, note: '4000 mg/day'        },
  { key: 'zinc',      label: 'Zinc',       unit: 'mg',  daily: 8,    note: '7–10 mg/day'        },
];

// ── Nutrition tab rendering ───────────────────────────────────────────────────

function fmtVal(val) {
  if (val == null) return '—';
  return Number.isInteger(val) ? String(val) : val.toFixed(1);
}

async function renderNutritionTab() {
  const entries = thisWeekEntries();
  const empty = '<p class="empty">Log foods to see nutrition data.</p>';

  if (entries.length === 0) {
    document.getElementById('nutritionTable').innerHTML = empty;
    document.getElementById('nutritionTotals').innerHTML = empty;
    document.getElementById('nutritionDGE').innerHTML = empty;
    return;
  }

  // Count occurrences per food (same food on multiple days counts multiple times)
  const foodCounts = new Map();
  for (const e of entries) {
    const key = e.vegetable.toLowerCase();
    if (!foodCounts.has(key)) foodCounts.set(key, { name: e.vegetable, count: 0 });
    foodCounts.get(key).count++;
  }

  const uniqueFoods = [...foodCounts.values()].map(f => f.name).sort();

  document.getElementById('nutritionTable').innerHTML = '<p class="empty">Fetching nutrition data…</p>';
  document.getElementById('nutritionTotals').innerHTML = '<p class="empty">Fetching nutrition data…</p>';
  document.getElementById('nutritionDGE').innerHTML = '<p class="empty">Fetching nutrition data…</p>';

  const results = await fetchNutritionForAll(uniqueFoods);

  // ── Per-food table ──
  const headerCells = NUTRIENT_DEFS
    .map(d => `<th>${esc(d.label)}<br><small>${esc(d.unit)}</small></th>`)
    .join('');

  const tableRows = results.map(({ vegetable, nutrition: n }) => {
    const count = foodCounts.get(vegetable.toLowerCase())?.count ?? 1;
    const timesLabel = count > 1 ? `<span class="n-portion">×${count} this week</span>` : '';
    const portionLabel = n ? `<span class="n-portion">${n.g}g</span>` : '';
    const cells = NUTRIENT_DEFS.map(({ key }) => {
      if (!n || n[key] == null) return '<td class="n-na">—</td>';
      return `<td>${fmtVal(n[key])}</td>`;
    }).join('');
    return `<tr><td class="n-veggie">${esc(vegetable)}${portionLabel}${timesLabel}</td>${cells}</tr>`;
  }).join('');

  if (!results.some(r => r.nutrition)) {
    const noData = '<p class="empty">No nutrition data available for this week\'s foods.</p>';
    document.getElementById('nutritionTable').innerHTML = noData;
    document.getElementById('nutritionTotals').innerHTML = noData;
    document.getElementById('nutritionDGE').innerHTML = noData;
    return;
  }

  document.getElementById('nutritionTable').innerHTML = `
    <div class="nutrition-scroll">
      <table class="nutrition-table">
        <thead><tr><th>Food <span class="n-portion">portion · frequency</span></th>${headerCells}</tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
    </div>`;

  // ── Weekly totals ──
  const totals = {};
  for (const { key } of NUTRIENT_DEFS) totals[key] = null;

  for (const { vegetable, nutrition: n } of results) {
    if (!n) continue;
    const count = foodCounts.get(vegetable.toLowerCase())?.count ?? 1;
    for (const { key } of NUTRIENT_DEFS) {
      if (n[key] != null) {
        totals[key] = (totals[key] ?? 0) + n[key] * count;
      }
    }
  }

  // Round totals
  for (const key of Object.keys(totals)) {
    if (totals[key] != null) totals[key] = Math.round(totals[key] * 10) / 10;
  }

  const totalCells = NUTRIENT_DEFS.map(({ key }) =>
    totals[key] != null ? `<td><strong>${fmtVal(totals[key])}</strong></td>` : '<td class="n-na">—</td>'
  ).join('');

  document.getElementById('nutritionTotals').innerHTML = `
    <div class="nutrition-scroll">
      <table class="nutrition-table">
        <thead><tr><th>Total this week</th>${headerCells}</tr></thead>
        <tbody><tr><td class="n-veggie">All logged plants</td>${totalCells}</tr></tbody>
      </table>
    </div>`;

  // ── DGE comparison ──
  const dgeRows = DGE.map(({ key, label, unit, daily, note }) => {
    const weeklyTarget = daily * 7;
    const actual = totals[key];
    if (actual == null) return `
      <div class="dge-row">
        <div class="dge-meta">
          <span class="dge-label">${esc(label)}</span>
          <span class="dge-note">${esc(note)}</span>
        </div>
        <div class="dge-bar-wrap">
          <div class="dge-bar-bg"><div class="dge-bar" style="width:0%"></div></div>
          <span class="dge-nums n-na">No data</span>
        </div>
      </div>`;

    const pct = Math.min((actual / weeklyTarget) * 100, 100);
    const overPct = actual > weeklyTarget ? ((actual / weeklyTarget - 1) * 100) : 0;
    const barClass = pct >= 80 ? 'dge-bar--good' : pct >= 40 ? 'dge-bar--mid' : 'dge-bar--low';
    const display = `${fmtVal(actual)} / ${weeklyTarget} ${esc(unit)}`;
    const pctLabel = actual > weeklyTarget
      ? `<span class="dge-pct dge-pct--over">+${Math.round(overPct)}% over</span>`
      : `<span class="dge-pct">${Math.round(pct)}%</span>`;

    return `
      <div class="dge-row">
        <div class="dge-meta">
          <span class="dge-label">${esc(label)}</span>
          <span class="dge-note">${esc(note)} · weekly target: ${weeklyTarget} ${esc(unit)}</span>
        </div>
        <div class="dge-bar-wrap">
          <div class="dge-bar-bg"><div class="dge-bar ${barClass}" style="width:${pct}%"></div></div>
          <span class="dge-nums">${display} ${pctLabel}</span>
        </div>
      </div>`;
  }).join('');

  document.getElementById('nutritionDGE').innerHTML = `
    <p class="dge-disclaimer">Values reflect logged plants only — not your full diet. DGE reference values for adults 25–51.</p>
    <div class="dge-list">${dgeRows}</div>`;
}

function renderAll() {
  renderWeeklyProgress();
  renderToday();
  renderQuickAdd();
  renderDailyChart();
  renderWeeklyChart();
  renderMonthlyChart();
  renderStreaks();
  renderHistory();
  // Nutrition tab renders on demand when the tab is opened,
  // but re-render if it's currently visible
  if (!document.getElementById('tab-nutrition').hidden) {
    renderNutritionTab();
  }
}

// ── Export / Import ───────────────────────────────────────────────────────────

function exportData() {
  const blob = new Blob([JSON.stringify(getData(), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `veggie-tracker-${todayStr()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const imported = JSON.parse(e.target.result);
      if (!imported.entries || !Array.isArray(imported.entries)) throw new Error('Bad format');
      const current = getData();
      const existingIds = new Set(current.entries.map(e => e.id));
      for (const entry of imported.entries) {
        if (!existingIds.has(entry.id)) current.entries.push(entry);
      }
      current.entries.sort((a, b) => b.date.localeCompare(a.date));
      saveData(current);
      renderAll();
    } catch {
      alert('Could not import — make sure it is a valid Veggie Tracker export file.');
    }
  };
  reader.readAsText(file);
}

// ── Init ──────────────────────────────────────────────────────────────────────

function init() {
  // Populate datalist for autocomplete
  const datalist = document.getElementById('veggie-list');
  FOODS.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v;
    datalist.appendChild(opt);
  });

  document.getElementById('dateInput').value = todayStr();

  document.getElementById('addBtn').addEventListener('click', () => {
    const date = document.getElementById('dateInput').value;
    const veggie = document.getElementById('veggieInput').value.trim();
    const msg = document.getElementById('addMsg');

    if (!date)   { msg.textContent = 'Please select a date.'; return; }
    if (!veggie) { msg.textContent = 'Please enter a vegetable name.'; return; }

    const result = addEntry(date, veggie);
    if (result === 'duplicate') {
      msg.textContent = `${toTitleCase(veggie)} already logged for ${fmtDate(date)}.`;
      return;
    }
    msg.textContent = '';
    document.getElementById('veggieInput').value = '';
    renderAll();
  });

  document.getElementById('veggieInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('addBtn').click();
  });

  document.getElementById('exportBtn').addEventListener('click', exportData);
  document.getElementById('importInput').addEventListener('change', e => {
    if (e.target.files[0]) importData(e.target.files[0]);
    e.target.value = '';
  });

  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => { p.hidden = true; });
      btn.classList.add('active');
      const pane = document.getElementById('tab-' + btn.dataset.tab);
      pane.hidden = false;
      if (btn.dataset.tab === 'nutrition') renderNutritionTab();
    });
  });

  renderAll();
}

document.addEventListener('DOMContentLoaded', init);
