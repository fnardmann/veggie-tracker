'use strict';

const STORAGE_KEY = 'veggie-tracker-v1';
const SETTINGS_KEY = 'veggie-settings-v1';
const DEFAULT_GOAL = 30;
const DEFAULT_DAILY_GOAL = 5;

function getSettings() {
  try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'); } catch { return {}; }
}
function saveSettings(s) { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); }
function getGoal() { return getSettings().weeklyGoal ?? DEFAULT_GOAL; }
function getDailyGoal() { return getSettings().dailyGoal ?? DEFAULT_DAILY_GOAL; }

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
  'Chia Seeds', 'Flaxseeds', 'Linseeds', 'Hemp Seeds', 'Pumpkin Seeds',
  'Sesame Seeds', 'Sunflower Seeds', 'Poppy Seeds',
  // Nuts
  'Almonds', 'Brazil Nuts', 'Cashews', 'Hazelnuts', 'Macadamia Nuts',
  'Peanuts', 'Pecans', 'Pine Nuts', 'Pistachios', 'Walnuts',
  // Legumes
  'Chickpeas', 'Lentils', 'Red Lentils', 'Green Lentils',
  'Black Beans', 'Kidney Beans', 'Butter Beans', 'Cannellini Beans',
  'Pinto Beans', 'Mung Beans', 'Broad Beans', 'Soybeans',
  'Tofu', 'Tempeh',
  // Dried fruits
  'Raisins', 'Sultanas', 'Dried Apricots', 'Prunes',
  'Dried Cranberries', 'Dried Figs', 'Dried Mango', 'Goji Berries',
  // More fruits
  'Coconut', 'Mulberry', 'Persimmon', 'Plantain', 'Quince',
  // Fresh herbs
  'Parsley', 'Coriander', 'Mint', 'Basil', 'Dill',
  'Oregano', 'Thyme', 'Rosemary',
  // Sea vegetables
  'Nori', 'Wakame', 'Kelp', 'Spirulina',
  // Other veg
  'Cavolo Nero', 'Purple Sprouting Broccoli', 'Green Asparagus',
  'Broad Beans', 'Olives',
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

function dateLocale() { return getLang() === 'de' ? 'de-DE' : 'en-GB'; }

function fmtDate(dateStr) {
  const [y, m, day] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, day).toLocaleDateString(dateLocale(), { day: 'numeric', month: 'short' });
}

function fmtWeekRange(weekStart) {
  return `${fmtDate(weekStart)}–${fmtDate(addDays(weekStart, 6))}`;
}

function fmtMonthKey(mk) {
  const [y, m] = mk.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(dateLocale(), { month: 'short', year: '2-digit' });
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
    return { label: fmtWeekRange(ws), count, metGoal: count >= getGoal() };
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
  const dateMap = new Map();
  for (const e of entries) {
    if (!dateMap.has(e.date)) dateMap.set(e.date, new Set());
    dateMap.get(e.date).add(e.vegetable.toLowerCase());
  }
  const min = getDailyGoal();
  let streak = 0, d = todayStr();
  while ((dateMap.get(d)?.size ?? 0) >= min) { streak++; d = addDays(d, -1); }
  return streak;
}

function weeklyGoalStreak() {
  const { entries } = getData();
  let streak = 0;
  let ws = getWeekStart(todayStr());
  for (let i = 0; i < 104; i++) {
    const we = addDays(ws, 6);
    if (uniqueVeggies(entriesInRange(entries, ws, we)).length >= getGoal()) {
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
        label: t('chart_unique'),
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
          label: t('chart_unique'),
        },
        {
          type: 'line',
          data: data.map(() => getGoal()),
          borderColor: C.amber,
          borderWidth: 2,
          borderDash: [6, 4],
          pointRadius: 0,
          fill: false,
          tension: 0,
          label: t('goal_label', { n: getGoal() }),
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
          max: Math.max(getGoal() + 5, Math.max(...data.map(d => d.count)) + 3),
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
        backgroundColor: data.map(d => d.count >= getGoal() ? C.main : C.light),
        borderColor: data.map(d => d.count >= getGoal() ? C.dark : C.main),
        borderWidth: 1,
        borderRadius: 4,
        label: t('chart_unique'),
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
  document.getElementById('weeklyGoalLabel').textContent = `/${getGoal()}`;

  mkChart('weeklyProgressChart', {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [Math.min(count, getGoal()), Math.max(0, getGoal() - count)],
        backgroundColor: [count >= getGoal() ? C.main : C.light, C.pale],
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
    uniqueNames.map(v => `<span class="chip">${esc(tFood(v))}</span>`).join('') ||
    `<p class="empty">${t('none_this_week')}</p>`;
}

// ── Section renderers ─────────────────────────────────────────────────────────

function renderToday() {
  const today = todayStr();
  document.getElementById('todayHeading').textContent =
    `${t('today')} · ${new Date().toLocaleDateString(dateLocale(), { weekday: 'long', day: 'numeric', month: 'short' })}`;

  const { entries } = getData();
  const todayEntries = entries.filter(e => e.date === today);
  const container = document.getElementById('todayList');

  if (todayEntries.length === 0) {
    container.innerHTML = `<p class="empty">${t('no_logged_today')}</p>`;
  } else {
    container.innerHTML = todayEntries.map(e => `
      <div class="entry-row">
        <span class="entry-veggie">${esc(tFood(e.vegetable))}</span>
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
    container.innerHTML = `<p class="empty" style="font-size:.75rem">${t('all_logged_today')}</p>`;
    return;
  }
  container.innerHTML = recent
    .map(v => `<button class="quick-chip" data-veggie="${esc(v)}">${esc(tFood(v))}</button>`)
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
    ds === 0 ? t('no_streak') : t('x_day_streak', { n: ds });
  document.getElementById('headerWeeklyStreak').textContent =
    ws === 0 ? t('no_week_streak') : t('x_week_streak', { n: ws });
  document.getElementById('dailyStreakDesc').innerHTML =
    `${t('day_streak_desc')}<br><small>${t('day_streak_sub', { n: getDailyGoal() })}</small>`;
  document.getElementById('weeklyStreakDesc').innerHTML =
    `${t('week_streak_desc')}<br><small>${t('week_streak_sub', { goal: getGoal() })}</small>`;

  const streaks = veggieStreaks();
  const container = document.getElementById('veggieStreaks');

  if (streaks.length === 0) {
    container.innerHTML = `<p class="empty">${t('no_streaks_yet')}</p>`;
    return;
  }

  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>${t('col_food')}</th>
          <th>${t('col_streak')}</th>
          <th>${t('col_total')}</th>
          <th>${t('col_last')}</th>
        </tr>
      </thead>
      <tbody>
        ${streaks.map(s => `
          <tr>
            <td>${esc(tFood(s.name))}</td>
            <td>${s.streak > 0 ? `🔥 ${t(s.streak === 1 ? 'streak_day' : 'streak_days', { n: s.streak })}` : '—'}</td>
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
    container.innerHTML = `<p class="empty">${t('no_history')}</p>`;
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
          <span class="history-count"> · ${t(uniq === 1 ? 'x_plants' : 'x_plants_plural', { n: uniq })}</span>
        </div>
        <div class="history-chips">
          ${dayEntries.map(e => `
            <span class="chip">
              ${esc(tFood(e.vegetable))}
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

// ── Nutrition tab rendering ───────────────────────────────────────────────────

const PORTION_KEY = 'veggie-portions-v1';
function getPortions() {
  try { return JSON.parse(localStorage.getItem(PORTION_KEY) || '{}'); } catch { return {}; }
}
function setPortion(food, grams) {
  const p = getPortions();
  p[food.toLowerCase()] = grams;
  localStorage.setItem(PORTION_KEY, JSON.stringify(p));
}

function fmtVal(val) {
  if (val == null) return '—';
  return String(+val.toFixed(1));
}

async function renderNutritionTab(quiet = false) {
  const entries = thisWeekEntries();
  const empty = `<p class="empty">${t('empty_log_nutrition')}</p>`;

  if (entries.length === 0) {
    document.getElementById('nutritionTable').innerHTML = empty;
    document.getElementById('nutritionTotals').innerHTML = empty;
    document.getElementById('nutritionDGE').innerHTML = `<p class="empty">${t('empty_log_sources')}</p>`;
    document.getElementById('nutritionSuggestions').innerHTML = `<p class="empty">${t('empty_log_suggestions')}</p>`;
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

  if (!quiet) {
    document.getElementById('nutritionTable').innerHTML = `<p class="empty">${t('fetching')}</p>`;
    document.getElementById('nutritionTotals').innerHTML = `<p class="empty">${t('fetching')}</p>`;
    document.getElementById('nutritionDGE').innerHTML = `<p class="empty">${t('fetching')}</p>`;
    document.getElementById('nutritionSuggestions').innerHTML = `<p class="empty">${t('fetching')}</p>`;
  }

  const rawResults = await fetchNutritionForAll(uniqueFoods);

  if (!rawResults.some(r => r.nutrition)) {
    const noData = `<p class="empty">${t('no_nutrition_data')}</p>`;
    document.getElementById('nutritionTable').innerHTML = noData;
    document.getElementById('nutritionTotals').innerHTML = noData;
    document.getElementById('nutritionDGE').innerHTML = noData;
    document.getElementById('nutritionSuggestions').innerHTML = noData;
    return;
  }

  // Apply custom portion sizes
  const portions = getPortions();
  const results = rawResults.map(({ vegetable, nutrition: n }) => {
    if (!n) return { vegetable, nutrition: n };
    const customG = portions[vegetable.toLowerCase()];
    const nutrition = (customG && customG !== n.g) ? rescaleNutrition(n, customG) : n;
    return { vegetable, nutrition };
  });

  // ── Per-food table ──
  const headerCells = NUTRIENT_DEFS
    .map(d => `<th>${esc(t('nutrient_' + d.key))}<br><small>${esc(d.unit)}</small></th>`)
    .join('');

  const tableRows = results.map(({ vegetable, nutrition: n }) => {
    const count = foodCounts.get(vegetable.toLowerCase())?.count ?? 1;
    const timesLabel = count > 1 ? `<span class="n-portion">×${count}</span>` : '';
    const portionG = n ? n.g : (rawResults.find(r => r.vegetable === vegetable)?.nutrition?.g ?? 100);
    const defaultG = rawResults.find(r => r.vegetable === vegetable)?.nutrition?.g ?? 100;
    const isCustom = portionG !== defaultG;
    const cells = NUTRIENT_DEFS.map(({ key }) => {
      if (!n || n[key] == null) return '<td class="n-na">—</td>';
      return `<td>${fmtVal(n[key])}</td>`;
    }).join('');
    return `<tr>
      <td class="n-veggie">
        ${esc(tFood(vegetable))}${timesLabel}
        <label class="portion-wrap${isCustom ? ' portion-wrap--custom' : ''}">
          <input type="number" class="portion-input" data-food="${esc(vegetable)}" data-default="${defaultG}" value="${portionG}" min="1" max="9999">
          <span class="portion-unit">g</span>
          ${isCustom ? `<button class="portion-reset" data-food="${esc(vegetable)}" title="Reset to default">↺</button>` : ''}
        </label>
      </td>${cells}</tr>`;
  }).join('');

  const tableEl = document.getElementById('nutritionTable');
  tableEl.innerHTML = `
    <div class="nutrition-scroll">
      <table class="nutrition-table">
        <thead><tr><th>${t('col_food')} <span class="n-portion">${t('col_portion')}</span></th>${headerCells}</tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
    </div>`;

  // Portion input listeners
  tableEl.querySelectorAll('.portion-input').forEach(input => {
    input.addEventListener('change', () => {
      const g = Math.max(1, Math.round(+input.value));
      if (!isNaN(g)) {
        setPortion(input.dataset.food, g);
        renderNutritionTab(true);
      }
    });
  });
  tableEl.querySelectorAll('.portion-reset').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = getPortions();
      delete p[btn.dataset.food.toLowerCase()];
      localStorage.setItem(PORTION_KEY, JSON.stringify(p));
      renderNutritionTab(true);
    });
  });

  // ── Weekly totals (using custom-scaled results) ──
  const totals = {};
  for (const { key } of NUTRIENT_DEFS) totals[key] = null;

  for (const { vegetable, nutrition: n } of results) {
    if (!n) continue;
    const count = foodCounts.get(vegetable.toLowerCase())?.count ?? 1;
    for (const { key } of NUTRIENT_DEFS) {
      if (n[key] != null) totals[key] = (totals[key] ?? 0) + n[key] * count;
    }
  }
  for (const key of Object.keys(totals)) {
    if (totals[key] != null) totals[key] = +(totals[key].toFixed(1));
  }

  const totalCells = NUTRIENT_DEFS.map(({ key }) =>
    totals[key] != null ? `<td><strong>${fmtVal(totals[key])}</strong></td>` : '<td class="n-na">—</td>'
  ).join('');

  document.getElementById('nutritionTotals').innerHTML = `
    <div class="nutrition-scroll">
      <table class="nutrition-table">
        <thead><tr><th>${t('total_this_week')}</th>${headerCells}</tr></thead>
        <tbody><tr><td class="n-veggie">${t('all_logged')}</td>${totalCells}</tr></tbody>
      </table>
    </div>`;

  // ── Top sources per nutrient ──
  const sourceRows = NUTRIENT_DEFS.map(({ key, unit }) => {
    // For each food, compute its total contribution this week (portion × count)
    const ranked = results
      .map(({ vegetable, nutrition: n }) => {
        if (!n || n[key] == null) return null;
        const count = foodCounts.get(vegetable.toLowerCase())?.count ?? 1;
        return { vegetable, amount: +(n[key] * count).toFixed(1) };
      })
      .filter(Boolean)
      .filter(r => r.amount > 0)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    if (!ranked.length) return `
      <div class="src-row">
        <span class="src-label">${esc(t('nutrient_' + key))}</span>
        <span class="n-na">${t('no_data_week')}</span>
      </div>`;

    const chips = ranked.map((r, i) => {
      const cls = i === 0 ? 'src-chip src-chip--top' : 'src-chip';
      return `<span class="${cls}">${esc(tFood(r.vegetable))} <em>${fmtVal(r.amount)} ${esc(unit)}</em></span>`;
    }).join('');

    return `
      <div class="src-row">
        <span class="src-label">${esc(t('nutrient_' + key))}</span>
        <div class="src-chips">${chips}</div>
      </div>`;
  }).join('');

  document.getElementById('nutritionDGE').innerHTML = `<div class="src-list">${sourceRows}</div>`;

  renderNutrientSuggestions(totals, uniqueFoods);

  await renderNutrientTrend();
}

// ── Missing nutrient suggestions ─────────────────────────────────────────────

// Internal weekly reference values (used only for ranking coverage, not displayed).
// Based on rough adult daily requirements × 7.
const NUTRIENT_WEEKLY_REF = {
  fibre:     210,   // 30 g/day
  vita:      5600,  // 800 µg/day
  b1:        8.4,   // 1.2 mg/day
  b2:        9.8,   // 1.4 mg/day
  b3:        112,   // 16 mg/day
  b5:        35,    // 5 mg/day
  b6:        9.8,   // 1.4 mg/day
  b9:        2800,  // 400 µg/day
  vitc:      525,   // 75 mg/day
  vitd:      140,   // 20 µg/day
  vite:      91,    // 13 mg/day
  vitk:      560,   // 80 µg/day
  iron:      63,    // 9 mg/day
  calcium:   7000,  // 1000 mg/day
  magnesium: 2450,  // 350 mg/day
  potassium: 24500, // 3500 mg/day
  zinc:      70,    // 10 mg/day
};

function renderNutrientSuggestions(totals, loggedFoodsThisWeek) {
  const el = document.getElementById('nutritionSuggestions');

  // Identify nutrients where the user is below their weekly reference
  const gapNutrients = NUTRIENT_DEFS
    .filter(({ key }) => NUTRIENT_WEEKLY_REF[key] && totals[key] != null)
    .map(({ key, unit }) => ({
      key, unit,
      coverage: totals[key] / NUTRIENT_WEEKLY_REF[key],
    }))
    .filter(n => n.coverage < 1)
    .sort((a, b) => a.coverage - b.coverage);

  if (!gapNutrients.length) {
    el.innerHTML = `<p class="empty">${t('sugg_all_covered')}</p>`;
    return;
  }

  const loggedSet = new Set(loggedFoodsThisWeek.map(f => f.toLowerCase()));

  // For each unlogged food, find which gap nutrients it meaningfully covers (≥5% of weekly ref)
  const MIN_COVERAGE = 0.05;
  const foodScores = Object.entries(NUTRITION_DATA)
    .filter(([name]) => !loggedSet.has(name))
    .map(([name, d]) => {
      const covered = gapNutrients
        .map(({ key, unit }) => {
          const amount = d[key] != null ? +(d[key] * d.g / 100).toFixed(1) : 0;
          const pct = amount / NUTRIENT_WEEKLY_REF[key];
          return pct >= MIN_COVERAGE ? { key, unit, amount, pct } : null;
        })
        .filter(Boolean);
      const totalScore = covered.reduce((s, n) => s + n.pct, 0);
      return { name, covered, totalScore };
    })
    .filter(f => f.covered.length > 0)
    .sort((a, b) => b.covered.length - a.covered.length || b.totalScore - a.totalScore)
    .slice(0, 8);

  if (!foodScores.length) {
    el.innerHTML = `<p class="empty">${t('no_suggestions')}</p>`;
    return;
  }

  const rows = foodScores.map(({ name, covered }, i) => {
    const foodName = name.replace(/\b\w/g, c => c.toUpperCase());
    const countKey = covered.length === 1 ? 'covers_1_gap' : 'covers_n_gaps';
    const chips = covered.map(({ key, unit, amount }) =>
      `<span class="sugg-nut-chip">${esc(t('nutrient_' + key))} <em>${amount} ${esc(unit)}</em></span>`
    ).join('');
    return `
      <div class="sugg-food-row${i === 0 ? ' sugg-food-row--top' : ''}">
        <div class="sugg-food-header">
          <span class="sugg-food-name">${esc(tFood(foodName))}</span>
          <span class="sugg-food-badge">${t(countKey, { n: covered.length })}</span>
        </div>
        <div class="sugg-nut-chips">${chips}</div>
      </div>`;
  }).join('');

  el.innerHTML = `<div class="sugg-food-list">${rows}</div>`;
}

// ── Nutrient trend chart ──────────────────────────────────────────────────────

async function renderNutrientTrend() {
  const { entries } = getData();
  const today = todayStr();
  const ws0 = getWeekStart(today);
  const WEEKS = 12;

  // Build week windows oldest → newest
  const weeks = Array.from({ length: WEEKS }, (_, i) => {
    const ws = addDays(ws0, -(WEEKS - 1 - i) * 7);
    return { ws, we: addDays(ws, 6), label: fmtWeekRange(ws) };
  });

  // Group entries per week
  const weekEntries = weeks.map(({ ws, we }) => entriesInRange(entries, ws, we));

  // Collect all unique foods across all weeks
  const allFoods = [...new Set(weekEntries.flat().map(e => e.vegetable))];

  const wrap = document.getElementById('trendChartWrap');

  if (allFoods.length === 0) {
    wrap.innerHTML = `<p class="empty">${t('empty_log_trend')}</p>`;
    return;
  }

  // Fetch nutrition for every food once (static + cache, no redundant API calls)
  const nutritionResults = await fetchNutritionForAll(allFoods);
  const portions = getPortions();

  const foodNutrition = new Map();
  for (const { vegetable, nutrition: n } of nutritionResults) {
    if (!n) continue;
    const customG = portions[vegetable.toLowerCase()];
    foodNutrition.set(
      vegetable.toLowerCase(),
      (customG && customG !== n.g) ? rescaleNutrition(n, customG) : n
    );
  }

  const select = document.getElementById('trendNutrient');
  const key = select.value || 'vitc';
  const def = NUTRIENT_DEFS.find(d => d.key === key);

  // Compute weekly totals for selected nutrient
  const totals = weeks.map((_, i) => {
    const we = weekEntries[i];
    if (!we.length) return null;
    const counts = new Map();
    for (const e of we) counts.set(e.vegetable.toLowerCase(), (counts.get(e.vegetable.toLowerCase()) ?? 0) + 1);
    let sum = null;
    for (const [food, count] of counts) {
      const n = foodNutrition.get(food);
      if (n?.[key] != null) sum = (sum ?? 0) + n[key] * count;
    }
    return sum != null ? +(sum.toFixed(1)) : null;
  });

  // Restore canvas if we replaced it with a message previously
  if (!wrap.querySelector('canvas')) {
    wrap.innerHTML = '<canvas id="trendChart"></canvas>';
  }

  mkChart('trendChart', {
    type: 'line',
    data: {
      labels: weeks.map(w => w.label),
      datasets: [{
        data: totals,
        borderColor: C.main,
        backgroundColor: 'rgba(64,145,108,0.10)',
        borderWidth: 2.5,
        pointRadius: 4,
        pointBackgroundColor: C.main,
        pointBorderColor: '#fff',
        pointBorderWidth: 1.5,
        fill: true,
        tension: 0.35,
        spanGaps: true,
        label: `${t('nutrient_' + def.key)} (${def.unit})`,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ctx.raw != null ? `${ctx.raw} ${def.unit}` : t('tooltip_no_data'),
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: '#f0f5f2' },
          ticks: { callback: v => `${v} ${def.unit}` },
        },
        x: { grid: { display: false }, ticks: { font: { size: 9 }, maxRotation: 45 } },
      },
    },
  });
}

// ── Heatmap ───────────────────────────────────────────────────────────────────

function renderHeatmap() {
  const { entries } = getData();

  // Build date → unique food count
  const dateCounts = new Map();
  for (const e of entries) {
    if (!dateCounts.has(e.date)) dateCounts.set(e.date, new Set());
    dateCounts.get(e.date).add(e.vegetable.toLowerCase());
  }

  const today = todayStr();
  const todayWs = getWeekStart(today);
  const WEEKS = 53;
  const startWs = addDays(todayWs, -(WEEKS - 1) * 7);

  function heatClass(count, isFuture) {
    if (isFuture) return 'heat-0 heat-future';
    if (count === 0) return 'heat-0';
    if (count <= 2)  return 'heat-1';
    if (count <= 5)  return 'heat-2';
    if (count <= 9)  return 'heat-3';
    return 'heat-4';
  }

  // Build week array
  const weeks = [];
  let ws = startWs;
  for (let w = 0; w < WEEKS; w++) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      const date = addDays(ws, d);
      const count = dateCounts.has(date) ? dateCounts.get(date).size : 0;
      days.push({ date, count, isFuture: date > today });
    }
    weeks.push({ days });
    ws = addDays(ws, 7);
  }

  // Month label for first week each month appears
  const monthsSeen = new Set();
  const weekMonths = weeks.map(week => {
    for (const day of week.days) {
      const mk = day.date.slice(0, 7);
      if (!monthsSeen.has(mk)) {
        monthsSeen.add(mk);
        const [y, m] = mk.split('-').map(Number);
        return new Date(y, m - 1, 1).toLocaleDateString(dateLocale(), { month: 'short' });
      }
    }
    return '';
  });

  const monthsHtml = weekMonths.map(label =>
    `<div class="heat-mcell">${label ? esc(label) : ''}</div>`
  ).join('');

  const weeksHtml = weeks.map(week => {
    const cells = week.days.map(day => {
      const cls = heatClass(day.count, day.isFuture);
      const tip = day.isFuture ? '' : t(day.count === 1 ? 'heatmap_tip' : 'heatmap_tip_plural', { date: day.date, n: day.count });
      return `<div class="heat-cell ${cls}" title="${esc(tip)}"></div>`;
    }).join('');
    return `<div class="heat-week">${cells}</div>`;
  }).join('');

  document.getElementById('heatmap').innerHTML = `
    <div class="heat-wrap">
      <div class="heat-left">
        <div class="heat-spacer"></div>
        <div class="heat-days">
          <span>${t('heatmap_mon')}</span><span></span><span>${t('heatmap_wed')}</span><span></span><span>${t('heatmap_fri')}</span><span></span><span></span>
        </div>
      </div>
      <div class="heat-right">
        <div class="heat-months">${monthsHtml}</div>
        <div class="heat-weeks">${weeksHtml}</div>
      </div>
    </div>
    <div class="heat-legend">
      <span class="heat-legend-text">${t('heatmap_less')}</span>
      <div class="heat-cell heat-0"></div>
      <div class="heat-cell heat-1"></div>
      <div class="heat-cell heat-2"></div>
      <div class="heat-cell heat-3"></div>
      <div class="heat-cell heat-4"></div>
      <span class="heat-legend-text">${t('heatmap_more')}</span>
    </div>
  `;

  // Scroll to show the most recent (rightmost) data immediately
  const wrap = document.querySelector('.heat-wrap');
  if (wrap) wrap.scrollLeft = wrap.scrollWidth;
}

// ── Plant Gallery ────────────────────────────────────────────────────────────

function simpleHash(str) {
  let h = 0;
  for (const c of str) h = Math.imul(31, h) + c.charCodeAt(0) | 0;
  return Math.abs(h);
}

// Maps English canonical food name → emoji character (null = use colored-circle fallback)
const FOOD_EMOJI = {
  // Vegetables
  'Aubergine': '🍆', 'Avocado': '🥑', 'Bamboo Shoots': '🎋',
  'Bean Sprouts': '🌱', 'Bell Pepper': '🫑', 'Bok Choy': '🥬',
  'Broccoli': '🥦', 'Brussels Sprouts': '🥦', 'Butternut Squash': '🎃',
  'Cabbage': '🥬', 'Carrot': '🥕', 'Cauliflower': '🥦',
  'Celery': '🌿', 'Chard': '🥬', 'Chicory': '🥬',
  'Chilli': '🌶️', 'Chives': '🌿', 'Courgette': '🥒',
  'Cucumber': '🥒', 'Edamame': '🫘', 'Endive': '🥬',
  'Fennel': '🌿', 'Garlic': '🧄', 'Green Beans': '🫘',
  'Jalapeño': '🌶️', 'Kale': '🥬', 'Leek': '🧅',
  'Lettuce': '🥬', 'Mangetout': '🫛', 'Mushroom': '🍄',
  'Onion': '🧅', 'Oyster Mushroom': '🍄', 'Pak Choi': '🥬',
  'Parsnip': '🥕', 'Peas': '🫛', 'Portobello': '🍄',
  'Potato': '🥔', 'Pumpkin': '🎃', 'Radicchio': '🥬',
  'Radish': '🌱', 'Red Cabbage': '🥬', 'Red Onion': '🧅',
  'Romanesco': '🥦', 'Savoy Cabbage': '🥬', 'Shallot': '🧅',
  'Shiitake': '🍄', 'Spinach': '🥬', 'Spring Onion': '🧅',
  'Squash': '🎃', 'Swede': '🥕', 'Sweet Corn': '🌽',
  'Sweet Potato': '🍠', 'Swiss Chard': '🥬', 'Taro': '🥔',
  'Tenderstem Broccoli': '🥦', 'Tomato': '🍅', 'Turnip': '🥕',
  'Watercress': '🌿', 'White Cabbage': '🥬', 'Yam': '🍠',
  'Zucchini': '🥒', 'Cavolo Nero': '🥬', 'Purple Sprouting Broccoli': '🥦',
  'Green Asparagus': '🌿', 'Olives': '🫒',
  // Fruits
  'Apple': '🍎', 'Apricot': '🍑', 'Banana': '🍌',
  'Blackberry': '🫐', 'Blackcurrant': '🫐', 'Blueberry': '🫐',
  'Cherry': '🍒', 'Clementine': '🍊', 'Cranberry': '🍒',
  'Elderberry': '🫐', 'Gooseberry': '🫐', 'Grape': '🍇',
  'Grapefruit': '🍊', 'Guava': '🍈', 'Jackfruit': '🍈',
  'Kiwi': '🥝', 'Lemon': '🍋', 'Lime': '🍋',
  'Mango': '🥭', 'Melon': '🍈', 'Nectarine': '🍑',
  'Orange': '🍊', 'Papaya': '🥭', 'Peach': '🍑',
  'Pear': '🍐', 'Pineapple': '🍍', 'Plum': '🍑',
  'Raspberry': '🫐', 'Redcurrant': '🍒', 'Satsuma': '🍊',
  'Strawberry': '🍓', 'Tangerine': '🍊', 'Watermelon': '🍉',
  'Coconut': '🥥', 'Mulberry': '🫐', 'Persimmon': '🍊',
  'Plantain': '🍌', 'Quince': '🍐',
  'Raisins': '🍇', 'Sultanas': '🍇', 'Dried Apricots': '🍑',
  'Prunes': '🍑', 'Dried Cranberries': '🍒', 'Dried Figs': '🍑',
  'Dried Mango': '🥭', 'Goji Berries': '🫐',
  // Seeds & nuts
  'Chia Seeds': '🌱', 'Flaxseeds': '🌾', 'Linseeds': '🌾',
  'Hemp Seeds': '🌿', 'Pumpkin Seeds': '🎃', 'Sesame Seeds': '🌾',
  'Sunflower Seeds': '🌻', 'Poppy Seeds': '🌺',
  'Almonds': '🥜', 'Brazil Nuts': '🌰', 'Cashews': '🥜',
  'Hazelnuts': '🌰', 'Macadamia Nuts': '🥜', 'Peanuts': '🥜',
  'Pecans': '🌰', 'Pine Nuts': '🌲', 'Pistachios': '🥜',
  'Walnuts': '🌰',
  // Legumes
  'Chickpeas': '🫘', 'Lentils': '🫘', 'Red Lentils': '🫘',
  'Green Lentils': '🫘', 'Black Beans': '🫘', 'Kidney Beans': '🫘',
  'Butter Beans': '🫘', 'Cannellini Beans': '🫘', 'Pinto Beans': '🫘',
  'Mung Beans': '🫘', 'Broad Beans': '🫘', 'Soybeans': '🫘',
  // Herbs
  'Parsley': '🌿', 'Coriander': '🌿', 'Mint': '🌿',
  'Basil': '🌿', 'Dill': '🌿', 'Oregano': '🌿',
  'Thyme': '🌿', 'Rosemary': '🌿',
  // Sea veg
  'Nori': '🌊', 'Wakame': '🌊', 'Kelp': '🌊', 'Spirulina': '🌊',
};

// Deterministic color from food name, used for fallback circles
function foodColor(name) {
  const palette = [
    '#ef5350','#ec407a','#ab47bc','#7e57c2',
    '#42a5f5','#26c6da','#66bb6a','#d4e157',
    '#ffa726','#ff7043',
  ];
  return palette[simpleHash(name) % palette.length];
}

function drawDayCard(date, foods) {
  const W = 1080, H = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // ── Background ──────────────────────────────────────────────────────────────
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0,   '#0b1f13');
  bg.addColorStop(0.5, '#16352200');
  bg.addColorStop(1,   '#0b1f13');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Solid mid-layer so the transparent stop works
  const bg2 = ctx.createLinearGradient(0, H * 0.2, W * 0.8, H * 0.8);
  bg2.addColorStop(0, '#163522');
  bg2.addColorStop(1, '#0f2a1a');
  ctx.fillStyle = bg2;
  ctx.fillRect(0, 0, W, H);

  // Subtle dot grid texture
  ctx.fillStyle = 'rgba(255,255,255,0.028)';
  for (let x = 36; x < W; x += 60)
    for (let y = 36; y < H; y += 60) {
      ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
    }

  // ── Header ──────────────────────────────────────────────────────────────────
  const PAD = 72;
  const d = new Date(date + 'T12:00:00');
  const dayName  = d.toLocaleDateString(dateLocale(), { weekday: 'long' }).toUpperCase();
  const dayNum   = String(d.getDate()).padStart(2, '0');
  const monthYr  = d.toLocaleDateString(dateLocale(), { month: 'long', year: 'numeric' }).toUpperCase();

  ctx.textAlign = 'left';

  ctx.fillStyle = 'rgba(160,220,180,0.55)';
  ctx.font = `400 46px system-ui, sans-serif`;
  ctx.fillText(dayName, PAD, 104);

  ctx.fillStyle = '#ffffff';
  ctx.font = `800 210px system-ui, sans-serif`;
  ctx.fillText(dayNum, PAD - 6, 300);

  ctx.fillStyle = 'rgba(160,220,180,0.55)';
  ctx.font = `400 46px system-ui, sans-serif`;
  ctx.fillText(monthYr, PAD, 352);

  // Divider
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(PAD, 388); ctx.lineTo(W - PAD, 388); ctx.stroke();

  // ── Food grid ───────────────────────────────────────────────────────────────
  const MAX_SHOW = 16;
  const display  = foods.slice(0, MAX_SHOW);
  const n        = display.length;
  const COLS     = n <= 2 ? n : n <= 4 ? 2 : n <= 9 ? 3 : 4;
  const ROWS     = Math.ceil(n / COLS);
  const GAP      = 16;
  const GRID_Y   = 412;
  const FOOTER_H = 220;
  const maxCell  = Math.floor((W - PAD * 2 - GAP * (COLS - 1)) / COLS);
  const maxByH   = Math.floor((H - GRID_Y - FOOTER_H - GAP * (ROWS - 1)) / ROWS);
  const CELL     = Math.min(maxCell, maxByH);

  display.forEach((food, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const x   = PAD + col * (CELL + GAP);
    const y   = GRID_Y + row * (CELL + GAP);
    const cx  = x + CELL / 2;
    const cy  = y + CELL / 2;

    // Cell background
    ctx.fillStyle = 'rgba(255,255,255,0.11)';
    ctx.beginPath(); ctx.roundRect(x, y, CELL, CELL, 18); ctx.fill();

    // Solid light circle so emoji render with full color against a bright surface
    const emojiSize = Math.floor(CELL * 0.44);
    const labelY    = y + CELL * 0.74;
    const eBgR      = emojiSize * 0.62;
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.beginPath(); ctx.arc(cx, cy - CELL * 0.06, eBgR, 0, Math.PI * 2); ctx.fill();

    const emoji = FOOD_EMOJI[food] ?? null;

    if (emoji) {
      ctx.font = `${emojiSize}px 'Apple Color Emoji','Noto Color Emoji','Segoe UI Emoji',sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(emoji, cx, cy - CELL * 0.06);
    } else {
      // Colored circle with initial letter
      ctx.fillStyle = foodColor(food);
      ctx.beginPath();
      ctx.arc(cx, cy - CELL * 0.06, emojiSize * 0.46, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = `700 ${Math.floor(emojiSize * 0.46)}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(food[0].toUpperCase(), cx, cy - CELL * 0.06);
    }

    // Food label
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = `400 ${Math.max(18, Math.floor(CELL * 0.105))}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const label = tFood(food);
    ctx.fillText(label.length > 11 ? label.slice(0, 10) + '…' : label, cx, labelY);
  });

  // +N more indicator if foods were clipped
  if (foods.length > MAX_SHOW) {
    const extra = foods.length - MAX_SHOW;
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = `400 36px system-ui, sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(`+${extra} more`, W - PAD, GRID_Y + ROWS * (CELL + GAP));
  }

  // ── Footer ───────────────────────────────────────────────────────────────────
  const footerY = H - FOOTER_H + 20;

  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(PAD, footerY); ctx.lineTo(W - PAD, footerY); ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = `700 62px system-ui, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(t(n === 1 ? 'x_plants' : 'x_plants_plural', { n }), PAD, footerY + 36);

  ctx.fillStyle = 'rgba(160,220,180,0.5)';
  ctx.font = `400 38px system-ui, sans-serif`;
  ctx.fillText('🌿 Veggie Tracker', PAD, footerY + 118);

  return canvas;
}

function renderDailyCards() {
  const { entries } = getData();
  const container = document.getElementById('dailyCards');

  const byDate = new Map();
  for (const e of entries) {
    if (!byDate.has(e.date)) byDate.set(e.date, new Set());
    byDate.get(e.date).add(e.vegetable);
  }

  const dates = [...byDate.keys()].sort().reverse().slice(0, 5);

  if (dates.length === 0) {
    container.innerHTML = `<p class="empty">${t('no_history')}</p>`;
    return;
  }

  // Reuse DOM nodes whose food list hasn't changed (avoids redrawing)
  const existing = new Map();
  container.querySelectorAll('.day-card[data-date]').forEach(el =>
    existing.set(el.dataset.date, el)
  );

  container.innerHTML = '';

  for (const date of dates) {
    const foods = [...byDate.get(date)];
    const seed  = simpleHash(date + ':' + [...foods].sort().join(','));

    const prev = existing.get(date);
    if (prev && prev.dataset.seed === String(seed)) {
      container.appendChild(prev);
      continue;
    }

    const canvas = drawDayCard(date, foods);
    canvas.style.cssText = 'width:100%;height:100%;display:block;';

    const dlBtn = document.createElement('button');
    dlBtn.className = 'day-card-dl';
    dlBtn.title = t('btn_download_card');
    dlBtn.textContent = '↓';
    dlBtn.addEventListener('click', e => {
      e.stopPropagation();
      const a = document.createElement('a');
      a.download = `veggie-${date}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    });

    const wrapper = document.createElement('div');
    wrapper.className = 'day-card';
    wrapper.dataset.date = date;
    wrapper.dataset.seed = String(seed);
    wrapper.append(canvas, dlBtn);
    container.appendChild(wrapper);
  }
}

function renderAll() {
  renderWeeklyProgress();
  renderToday();
  renderQuickAdd();
  renderDailyChart();
  renderWeeklyChart();
  renderMonthlyChart();
  renderHeatmap();
  renderStreaks();
  renderHistory();
  // Tab-specific renders: only run when that tab is visible
  if (!document.getElementById('tab-nutrition').hidden) renderNutritionTab();
  if (!document.getElementById('tab-gallery').hidden)   renderDailyCards();
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
      alert(t('err_import_failed'));
    }
  };
  reader.readAsText(file);
}

// ── Init ──────────────────────────────────────────────────────────────────────

function init() {
  applyStaticTranslations();

  // Populate datalist for autocomplete (rebuilt on language change)
  const datalist = document.getElementById('veggie-list');
  function populateDatalist() {
    datalist.innerHTML = '';
    FOODS.forEach(v => {
      const opt = document.createElement('option');
      opt.value = tFood(v);
      datalist.appendChild(opt);
    });
  }
  populateDatalist();

  document.getElementById('dateInput').value = todayStr();

  document.getElementById('addBtn').addEventListener('click', () => {
    const date = document.getElementById('dateInput').value;
    const veggie = document.getElementById('veggieInput').value.trim();
    const msg = document.getElementById('addMsg');

    if (!date)   { msg.textContent = t('err_no_date'); return; }
    if (!veggie) { msg.textContent = t('err_no_food'); return; }

    const result = addEntry(date, canonicalFood(veggie));
    if (result === 'duplicate') {
      msg.textContent = t('err_duplicate', { food: tFood(toTitleCase(canonicalFood(veggie))), date: fmtDate(date) });
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

  // Nutrient trend select
  const trendSelect = document.getElementById('trendNutrient');
  function populateTrendSelect() {
    const current = trendSelect.value || 'vitc';
    trendSelect.innerHTML = '';
    NUTRIENT_DEFS.forEach(({ key, unit }) => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = `${t('nutrient_' + key)} (${unit})`;
      if (key === current) opt.selected = true;
      trendSelect.appendChild(opt);
    });
  }
  populateTrendSelect();
  trendSelect.addEventListener('change', renderNutrientTrend);

  // Language select
  const langSelect = document.getElementById('langSelect');
  langSelect.value = getLang();
  langSelect.addEventListener('change', () => {
    setLang(langSelect.value);
    applyStaticTranslations();
    populateDatalist();
    populateTrendSelect();
    renderAll();
    if (!document.getElementById('tab-nutrition').hidden) renderNutritionTab();
  });

  // Settings: weekly goal
  const goalInput = document.getElementById('goalInput');
  goalInput.value = getGoal();
  goalInput.addEventListener('change', () => {
    const val = Math.min(200, Math.max(1, Math.round(+goalInput.value)));
    if (!isNaN(val)) {
      goalInput.value = val;
      const s = getSettings();
      s.weeklyGoal = val;
      saveSettings(s);
      renderAll();
    }
  });
  document.getElementById('goalReset').addEventListener('click', () => {
    const s = getSettings();
    delete s.weeklyGoal;
    saveSettings(s);
    goalInput.value = DEFAULT_GOAL;
    renderAll();
  });

  // Settings: daily streak goal
  const dailyGoalInput = document.getElementById('dailyGoalInput');
  dailyGoalInput.value = getDailyGoal();
  dailyGoalInput.addEventListener('change', () => {
    const val = Math.min(50, Math.max(1, Math.round(+dailyGoalInput.value)));
    if (!isNaN(val)) {
      dailyGoalInput.value = val;
      const s = getSettings();
      s.dailyGoal = val;
      saveSettings(s);
      renderAll();
    }
  });
  document.getElementById('dailyGoalReset').addEventListener('click', () => {
    const s = getSettings();
    delete s.dailyGoal;
    saveSettings(s);
    dailyGoalInput.value = DEFAULT_DAILY_GOAL;
    renderAll();
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
      if (btn.dataset.tab === 'gallery')   renderDailyCards();
      if (btn.dataset.tab === 'settings') { goalInput.value = getGoal(); dailyGoalInput.value = getDailyGoal(); }
    });
  });

  renderAll();
}

document.addEventListener('DOMContentLoaded', init);
