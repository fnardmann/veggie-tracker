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
function getAdvancedPortions() { return getSettings().advancedPortions ?? false; }
function getFunFacts()      { return getSettings().funFacts      ?? true; }
function getFoodFacts()    { return getSettings().foodFacts    ?? true; }
function getNutrientFacts(){ return getSettings().nutrientFacts ?? true; }
function getAnimalSuggestions() { return getSettings().animalSuggestions ?? true; }
function getSeasonalCountry()  { return getSettings().seasonalCountry  ?? 'de'; }

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
  // Grains
  'Oats', 'Quinoa', 'Brown Rice', 'Barley', 'Rye', 'Buckwheat',
  'Millet', 'Spelt', 'Amaranth', 'Teff', 'Sorghum', 'Farro',
  'Wild Rice', 'Bulgur', 'Freekeh', 'Kamut', 'Einkorn',
  // Spices (each counts as a separate plant)
  'Turmeric', 'Cumin', 'Cardamom', 'Cinnamon', 'Cloves', 'Black Pepper',
  'Paprika Powder', 'Fenugreek', 'Mustard Seeds', 'Caraway Seeds',
  'Fennel Seeds', 'Star Anise', 'Nutmeg', 'Allspice', 'Chili Powder',
  'Coriander Seeds', 'Cayenne Pepper',
  // Hot drinks
  'Coffee', 'Green Tea', 'Black Tea', 'White Tea', 'Matcha',
  'Chamomile', 'Rooibos', 'Peppermint Tea', 'Ginger Tea',
  // Fermented plant foods
  'Kimchi', 'Sauerkraut', 'Miso', 'Kombucha',
  // Cacao
  'Dark Chocolate', 'Cacao Nibs',
  // Other
  'Psyllium Husk',
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
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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
  const today = todayStr();
  // If today's goal isn't met yet, preserve yesterday's streak (Duolingo-style grace)
  const start = (dateMap.get(today)?.size ?? 0) >= min ? today : addDays(today, -1);
  let streak = 0, d = start;
  while ((dateMap.get(d)?.size ?? 0) >= min) { streak++; d = addDays(d, -1); }
  return streak;
}

function weeklyGoalStreak() {
  const { entries } = getData();
  let ws = getWeekStart(todayStr());
  // If this week's goal isn't met yet, preserve last week's streak
  if (uniqueVeggies(entriesInRange(entries, ws, addDays(ws, 6))).length < getGoal()) {
    ws = addDays(ws, -7);
  }
  let streak = 0;
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
  ).values()].sort((a, b) => tFood(a).localeCompare(tFood(b), getLang()));

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

function computeVeggieDetail(foodName) {
  const { entries } = getData();
  const key = foodName.toLowerCase();
  const dates = [...new Set(
    entries.filter(e => e.vegetable.toLowerCase() === key).map(e => e.date)
  )].sort();
  if (!dates.length) return null;

  let maxStreak = 1, cur = 1;
  for (let i = 1; i < dates.length; i++) {
    if (addDays(dates[i - 1], 1) === dates[i]) { cur++; if (cur > maxStreak) maxStreak = cur; }
    else cur = 1;
  }

  const daySpan = Math.max(7, (new Date(dates[dates.length - 1]) - new Date(dates[0])) / 86400000 + 1);
  const avgPerWeek = (dates.length / (daySpan / 7)).toFixed(1);

  return { first: dates[0], last: dates[dates.length - 1], total: dates.length, maxStreak, avgPerWeek };
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

  const allStreaks = veggieStreaks();
  const streaks = allStreaks.filter(s => s.streak >= 3).slice(0, 6);
  const container = document.getElementById('veggieStreaks');

  if (streaks.length === 0) {
    container.innerHTML = `<p class="empty">${t('no_streaks_yet')}</p>`;
    return;
  }

  const tier = n => n >= 7 ? 'hot' : n >= 3 ? 'warm' : '';

  container.innerHTML = streaks.map(s => {
    const t_ = tier(s.streak);
    const streakLabel = `🔥 ${t(s.streak === 1 ? 'streak_day' : 'streak_days', { n: s.streak })}`;
    return `
      <div class="vs-row${t_ ? ' vs-row--' + t_ : ''}" data-food="${esc(s.name)}">
        <div class="vs-row-main">
          <span class="vs-name">${esc(tFood(s.name))}</span>
          <span class="vs-meta">
            <span class="vs-total">${s.total} ${t('col_total').toLowerCase()}</span>
            <span class="vs-streak">${streakLabel}</span>
          </span>
          <span class="vs-chevron">›</span>
        </div>
        <div class="vs-detail" hidden></div>
      </div>`;
  }).join('');

  container.querySelectorAll('.vs-row').forEach(row => {
    row.addEventListener('click', () => {
      const detail = row.querySelector('.vs-detail');
      if (!detail.hidden) {
        detail.hidden = true;
        row.classList.remove('vs-row--open');
        return;
      }
      const d = computeVeggieDetail(row.dataset.food);
      if (!d) return;
      detail.innerHTML = `
        <div class="vs-stat">
          <div class="vs-stat-val">${fmtDate(d.first)}</div>
          <div class="vs-stat-lbl">${t('streak_first')}</div>
        </div>
        <div class="vs-stat">
          <div class="vs-stat-val">${fmtDate(d.last)}</div>
          <div class="vs-stat-lbl">${t('col_last')}</div>
        </div>
        <div class="vs-stat">
          <div class="vs-stat-val">${t(d.maxStreak === 1 ? 'streak_day' : 'streak_days', { n: d.maxStreak })}</div>
          <div class="vs-stat-lbl">${t('streak_best')}</div>
        </div>
        <div class="vs-stat">
          <div class="vs-stat-val">${d.avgPerWeek}×</div>
          <div class="vs-stat-lbl">${t('streak_avg_week')}</div>
        </div>
        <div class="vs-stat">
          <div class="vs-stat-val">${d.total}</div>
          <div class="vs-stat-lbl">${t('streak_total')}</div>
        </div>`;
      detail.hidden = false;
      row.classList.add('vs-row--open');
    });
  });
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

// ── Nutrient facts ────────────────────────────────────────────────────────────

const NUTRIENT_DAILY_REF = {
  fibre: { val: 30, unit: 'g' }, vita: { val: 800, unit: 'µg' },
  b1: { val: 1.2, unit: 'mg' }, b2: { val: 1.4, unit: 'mg' },
  b3: { val: 16, unit: 'mg' }, b5: { val: 5, unit: 'mg' },
  b6: { val: 1.4, unit: 'mg' }, b9: { val: 400, unit: 'µg' },
  vitc: { val: 75, unit: 'mg' }, vitd: { val: 20, unit: 'µg' },
  vite: { val: 13, unit: 'mg' }, vitk: { val: 80, unit: 'µg' },
  iron: { val: 9, unit: 'mg' }, calcium: { val: 1000, unit: 'mg' },
  magnesium: { val: 350, unit: 'mg' }, potassium: { val: 3500, unit: 'mg' },
  zinc:     { val: 10,  unit: 'mg' },
  selenium: { val: 55,  unit: 'µg' },
  b12:      { val: 2.5, unit: 'µg' },
};

function renderNutrientFacts() {
  const el = document.getElementById('nutritionFacts');
  if (!el) return;
  if (!getNutrientFacts()) { el.hidden = true; return; }
  el.hidden = false;

  const keys = NUTRIENT_DEFS.map(d => d.key);
  const key  = keys[Math.floor(Math.random() * keys.length)];
  const ref  = NUTRIENT_DAILY_REF[key];

  el.innerHTML = `
    <p class="spotlight-label">${t('nutrient_fact_heading')}</p>
    <p class="nutrient-fact-name">${esc(t('nutrient_' + key))}</p>
    <p class="nutrient-fact-text">${esc(t('fact_' + key))}</p>
    <p class="nutrient-fact-goal">${t('nutrient_fact_goal', { val: ref.val, unit: esc(ref.unit) })}</p>`;
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

  const uniqueFoods = [...foodCounts.values()].map(f => f.name)
    .sort((a, b) => tFood(a).localeCompare(tFood(b), getLang()));

  if (!quiet) {
    _suggExpanded = false;
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

  const advancedPortions = getAdvancedPortions();

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
    const portionHtml = advancedPortions
      ? `<label class="portion-wrap${isCustom ? ' portion-wrap--custom' : ''}">
          <input type="number" class="portion-input" data-food="${esc(vegetable)}" data-default="${defaultG}" value="${portionG}" min="1" max="9999">
          <span class="portion-unit">g</span>
          ${isCustom ? `<button class="portion-reset" data-food="${esc(vegetable)}" title="Reset to default">↺</button>` : ''}
        </label>`
      : `<span class="portion-static${isCustom ? ' portion-static--custom' : ''}">${portionG}g</span>`;
    return `<tr>
      <td class="n-veggie">
        ${esc(tFood(vegetable))}${timesLabel}
        ${portionHtml}
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

  if (advancedPortions) {
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
  }

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

  const dow = new Date().getDay(); // 0=Sun
  const dayOfWeek = dow === 0 ? 7 : dow; // Mon=1 … Sun=7
  const pacePct = (dayOfWeek / 7) * 100;

  const progressRows = NUTRIENT_DEFS
    .filter(({ key }) => NUTRIENT_WEEKLY_REF[key])
    .map(({ key, unit }) => {
      const val = totals[key];
      const ref = NUTRIENT_WEEKLY_REF[key];
      if (val == null) return '';
      const pct = Math.min(1, val / ref);
      const pctDisplay = Math.round(pct * 100);
      const pace = pacePct / 100;
      const ratio = pace > 0 ? Math.min(pct / pace, 1.4) : 1;
      const h = ratio >= 1
        ? 130 + (ratio - 1) * 15
        : 5 + ratio * 125;
      const s = ratio >= 1 ? 52 + (ratio - 1) * 10 : 78;
      const l = ratio >= 1 ? 44 - (ratio - 1) * 8 : 52 - Math.abs(ratio - 0.55) * 6;
      const barColor = `hsl(${h.toFixed(0)},${s.toFixed(0)}%,${l.toFixed(0)}%)`;
      const hint = key === 'vitD' ? `<p class="nutr-progress-hint">Raus an die Sonne! ☀️ Pflanzen haben kaum was</p>` : '';
      return `
        <div class="nutr-progress-row nutr-progress-row--clickable" data-nutrient-key="${key}">
          <div class="nutr-progress-header">
            <span class="nutr-progress-label">${esc(t('nutrient_' + key))}</span>
            <span class="nutr-progress-value">${fmtVal(val)} / ${fmtVal(ref)} ${esc(unit)} · <strong>${pctDisplay}%</strong></span>
          </div>
          <div class="nutr-bar-track">
            <div class="nutr-bar-fill" style="width:${pct * 100}%;background:${barColor}"></div>
            <div class="nutr-bar-pace" style="left:${pacePct}%"></div>
          </div>
          ${hint}
        </div>`;
    }).join('');

  const nutritionTotalsEl = document.getElementById('nutritionTotals');
  nutritionTotalsEl.innerHTML = `<div class="nutr-progress-list">${progressRows}</div>`;
  nutritionTotalsEl.onclick = e => {
    const row = e.target.closest('[data-nutrient-key]');
    if (!row) return;
    const key = row.dataset.nutrientKey;
    if (_suggExpanded === false) {
      _suggExpanded = true;
      renderNutritionTab(true);
    }
    const section = document.getElementById('sugg-section-' + key);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      section.classList.add('sugg-section--highlight');
      setTimeout(() => section.classList.remove('sugg-section--highlight'), 1800);
    } else {
      const suggEl = document.getElementById('nutritionSuggestions');
      if (suggEl) suggEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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

    if (!ranked.length) {
      const noDataMsg = key === 'vitd' ? t('no_data_vitd')
                      : key === 'b12'  ? t('no_data_b12')
                      : t('no_data_week');
      return `
        <div class="src-row">
          <span class="src-label">${esc(t('nutrient_' + key))}</span>
          <span class="n-na">${noDataMsg}</span>
        </div>`;
    }

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
  selenium:  385,   // 55 µg/day
  // b12 intentionally omitted: plants contain none, so it would only clog suggestions
};

// b12 included here because animal foods are its primary source
const ANIMAL_WEEKLY_REF = { ...NUTRIENT_WEEKLY_REF, b12: 98 }; // 14 µg/day × 7

const ANIMAL_FOODS = [
  { name: 'Eggs',           portion: '2 medium (120 g)', nutrients: { b2: 0.54, vitd: 3.4, selenium: 30, zinc: 1.3, b12: 2.4, b5: 1.9, vita: 160, b6: 0.18 } },
  { name: 'Salmon',         portion: '150 g fillet',     nutrients: { vitd: 11,  b12: 4.2, b3: 12,  selenium: 43, b2: 0.5,  b6: 1.2, b5: 2.0 } },
  { name: 'Sardines',       portion: '90 g (tin)',        nutrients: { vitd: 4.8, b12: 3.5, calcium: 350, selenium: 30, b3: 5.4, b2: 0.22 } },
  { name: 'Mackerel',       portion: '150 g fillet',     nutrients: { vitd: 6.3, b12: 5.4, selenium: 53, b2: 0.5, b3: 9.0, b6: 0.7 } },
  { name: 'Chicken Liver',  portion: '75 g',             nutrients: { vita: 6400, b12: 18, b9: 600, b2: 1.3, iron: 7.5, zinc: 3.0, selenium: 35 } },
  { name: 'Oysters',        portion: '6 medium (85 g)',  nutrients: { zinc: 39, b12: 16, selenium: 55, iron: 4.6, vitd: 3.2 } },
  { name: 'Full-fat Yogurt',portion: '150 g',            nutrients: { calcium: 240, b12: 0.9, b2: 0.27, zinc: 0.9 } },
  { name: 'Cheddar',        portion: '30 g',             nutrients: { calcium: 218, b12: 0.5, b2: 0.15, zinc: 0.9 } },
  { name: 'Milk',           portion: '200 ml',           nutrients: { calcium: 240, b12: 0.9, vitd: 1.6, b2: 0.22 } },
];

// Seasonal availability by food (lowercase) → months in season (1=Jan…12=Dec)
// Reference: Germany (de). AT/CH reuse DE; UK has minor overrides.
const SEASONAL_CALENDAR = {
  de: {
    'asparagus':                 [4,5,6],
    'green asparagus':           [4,5,6],
    'purple sprouting broccoli': [2,3,4],
    'broccoli':                  [5,6,7,8,9,10,11],
    'tenderstem broccoli':       [6,7,8,9,10,11],
    'cauliflower':               [6,7,8,9,10,11],
    'cabbage':                   [9,10,11,12,1,2,3],
    'red cabbage':               [10,11,12,1,2,3],
    'savoy cabbage':             [10,11,12,1,2,3],
    'white cabbage':             [10,11,12,1,2,3],
    'kale':                      [11,12,1,2,3],
    'brussels sprouts':          [10,11,12,1,2],
    'spinach':                   [4,5,9,10,11],
    'chard':                     [6,7,8,9,10],
    'swiss chard':               [6,7,8,9,10],
    'rocket':                    [4,5,6,7,8,9,10],
    'arugula':                   [4,5,6,7,8,9,10],
    'lettuce':                   [4,5,6,7,8,9,10],
    'radish':                    [4,5,6,7,8,9,10],
    'spring onion':              [4,5,6,7,8,9,10],
    'leek':                      [9,10,11,12,1,2,3,4],
    'peas':                      [5,6,7,8],
    'broad beans':               [5,6,7,8],
    'courgette':                 [6,7,8,9],
    'zucchini':                  [6,7,8,9],
    'cucumber':                  [6,7,8,9],
    'tomato':                    [7,8,9],
    'aubergine':                 [7,8,9],
    'pepper':                    [7,8,9],
    'fennel':                    [7,8,9,10],
    'kohlrabi':                  [5,6,7,8,9,10],
    'corn':                      [7,8,9,10],
    'beetroot':                  [7,8,9,10,11],
    'celery':                    [8,9,10],
    'celeriac':                  [9,10,11,12,1,2,3],
    'carrot':                    [8,9,10,11,12,1,2,3],
    'parsnip':                   [10,11,12,1,2,3],
    'turnip':                    [9,10,11],
    'pumpkin':                   [9,10,11],
    'squash':                    [9,10,11],
    'butternut squash':          [9,10,11],
    'rhubarb':                   [4,5,6],
    'strawberry':                [5,6,7],
    'gooseberry':                [6,7,8],
    'cherry':                    [6,7,8],
    'raspberry':                 [6,7,8,9],
    'redcurrant':                [7,8],
    'blueberry':                 [7,8,9],
    'blackberry':                [8,9,10],
    'apple':                     [8,9,10,11],
    'pear':                      [8,9,10],
    'plum':                      [7,8,9],
  },
};
SEASONAL_CALENDAR.at = SEASONAL_CALENDAR.de;
SEASONAL_CALENDAR.ch = SEASONAL_CALENDAR.de;
SEASONAL_CALENDAR.uk = {
  ...SEASONAL_CALENDAR.de,
  'strawberry': [5,6,7,8],
  'broad beans': [5,6,7],
  'asparagus': [4,5,6],
};

const PLANT_GROUPS = [
  { label: 'Lentils',       members: ['lentils', 'green lentils', 'red lentils'] },
  { label: 'Broccoli',      members: ['broccoli', 'tenderstem broccoli', 'purple sprouting broccoli'] },
  { label: 'Cabbage',       members: ['cabbage', 'red cabbage', 'savoy cabbage', 'white cabbage'] },
  { label: 'Mushrooms',     members: ['mushroom', 'oyster mushroom', 'portobello', 'shiitake'] },
  { label: 'Beans',         members: ['black beans', 'butter beans', 'cannellini beans', 'kidney beans', 'pinto beans', 'mung beans', 'broad beans'] },
  { label: 'Onion family',  members: ['onion', 'red onion', 'shallot', 'spring onion'] },
  { label: 'Asparagus',     members: ['asparagus', 'green asparagus'] },
  { label: 'Pak Choi',      members: ['pak choi', 'bok choy'] },
  { label: 'Squash',        members: ['pumpkin', 'squash', 'butternut squash'] },
  { label: 'Chard',         members: ['chard', 'swiss chard'] },
  { label: 'Rocket',        members: ['rocket', 'arugula'] },
  { label: 'Courgette',     members: ['courgette', 'zucchini'] },
  { label: 'Flaxseeds',     members: ['flaxseeds', 'linseeds'] },
  { label: 'Tea',           members: ['green tea', 'black tea', 'white tea', 'matcha'] },
  { label: 'Coriander',     members: ['coriander', 'coriander seeds'] },
];

const _plantGroupMap = new Map(
  PLANT_GROUPS.flatMap(g => g.members.map(m => [m, g]))
);

let _suggExpanded = false;
window._expandSugg = function () {
  _suggExpanded = true;
  renderNutritionTab(true);
};

function renderNutrientSuggestions(totals, loggedFoodsThisWeek) {
  const el = document.getElementById('nutritionSuggestions');

  const dow = new Date().getDay();
  const pace = (dow === 0 ? 7 : dow) / 7;

  // Identify nutrients where the user is behind today's pace
  const gapNutrients = NUTRIENT_DEFS
    .filter(({ key }) => NUTRIENT_WEEKLY_REF[key] && totals[key] != null)
    .map(({ key, unit }) => ({
      key, unit,
      coverage: totals[key] / NUTRIENT_WEEKLY_REF[key],
    }))
    .filter(n => n.coverage < pace)
    .sort((a, b) => a.coverage - b.coverage);

  let plantHtml = '';

  if (!gapNutrients.length) {
    plantHtml = `<p class="empty">${t('sugg_all_covered')}</p>`;
  } else {
    const loggedSet = new Set(loggedFoodsThisWeek.map(f => f.toLowerCase()));

    const MIN_COVERAGE = 0.05;
    const seasonCountry = getSeasonalCountry();
    const seasonMap = seasonCountry !== 'off' ? (SEASONAL_CALENDAR[seasonCountry] ?? {}) : {};
    const currentMonth = new Date().getMonth() + 1;

    const rawScores = Object.entries(NUTRITION_DATA)
      .filter(([name]) => !loggedSet.has(name))
      .map(([name, d]) => {
        const covered = gapNutrients
          .map(({ key, unit }) => {
            const amount = d[key] != null ? +(d[key] * d.g / 100).toFixed(1) : 0;
            const pct = amount / NUTRIENT_WEEKLY_REF[key];
            return pct >= MIN_COVERAGE ? { key, unit, amount, pct } : null;
          })
          .filter(Boolean);
        const inSeason = seasonMap[name]?.includes(currentMonth) ?? false;
        const baseScore = covered.reduce((s, n) => s + n.pct, 0);
        return { name, covered, totalScore: inSeason ? baseScore * 1.3 : baseScore, inSeason };
      })
      .filter(f => f.covered.length > 0)
      .sort((a, b) => b.covered.length - a.covered.length || b.totalScore - a.totalScore);

    // Merge foods that belong to the same plant group into one entry
    const seenGroups = new Map();
    const foodScores = [];
    for (const food of rawScores) {
      const group = _plantGroupMap.get(food.name);
      if (group) {
        if (seenGroups.has(group.label)) {
          const entry = seenGroups.get(group.label);
          entry.members.push(food.name);
          if (food.inSeason) entry.inSeason = true;
          for (const c of food.covered) {
            const existing = entry.covered.find(x => x.key === c.key);
            if (!existing) entry.covered.push({ ...c });
            else if (c.pct > existing.pct) Object.assign(existing, c);
          }
          entry.totalScore = entry.covered.reduce((s, n) => s + n.pct, 0);
        } else {
          const entry = { name: group.label, members: [food.name], covered: [...food.covered], totalScore: food.totalScore, isGroup: true, inSeason: food.inSeason };
          seenGroups.set(group.label, entry);
          foodScores.push(entry);
        }
      } else {
        foodScores.push({ ...food, members: null, isGroup: false });
      }
    }

    const INITIAL_SHOW = 8;
    const visibleScores = _suggExpanded ? foodScores : foodScores.slice(0, INITIAL_SHOW);
    const hiddenCount = foodScores.length - visibleScores.length;

    if (!visibleScores.length) {
      plantHtml = `<p class="empty">${t('no_suggestions')}</p>`;
    } else {
      // Group foods by their top gap nutrient to render superpower sections
      const sections = [];
      const assignedFoods = new Set();
      for (const gap of gapNutrients) {
        const foods = visibleScores.filter(f => !assignedFoods.has(f.name) && f.covered.some(c => c.key === gap.key));
        if (!foods.length) continue;
        foods.forEach(f => assignedFoods.add(f.name));
        sections.push({ gapKey: gap.key, foods });
      }

      // For gap nutrients with no scored plant food, add a "poor plant source" fallback section
      const coveredGapKeys = new Set(sections.map(s => s.gapKey));
      for (const gap of gapNutrients) {
        if (coveredGapKeys.has(gap.key)) continue;
        if (!t('poorplant_' + gap.key)) continue; // only for known poor-plant nutrients
        // Top 3 plant foods by absolute amount of this nutrient per portion, ignoring MIN_COVERAGE
        const top3 = Object.entries(NUTRITION_DATA)
          .filter(([name]) => !loggedSet.has(name) && NUTRITION_DATA[name][gap.key] != null)
          .map(([name, d]) => {
            const amount = +(d[gap.key] * d.g / 100).toFixed(2);
            const pct = Math.round(amount / NUTRIENT_WEEKLY_REF[gap.key] * 100);
            return { name, amount, pct, unit: gap.unit };
          })
          .filter(f => f.amount > 0)
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 3);
        sections.push({ gapKey: gap.key, foods: [], poorPlantSource: true, top3 });
      }

      const renderFoodRow = ({ name, members, isGroup, covered, inSeason }) => {
        const displayName = isGroup ? name : name.replace(/\b\w/g, c => c.toUpperCase());
        const countKey = covered.length === 1 ? 'covers_1_gap' : 'covers_n_gaps';
        const chips = covered.map(({ key, unit, amount }) =>
          `<span class="sugg-nut-chip">${esc(t('nutrient_' + key))} <em>${amount} ${esc(unit)}</em></span>`
        ).join('');
        const groupSub = isGroup
          ? `<span class="sugg-food-variety">${esc(t('sugg_variety_label'))}: ${members.map(m => esc(tFood(m.replace(/\b\w/g, c => c.toUpperCase())))).join(', ')}</span>`
          : '';
        const seasonBadge = inSeason
          ? `<span class="sugg-season-badge">${esc(t('season_badge'))}</span>`
          : '';
        return `
          <div class="sugg-food-row">
            <div class="sugg-food-header">
              <span class="sugg-food-name">${esc(tFood(displayName))}</span>
              ${seasonBadge}
              <span class="sugg-food-badge">${t(countKey, { n: covered.length })}</span>
            </div>
            ${groupSub}
            <div class="sugg-nut-chips">${chips}</div>
          </div>`;
      };

      plantHtml = sections.map(({ gapKey, foods, poorPlantSource, top3 }) => {
        const nutrientLabel = esc(t('nutrient_' + gapKey));
        const factText = esc(t('fact_' + gapKey));
        const poorPlantMsg = poorPlantSource ? t('poorplant_' + gapKey) : '';
        const disclaimer = poorPlantMsg
          ? `<p class="sugg-poor-plant-note">⚠️ ${esc(poorPlantMsg)}</p>`
          : '';
        const rows = foods.map(renderFoodRow).join('');
        const weakRows = (top3 ?? []).map(({ name, amount, pct, unit }) => `
          <div class="sugg-food-row sugg-food-row--weak">
            <div class="sugg-food-header">
              <span class="sugg-food-name">${esc(tFood(name.replace(/\b\w/g, c => c.toUpperCase())))}</span>
              <span class="sugg-food-badge sugg-food-badge--weak">${pct}% / Woche</span>
            </div>
            <div class="sugg-nut-chips">
              <span class="sugg-nut-chip sugg-nut-chip--weak">${esc(t('nutrient_' + gapKey))} <em>${fmtVal(amount)} ${esc(unit)}</em></span>
            </div>
          </div>`).join('');
        return `
          <div class="sugg-section" id="sugg-section-${gapKey}">
            <div class="sugg-section-header">
              <span class="sugg-section-nutrient">${nutrientLabel}</span>
              <p class="sugg-section-fact">${factText}</p>
            </div>
            ${disclaimer}
            ${rows ? `<div class="sugg-food-list">${rows}</div>` : ''}
            ${weakRows ? `<div class="sugg-food-list">${weakRows}</div>` : ''}
          </div>`;
      }).join('');

      if (hiddenCount > 0) {
        plantHtml += `<button class="btn-secondary sugg-show-more" onclick="_expandSugg()">${esc(t('sugg_show_more', { n: hiddenCount }))}</button>`;
      }
    }
  }

  // Animal food suggestions (b12 always a gap since plants contain none)
  let animalHtml = '';
  if (getAnimalSuggestions()) {
    const MIN_COVERAGE = 0.05;
    const animalGaps = NUTRIENT_DEFS
      .filter(({ key }) => ANIMAL_WEEKLY_REF[key] && totals[key] != null)
      .map(({ key, unit }) => ({ key, unit, coverage: (totals[key] ?? 0) / ANIMAL_WEEKLY_REF[key] }))
      .filter(n => n.coverage < 1);
    if (!animalGaps.find(n => n.key === 'b12')) {
      animalGaps.push({ key: 'b12', unit: 'µg', coverage: 0 });
    }
    const animalScores = ANIMAL_FOODS
      .map(food => {
        const covered = animalGaps.map(({ key, unit }) => {
          const amount = food.nutrients[key] ?? 0;
          const ref = ANIMAL_WEEKLY_REF[key];
          if (!ref || !amount) return null;
          const pct = amount / ref;
          return pct >= MIN_COVERAGE ? { key, unit, amount, pct } : null;
        }).filter(Boolean);
        return { ...food, covered, totalScore: covered.reduce((s, n) => s + n.pct, 0) };
      })
      .filter(f => f.covered.length > 0)
      .sort((a, b) => b.covered.length - a.covered.length || b.totalScore - a.totalScore)
      .slice(0, 5);

    if (animalScores.length) {
      const rows = animalScores.map(({ name, portion, covered }) => {
        const countKey = covered.length === 1 ? 'covers_1_gap' : 'covers_n_gaps';
        const chips = covered.map(({ key, unit, amount }) =>
          `<span class="sugg-nut-chip">${esc(t('nutrient_' + key))} <em>${+amount.toFixed(1)} ${esc(unit)}</em></span>`
        ).join('');
        return `
          <div class="sugg-food-row">
            <div class="sugg-food-header">
              <span class="sugg-food-name">${esc(tFood(name))}</span>
              <span class="sugg-food-portion">${esc(portion)}</span>
              <span class="sugg-food-badge">${t(countKey, { n: covered.length })}</span>
            </div>
            <div class="sugg-nut-chips">${chips}</div>
          </div>`;
      }).join('');
      animalHtml = `
        <div class="sugg-section sugg-section--animal">
          <div class="sugg-section-header">
            <span class="sugg-section-nutrient">${esc(t('sugg_animal_label'))}</span>
          </div>
          <div class="sugg-food-list">${rows}</div>
        </div>`;
    }
  }

  el.innerHTML = plantHtml + animalHtml;
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

// Maps English canonical food name → OpenMoji codepoint (hex string)
// Source: https://openmoji.org  —  CC BY-SA 4.0
const FOOD_EMOJI = {
  // Vegetables
  'Aubergine': '1F346', 'Avocado': '1F951', 'Bamboo Shoots': '1F38B',
  'Bean Sprouts': '1F331', 'Bell Pepper': '1FAD1', 'Bok Choy': '1F96C',
  'Broccoli': '1F966', 'Brussels Sprouts': '1F966', 'Butternut Squash': '1F383',
  'Cabbage': '1F96C', 'Carrot': '1F955', 'Cauliflower': '1F966',
  'Celery': '1F33F', 'Chard': '1F96C', 'Chicory': '1F96C',
  'Chilli': '1F336', 'Chives': '1F33F', 'Courgette': '1F952',
  'Cucumber': '1F952', 'Edamame': '1FAD8', 'Endive': '1F96C',
  'Fennel': '1F33F', 'Garlic': '1F9C4', 'Green Asparagus': '1F33F',
  'Green Beans': '1FAD8', 'Jalapeño': '1F336', 'Kale': '1F96C',
  'Leek': '1F9C5', 'Lettuce': '1F96C', 'Mangetout': '1FAD9',
  'Mushroom': '1F344', 'Onion': '1F9C5', 'Oyster Mushroom': '1F344',
  'Pak Choi': '1F96C', 'Parsnip': '1F955', 'Peas': '1FAD9',
  'Portobello': '1F344', 'Potato': '1F954', 'Pumpkin': '1F383',
  'Radicchio': '1F96C', 'Radish': '1F331', 'Red Cabbage': '1F96C',
  'Red Onion': '1F9C5', 'Romanesco': '1F966', 'Savoy Cabbage': '1F96C',
  'Shallot': '1F9C5', 'Shiitake': '1F344', 'Spinach': '1F96C',
  'Spring Onion': '1F9C5', 'Squash': '1F383', 'Swede': '1F955',
  'Sweet Corn': '1F33D', 'Sweet Potato': '1F360', 'Swiss Chard': '1F96C',
  'Taro': '1F954', 'Tenderstem Broccoli': '1F966', 'Tomato': '1F345',
  'Turnip': '1F955', 'Watercress': '1F33F', 'White Cabbage': '1F96C',
  'Yam': '1F360', 'Zucchini': '1F952', 'Cavolo Nero': '1F96C',
  'Purple Sprouting Broccoli': '1F966', 'Olives': '1FAD2',
  // Fruits
  'Apple': '1F34E', 'Apricot': '1F351', 'Banana': '1F34C',
  'Blackberry': '1FAD0', 'Blackcurrant': '1FAD0', 'Blueberry': '1FAD0',
  'Cherry': '1F352', 'Clementine': '1F34A', 'Cranberry': '1F352',
  'Elderberry': '1FAD0', 'Gooseberry': '1FAD0', 'Grape': '1F347',
  'Grapefruit': '1F34A', 'Guava': '1F348', 'Jackfruit': '1F348',
  'Kiwi': '1F95D', 'Lemon': '1F34B', 'Lime': '1F34B',
  'Mango': '1F96D', 'Melon': '1F348', 'Nectarine': '1F351',
  'Orange': '1F34A', 'Papaya': '1F96D', 'Peach': '1F351',
  'Pear': '1F350', 'Pineapple': '1F34D', 'Plum': '1F351',
  'Raspberry': '1FAD0', 'Redcurrant': '1F352', 'Satsuma': '1F34A',
  'Strawberry': '1F353', 'Tangerine': '1F34A', 'Watermelon': '1F349',
  'Coconut': '1F965', 'Mulberry': '1FAD0', 'Persimmon': '1F34A',
  'Plantain': '1F34C', 'Quince': '1F350',
  'Raisins': '1F347', 'Sultanas': '1F347', 'Dried Apricots': '1F351',
  'Prunes': '1F351', 'Dried Cranberries': '1F352', 'Dried Figs': '1F351',
  'Dried Mango': '1F96D', 'Goji Berries': '1FAD0',
  // Seeds & nuts
  'Chia Seeds': '1F33E', 'Flaxseeds': '1F33E', 'Linseeds': '1F33E',
  'Hemp Seeds': '1F33F', 'Pumpkin Seeds': '1F383', 'Sesame Seeds': '1F33E',
  'Sunflower Seeds': '1F33B', 'Poppy Seeds': '1F33A',
  'Almonds': '1F95C', 'Brazil Nuts': '1F330', 'Cashews': '1F95C',
  'Hazelnuts': '1F330', 'Macadamia Nuts': '1F95C', 'Peanuts': '1F95C',
  'Pecans': '1F330', 'Pine Nuts': '1F332', 'Pistachios': '1F95C',
  'Walnuts': '1F330',
  // Legumes & soy
  'Chickpeas': '1FAD8', 'Lentils': '1FAD8', 'Red Lentils': '1FAD8',
  'Green Lentils': '1FAD8', 'Black Beans': '1FAD8', 'Kidney Beans': '1FAD8',
  'Butter Beans': '1FAD8', 'Cannellini Beans': '1FAD8', 'Pinto Beans': '1FAD8',
  'Mung Beans': '1FAD8', 'Broad Beans': '1FAD8', 'Soybeans': '1FAD8',
  'Tofu': '1FAD8',
  // Dried fruits
  'Date': '1F351', 'Dates': '1F351',
  // Grains
  'Oats': '1F33E', 'Brown Rice': '1F33E', 'Quinoa': '1F33E', 'Barley': '1F33E',
  'Rye': '1F33E', 'Buckwheat': '1F33E', 'Millet': '1F33E', 'Spelt': '1F33E',
  'Amaranth': '1F33E', 'Teff': '1F33E', 'Sorghum': '1F33E', 'Farro': '1F33E',
  'Wild Rice': '1F33E', 'Bulgur': '1F33E', 'Freekeh': '1F33E', 'Kamut': '1F33E',
  'Einkorn': '1F33E',
  // Herbs
  'Parsley': '1F33F', 'Coriander': '1F33F', 'Mint': '1F33F',
  'Basil': '1F33F', 'Dill': '1F33F', 'Oregano': '1F33F',
  'Thyme': '1F33F', 'Rosemary': '1F33F',
  // Sea veg
  'Nori': '1F30A', 'Wakame': '1F30A', 'Kelp': '1F30A', 'Spirulina': '1F30A',
  // Missing veg
  'Artichoke': '1F966', 'Arugula': '1F96C', 'Rocket': '1F96C',
  'Asparagus': '1F33F', 'Beetroot': '1F955', 'Bitter Melon': '1F952',
  'Celeriac': '1F955', 'Ginger': '1F9C2', 'Kohlrabi': '1F966',
  'Lotus Root': '1F33F', 'Okra': '1F33F',
  // Missing fruits
  'Dragon Fruit': '1F348', 'Fig': '1F351', 'Lychee': '1F351',
  'Passion Fruit': '1F96D', 'Pomegranate': '1F352',
  // Missing legumes
  'Tempeh': '1FAD8',
  // Spices
  'Turmeric': '1F9C2', 'Cumin': '1F9C2', 'Cardamom': '1F9C2',
  'Cinnamon': '1F9C2', 'Cloves': '1F9C2', 'Black Pepper': '1F9C2',
  'Paprika Powder': '1F9C2', 'Fenugreek': '1F9C2', 'Mustard Seeds': '1F9C2',
  'Caraway Seeds': '1F9C2', 'Fennel Seeds': '1F9C2', 'Star Anise': '1F9C2',
  'Nutmeg': '1F9C2', 'Allspice': '1F9C2', 'Chili Powder': '1F336',
  'Coriander Seeds': '1F9C2', 'Cayenne Pepper': '1F336',
  // Hot drinks
  'Coffee': '2615', 'Green Tea': '1F375', 'Black Tea': '1F375',
  'White Tea': '1F375', 'Matcha': '1F375', 'Chamomile': '1F375',
  'Rooibos': '1F375', 'Peppermint Tea': '1F375', 'Ginger Tea': '1F375',
  // Fermented
  'Kimchi': '1F96C', 'Sauerkraut': '1F96C', 'Miso': '1F35C', 'Kombucha': '1FAD9',
  // Cacao
  'Dark Chocolate': '1F36B', 'Cacao Nibs': '1F36B',
  // Other
  'Psyllium Husk': '1F33E',
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

function getEmojiStyle() { return getSettings().emojiStyle ?? 'openmoji'; }

function getEmojiUrl(cp, style) {
  const lo = cp.toLowerCase();
  const hi = cp.toUpperCase();
  switch (style) {
    case 'twemoji':
      return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/${lo}.png`;
    case 'noto':
      return `https://cdn.jsdelivr.net/gh/googlefonts/noto-emoji@v2.034/png/128/emoji_u${lo}.png`;
    default: // openmoji
      return `https://cdn.jsdelivr.net/gh/hfg-gmuend/openmoji@15.0.0/color/618x618/${hi}.png`;
  }
}

// Image cache — keyed by "style:codepoint"
const emojiImageCache = new Map();

function loadEmojiImage(cp, style) {
  const key = `${style ?? 'openmoji'}:${cp}`;
  if (emojiImageCache.has(key)) return Promise.resolve(emojiImageCache.get(key));
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload  = () => { emojiImageCache.set(key, img);   resolve(img);  };
    img.onerror = () => { emojiImageCache.set(key, null);  resolve(null); };
    img.src = getEmojiUrl(cp, style ?? 'openmoji');
  });
}

async function drawDayCard(date, foods, style) {
  style = style ?? getEmojiStyle();
  const W = 1080, H = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // ── Background ──────────────────────────────────────────────────────────────
  const bg = ctx.createLinearGradient(0, H * 0.2, W * 0.8, H * 0.8);
  bg.addColorStop(0, '#163522');
  bg.addColorStop(1, '#0f2a1a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = 'rgba(255,255,255,0.028)';
  for (let x = 36; x < W; x += 60)
    for (let y = 36; y < H; y += 60) {
      ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
    }

  // ── Header ──────────────────────────────────────────────────────────────────
  const PAD = 72;
  const d = new Date(date + 'T12:00:00');
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(160,220,180,0.55)';
  ctx.font = '400 46px system-ui, sans-serif';
  ctx.fillText(d.toLocaleDateString(dateLocale(), { weekday: 'long' }).toUpperCase(), PAD, 104);
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 210px system-ui, sans-serif';
  ctx.fillText(String(d.getDate()).padStart(2, '0'), PAD - 6, 300);
  ctx.fillStyle = 'rgba(160,220,180,0.55)';
  ctx.font = '400 46px system-ui, sans-serif';
  ctx.fillText(d.toLocaleDateString(dateLocale(), { month: 'long', year: 'numeric' }).toUpperCase(), PAD, 352);
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(PAD, 388); ctx.lineTo(W - PAD, 388); ctx.stroke();

  // ── Grid layout ─────────────────────────────────────────────────────────────
  const MAX_SHOW = 16;
  const display  = foods.slice(0, MAX_SHOW);
  const n        = display.length;
  const COLS     = n <= 2 ? n : n <= 4 ? 2 : n <= 9 ? 3 : 4;
  const ROWS     = Math.ceil(n / COLS);
  const GAP      = 16;
  const GRID_Y   = 412;
  const FOOTER_H = 220;
  const CELL     = Math.min(
    Math.floor((W - PAD * 2 - GAP * (COLS - 1)) / COLS),
    Math.floor((H - GRID_Y - FOOTER_H - GAP * (ROWS - 1)) / ROWS)
  );

  // Pre-load emoji images in parallel
  const imageMap = new Map();
  await Promise.all(display.map(async food => {
    const cp = FOOD_EMOJI[food];
    if (cp) {
      const img = await loadEmojiImage(cp, style);
      if (img) imageMap.set(food, img);
    }
  }));

  // ── Draw cells ───────────────────────────────────────────────────────────────
  display.forEach((food, i) => {
    const col  = i % COLS;
    const row  = Math.floor(i / COLS);
    const x    = PAD + col * (CELL + GAP);
    const y    = GRID_Y + row * (CELL + GAP);
    const cx   = x + CELL / 2;
    const eY   = y + CELL * 0.44;
    const r    = CELL * 0.28;

    // Cell background
    ctx.fillStyle = 'rgba(255,255,255,0.11)';
    ctx.beginPath(); ctx.roundRect(x, y, CELL, CELL, 18); ctx.fill();

    // White circle backdrop
    ctx.fillStyle = 'rgba(255,255,255,0.93)';
    ctx.beginPath(); ctx.arc(cx, eY, r, 0, Math.PI * 2); ctx.fill();

    const img = imageMap.get(food);
    if (img) {
      // Clip to circle, draw OpenMoji PNG
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, eY, r * 0.95, 0, Math.PI * 2); ctx.clip();
      const ir = r * 0.76; // ~24% padding inside the circle
      ctx.drawImage(img, cx - ir, eY - ir, ir * 2, ir * 2);
      ctx.restore();
    } else {
      // Fallback: colored circle + initial
      ctx.fillStyle = foodColor(food);
      ctx.beginPath(); ctx.arc(cx, eY, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = `700 ${Math.floor(r * 0.9)}px system-ui, sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(food[0].toUpperCase(), cx, eY);
    }

    // Label — word-wrapped, max 2 lines
    const fontSize = Math.max(18, Math.floor(CELL * 0.1));
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.font = `400 ${fontSize}px system-ui, sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    const label = tFood(food);
    const maxLabelW = CELL - 12;
    const words = label.split(' ');
    const labelLines = [];
    let cur = '';
    for (const w of words) {
      const test = cur ? cur + ' ' + w : w;
      if (ctx.measureText(test).width > maxLabelW && cur) {
        labelLines.push(cur); cur = w;
      } else { cur = test; }
    }
    if (cur) labelLines.push(cur);
    const lineH = fontSize * 1.25;
    const totalH = labelLines.length * lineH;
    const labelStartY = y + CELL * 0.76 - (totalH - lineH) / 2;
    labelLines.slice(0, 2).forEach((line, li) => {
      ctx.fillText(line, cx, labelStartY + li * lineH);
    });
  });

  if (foods.length > MAX_SHOW) {
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '400 36px system-ui, sans-serif';
    ctx.textAlign = 'right'; ctx.textBaseline = 'top';
    ctx.fillText(`+${foods.length - MAX_SHOW} more`, W - PAD, GRID_Y + ROWS * (CELL + GAP));
  }

  // ── Footer ───────────────────────────────────────────────────────────────────
  const footerY = H - FOOTER_H + 20;
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(PAD, footerY); ctx.lineTo(W - PAD, footerY); ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 62px system-ui, sans-serif';
  ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillText(t(n === 1 ? 'x_plants' : 'x_plants_plural', { n }), PAD, footerY + 36);
  ctx.fillStyle = 'rgba(160,220,180,0.5)';
  ctx.font = '400 38px system-ui, sans-serif';
  ctx.fillText('Veggie Tracker', PAD, footerY + 118);

  return canvas;
}

function getISOWeekNumber(dateStr) {
  // dateStr is always a Monday (from getWeekStart)
  const d = new Date(dateStr + 'T12:00:00Z');
  const jan4 = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const dow = (jan4.getUTCDay() + 6) % 7; // 0=Mon
  const week1Mon = new Date(jan4.getTime() - dow * 86400000);
  return Math.round((d - week1Mon) / (7 * 86400000)) + 1;
}

async function drawWeekCard(weekStart, foods, style, thumbMode = false) {
  style = style ?? getEmojiStyle();
  const W        = 1080;
  const PAD      = 72;
  const GAP      = 16;
  const GRID_Y   = 412;
  const FOOTER_H = 220;
  const weekNum  = getISOWeekNumber(weekStart);
  const n        = foods.length;
  const goal     = getGoal();

  // Thumbnail: fixed 4:5 canvas, max 16 items, "+N more" badge
  // Full card: grows to fit all items
  const MAX_THUMB  = 16;
  const displayFoods = thumbMode ? foods.slice(0, MAX_THUMB) : foods;
  const overflow     = thumbMode ? Math.max(0, n - MAX_THUMB) : 0;

  const COLS = displayFoods.length <= 2 ? displayFoods.length
             : displayFoods.length <= 4 ? 2
             : displayFoods.length <= 9 ? 3 : 4;
  const ROWS = Math.ceil(displayFoods.length / COLS);

  const canvas = document.createElement('canvas');
  canvas.width = W;

  let canvasH;
  if (thumbMode) {
    canvasH = 1350; // fixed 4:5
  } else {
    const CELL_full = Math.floor((W - PAD * 2 - GAP * (COLS - 1)) / COLS);
    canvasH = GRID_Y + ROWS * (CELL_full + GAP) - GAP + FOOTER_H + 40;
  }
  canvas.height = canvasH;

  const CELL = Math.floor((W - PAD * 2 - GAP * (COLS - 1)) / COLS);

  const ctx = canvas.getContext('2d');

  // ── Background ──────────────────────────────────────────────────────────────
  const bg = ctx.createLinearGradient(0, canvasH * 0.2, W * 0.8, canvasH * 0.8);
  bg.addColorStop(0, '#163522'); bg.addColorStop(1, '#0f2a1a');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, canvasH);
  ctx.fillStyle = 'rgba(255,255,255,0.028)';
  for (let x = 36; x < W; x += 60)
    for (let y = 36; y < canvasH; y += 60) {
      ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
    }

  // ── Header ───────────────────────────────────────────────────────────────────
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(160,220,180,0.55)';
  ctx.font = '400 46px system-ui, sans-serif';
  ctx.fillText('WEEK', PAD, 104);
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 210px system-ui, sans-serif';
  ctx.fillText(String(weekNum).padStart(2, '0'), PAD - 6, 300);
  ctx.fillStyle = 'rgba(160,220,180,0.55)';
  ctx.font = '400 46px system-ui, sans-serif';
  ctx.fillText(fmtWeekRange(weekStart).toUpperCase(), PAD, 352);
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(PAD, 388); ctx.lineTo(W - PAD, 388); ctx.stroke();

  // ── Pre-load emoji images ────────────────────────────────────────────────────
  const imageMap = new Map();
  await Promise.all(displayFoods.map(async food => {
    const cp = FOOD_EMOJI[food];
    if (cp) {
      const img = await loadEmojiImage(cp, style);
      if (img) imageMap.set(food, img);
    }
  }));

  // ── Draw cells ───────────────────────────────────────────────────────────────
  displayFoods.forEach((food, i) => {
    const col  = i % COLS;
    const row  = Math.floor(i / COLS);
    const x    = PAD + col * (CELL + GAP);
    const y    = GRID_Y + row * (CELL + GAP);
    const cx   = x + CELL / 2;
    const eY   = y + CELL * 0.44;
    const r    = CELL * 0.28;

    ctx.fillStyle = 'rgba(255,255,255,0.11)';
    ctx.beginPath(); ctx.roundRect(x, y, CELL, CELL, 18); ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.93)';
    ctx.beginPath(); ctx.arc(cx, eY, r, 0, Math.PI * 2); ctx.fill();

    const img = imageMap.get(food);
    if (img) {
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, eY, r * 0.95, 0, Math.PI * 2); ctx.clip();
      const ir = r * 0.76;
      ctx.drawImage(img, cx - ir, eY - ir, ir * 2, ir * 2);
      ctx.restore();
    } else {
      ctx.fillStyle = foodColor(food);
      ctx.beginPath(); ctx.arc(cx, eY, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = `700 ${Math.floor(r * 0.9)}px system-ui, sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(food[0].toUpperCase(), cx, eY);
    }

    const fontSize = Math.max(18, Math.floor(CELL * 0.1));
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.font = `400 ${fontSize}px system-ui, sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    const label = tFood(food);
    const maxLabelW = CELL - 12;
    const words = label.split(' ');
    const labelLines = [];
    let cur = '';
    for (const w of words) {
      const test = cur ? cur + ' ' + w : w;
      if (ctx.measureText(test).width > maxLabelW && cur) {
        labelLines.push(cur); cur = w;
      } else { cur = test; }
    }
    if (cur) labelLines.push(cur);
    const lineH = fontSize * 1.25;
    const totalH = labelLines.length * lineH;
    const labelStartY = y + CELL * 0.76 - (totalH - lineH) / 2;
    labelLines.slice(0, 2).forEach((line, li) => {
      ctx.fillText(line, cx, labelStartY + li * lineH);
    });
  });

  // ── "+N more" badge (thumb mode only) ────────────────────────────────────────
  if (overflow > 0) {
    const lastIdx  = displayFoods.length; // slot after last shown item
    const col      = lastIdx % COLS;
    const row      = Math.floor(lastIdx / COLS);
    // If there's a slot left in the last row, use it; otherwise place badge below grid
    const bx = PAD + col * (CELL + GAP);
    const by = GRID_Y + row * (CELL + GAP);
    if (col < COLS && by + CELL < canvasH - FOOTER_H) {
      ctx.fillStyle = 'rgba(255,255,255,0.13)';
      ctx.beginPath(); ctx.roundRect(bx, by, CELL, CELL, 18); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = `700 ${Math.floor(CELL * 0.22)}px system-ui, sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(`+${overflow}`, bx + CELL / 2, by + CELL / 2);
    }
  }

  // ── Footer ───────────────────────────────────────────────────────────────────
  const footerY = canvasH - FOOTER_H + 20;
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(PAD, footerY); ctx.lineTo(W - PAD, footerY); ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 62px system-ui, sans-serif';
  ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillText(t(n === 1 ? 'x_plants' : 'x_plants_plural', { n: `${n} / ${goal}` }), PAD, footerY + 36);
  ctx.fillStyle = 'rgba(160,220,180,0.5)';
  ctx.font = '400 38px system-ui, sans-serif';
  ctx.fillText('Veggie Tracker', PAD, footerY + 118);

  return canvas;
}

// ── Card preview modal ────────────────────────────────────────────────────────

let _modalCanvas = null;
let _modalDate   = null;
let _modalDates  = [];
let _modalIndex  = 0;
let _modalType   = 'day'; // 'day' | 'week'

function updateModalNavButtons() {
  const prev = document.getElementById('cardModalPrev');
  const next = document.getElementById('cardModalNext');
  if (prev) prev.hidden = _modalIndex <= 0;
  if (next) next.hidden = _modalIndex >= _modalDates.length - 1;
}

async function navigateModal(dir) {
  const newIdx = _modalIndex + dir;
  if (newIdx < 0 || newIdx >= _modalDates.length) return;
  _modalIndex = newIdx;
  _modalDate  = _modalDates[_modalIndex];

  const img = document.getElementById('cardModalImg');
  img.style.opacity = '0.4';

  const { entries } = getData();
  let canvas;
  if (_modalType === 'week') {
    const weekEnd = addDays(_modalDate, 6);
    const foods = [...new Set(
      entries.filter(e => e.date >= _modalDate && e.date <= weekEnd).map(e => e.vegetable)
    )];
    canvas = await drawWeekCard(_modalDate, foods);
  } else {
    const byDate = new Map();
    for (const e of entries) {
      if (!byDate.has(e.date)) byDate.set(e.date, new Set());
      byDate.get(e.date).add(e.vegetable);
    }
    const foods = [...(byDate.get(_modalDate) ?? new Set())];
    canvas = await drawDayCard(_modalDate, foods);
  }
  _modalCanvas = canvas;
  img.src = canvas.toDataURL('image/png');
  img.style.opacity = '1';
  updateModalNavButtons();
}

function openCardModal(canvas, date, dates, type = 'day', allFoods = null) {
  _modalCanvas = canvas;
  _modalDate   = date;
  _modalDates  = dates ?? [];
  _modalIndex  = _modalDates.indexOf(date);
  _modalType   = type;
  const modal = document.getElementById('cardModal');
  const img   = document.getElementById('cardModalImg');
  img.src = canvas.toDataURL('image/png');
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  updateModalNavButtons();
  // Thumbnail was shown instantly — upgrade to full card in background
  if (type === 'week' && allFoods) {
    drawWeekCard(date, allFoods).then(full => {
      _modalCanvas = full;
      img.src = full.toDataURL('image/png');
    });
  }
}

function closeCardModal() {
  document.getElementById('cardModal').hidden = true;
  document.body.style.overflow = '';
  _modalCanvas = null;
  _modalDate   = null;
  _modalDates  = [];
  _modalIndex  = 0;
  _modalType   = 'day';
}

async function shareOrCopyCard() {
  if (!_modalCanvas) return;
  const dataUrl = _modalCanvas.toDataURL('image/png');
  const res  = await fetch(dataUrl);
  const blob = await res.blob();
  const fname = _modalType === 'week' ? `veggie-week-${_modalDate}.png` : `veggie-${_modalDate}.png`;
  const file = new File([blob], fname, { type: 'image/png' });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({ files: [file], title: t('share_title') }).catch(() => {});
  } else if (navigator.clipboard && navigator.clipboard.write) {
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]).catch(() => {});
    const btn = document.getElementById('cardModalShare');
    const orig = btn.textContent;
    btn.textContent = t('copied');
    setTimeout(() => { btn.textContent = orig; }, 1800);
  } else {
    // Last resort: download
    const a = document.createElement('a');
    a.download = fname;
    a.href = dataUrl;
    a.click();
  }
}

function initCardModal() {
  document.getElementById('cardModalClose').addEventListener('click', closeCardModal);
  document.getElementById('cardModal').querySelector('.card-modal-backdrop')
    .addEventListener('click', closeCardModal);
  document.getElementById('cardModalShare').addEventListener('click', shareOrCopyCard);
  document.getElementById('cardModalDl').addEventListener('click', () => {
    if (!_modalCanvas) return;
    const a = document.createElement('a');
    a.download = _modalType === 'week' ? `veggie-week-${_modalDate}.png` : `veggie-${_modalDate}.png`;
    a.href = _modalCanvas.toDataURL('image/png');
    a.click();
  });
  document.getElementById('cardModalPrev').addEventListener('click', () => navigateModal(-1));
  document.getElementById('cardModalNext').addEventListener('click', () => navigateModal(1));

  // Swipe on the image
  const imgWrap = document.querySelector('.card-modal-img-wrap');
  let touchStartX = 0;
  imgWrap.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  imgWrap.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) navigateModal(dx < 0 ? 1 : -1);
  }, { passive: true });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeCardModal(); return; }
    if (!document.getElementById('cardModal').hidden) {
      if (e.key === 'ArrowLeft')  navigateModal(-1);
      if (e.key === 'ArrowRight') navigateModal(1);
    }
  });
}

async function renderDailyCards() {
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

    const wrapper = document.createElement('div');
    wrapper.className    = 'day-card';
    wrapper.dataset.date = date;
    wrapper.dataset.seed = String(seed);
    container.appendChild(wrapper);

    drawDayCard(date, foods).then(canvas => {
      canvas.style.cssText = 'width:100%;height:100%;display:block;cursor:pointer;';
      wrapper.addEventListener('click', () => openCardModal(canvas, date, dates));
      wrapper.append(canvas);
    });
  }
}

async function renderWeeklyCards() {
  const { entries } = getData();
  const container = document.getElementById('weeklyCards');

  const byWeek = new Map();
  for (const e of entries) {
    const ws = getWeekStart(e.date);
    if (!byWeek.has(ws)) byWeek.set(ws, new Set());
    byWeek.get(ws).add(e.vegetable);
  }

  const weeks = [...byWeek.keys()].sort().reverse().slice(0, 5);

  if (weeks.length === 0) {
    container.innerHTML = `<p class="empty">${t('no_history')}</p>`;
    return;
  }

  const existing = new Map();
  container.querySelectorAll('.day-card[data-week]').forEach(el =>
    existing.set(el.dataset.week, el)
  );

  container.innerHTML = '';

  for (const ws of weeks) {
    const foods = [...byWeek.get(ws)];
    const seed  = simpleHash(ws + ':' + [...foods].sort().join(','));

    const prev = existing.get(ws);
    if (prev && prev.dataset.seed === String(seed)) {
      container.appendChild(prev);
      continue;
    }

    const wrapper = document.createElement('div');
    wrapper.className     = 'day-card';
    wrapper.dataset.week  = ws;
    wrapper.dataset.seed  = String(seed);
    container.appendChild(wrapper);

    drawWeekCard(ws, foods, undefined, true).then(canvas => {
      canvas.style.cssText = 'width:100%;height:100%;display:block;cursor:pointer;';
      wrapper.addEventListener('click', () => openCardModal(canvas, ws, weeks, 'week', foods));
      wrapper.append(canvas);
    });
  }
}

const EMOJI_PREVIEW_FOODS = ['Apple', 'Broccoli', 'Orange', 'Strawberry', 'Blueberry', 'Carrot'];

function renderEmojiPreview(style) {
  const container = document.getElementById('emojiStylePreview');
  if (!container) return;
  container.innerHTML = '';
  for (const food of EMOJI_PREVIEW_FOODS) {
    const cp = FOOD_EMOJI[food];
    if (!cp) continue;
    const item = document.createElement('div');
    item.className = 'emoji-preview-item';
    const img = document.createElement('img');
    img.width = 52; img.height = 52;
    img.alt = food;
    img.src = getEmojiUrl(cp, style);
    const lbl = document.createElement('span');
    lbl.textContent = tFood(food);
    item.append(img, lbl);
    container.appendChild(item);
  }
}

// ── Plant Spotlight ───────────────────────────────────────────────────────────

const FOOD_FACTS = {
  'Broccoli':      { en: "Broccoli has more vitamin C per 100g than an orange. The tree you avoided as a kid was a superhero the whole time.", de: "Brokkoli enthält mehr Vitamin C pro 100g als eine Orange. Das Gemüse, das du als Kind gemieden hast, war die ganze Zeit ein Superheld." },
  'Beetroot':      { en: "Beetroot's natural nitrates convert to nitric oxide in your blood, literally widening your arteries. Athletes call it legal doping.", de: "Die natürlichen Nitrate der Roten Bete verwandeln sich in Stickoxid und weiten buchstäblich deine Arterien. Sportler nennen es legales Doping." },
  'Spinach':       { en: "Popeye lied: spinach's iron is mostly locked up by oxalates. But its folate is the real deal — your DNA uses it to copy itself correctly.", de: "Popeye hat gelogen: Das Eisen im Spinat wird größtenteils durch Oxalate blockiert. Aber Folsäure steckt wirklich drin — die braucht deine DNA zum Kopieren." },
  'Sweet Potato':  { en: "One medium sweet potato has more beta-carotene than you need in an entire day. Your body converts it to vitamin A exactly when needed.", de: "Eine mittlere Süßkartoffel liefert mehr Beta-Carotin als du an einem ganzen Tag brauchst. Dein Körper wandelt es bei Bedarf in Vitamin A um." },
  'Kale':          { en: "Kale has more calcium per calorie than milk, more vitamin C than an orange, and more vitamin K than almost anything else.", de: "Grünkohl hat mehr Kalzium pro Kalorie als Milch, mehr Vitamin C als eine Orange und mehr Vitamin K als fast alles andere." },
  'Garlic':        { en: "Garlic's superpower — allicin — only activates after you crush or chop it. Let it sit 10 minutes before cooking and it survives the heat.", de: "Knoblauchs Superpower — Allicin — aktiviert sich erst nach dem Zerdrücken. 10 Minuten warten vor dem Kochen, und es übersteht die Hitze." },
  'Tomato':        { en: "Cooked tomato has 2–3× more bioavailable lycopene than raw. Your marinara is more nutritious than a Caprese salad.", de: "Gekochte Tomaten haben 2–3× besser verfügbares Lycopin als rohe. Deine Marinara ist tatsächlich gesünder als ein Caprese-Salat." },
  'Mushroom':      { en: "Mushrooms are the only non-animal food that naturally makes vitamin D — and they produce even more if left gill-side up in sunlight for 15 minutes.", de: "Pilze sind das einzige pflanzliche Lebensmittel, das natürlich Vitamin D produziert — noch mehr, wenn man sie 15 Minuten in die Sonne legt." },
  'Red Cabbage':   { en: "Red cabbage has 10× more vitamin C than green cabbage. The red pigment, anthocyanin, doubles as one of the most potent antioxidants in your kitchen.", de: "Rotkohl hat 10× mehr Vitamin C als Weißkohl. Der rote Farbstoff Anthocyan ist gleichzeitig eines der stärksten Antioxidantien in deiner Küche." },
  'Carrot':        { en: "Carrots' beta-carotene is fat-soluble: eating them with any fat multiplies absorption. Your buttered carrots were the right call all along.", de: "Beta-Carotin in Möhren ist fettlöslich: Zusammen mit Fett wird die Aufnahme vervielfacht. Deine gebutterten Möhren waren goldrichtig." },
  'Avocado':       { en: "Avocado's fat isn't the enemy — it's the key. It helps your body absorb fat-soluble vitamins A, D, E and K from everything else on your plate.", de: "Das Fett der Avocado ist kein Feind — es ist der Schlüssel. Es hilft deinem Körper, die Vitamine A, D, E und K aus allem anderen auf dem Teller aufzunehmen." },
  'Blueberry':     { en: "Blueberries are one of the most antioxidant-dense foods on Earth. Their blue pigment, anthocyanin, is basically war paint for your cells.", de: "Blaubeeren gehören zu den antioxidantienreichsten Lebensmitteln der Welt. Ihr Blaupigment Anthocyan ist wie Schutzausrüstung für deine Zellen." },
  'Kiwi':          { en: "Kiwi has more vitamin C than an orange, ounce for ounce. It also contains actinidin — an enzyme that breaks down protein faster than your stomach can.", de: "Kiwi hat mehr Vitamin C als eine Orange — Gramm für Gramm. Außerdem enthält sie Actinidin, ein Enzym das Proteine schneller abbaut als dein Magen." },
  'Pomegranate':   { en: "Pomegranate contains punicalagin, an antioxidant found in almost no other food on Earth. Studies show it measurably lowers blood pressure in two weeks.", de: "Granatäpfel enthalten Punicalagin, ein Antioxidans das in fast keinem anderen Lebensmittel vorkommt. Studien zeigen: Zwei Wochen reichen, um den Blutdruck messbar zu senken." },
  'Watermelon':    { en: "Watermelon is 92% water but contains more lycopene than raw tomato. It's also one of the only fruits with citrulline, which relaxes blood vessels.", de: "Wassermelone besteht zu 92% aus Wasser, enthält aber mehr Lycopin als rohe Tomaten. Und sie ist eine der wenigen Früchte mit Citrullin, das Blutgefäße entspannt." },
  'Lemon':         { en: "Vitamin C deficiency (scurvy) killed more sailors than battle. Lemon fixed it. Your immune system is still running on the same ancient code.", de: "Vitamin-C-Mangel (Skorbut) tötete mehr Seeleute als Schlachten. Die Zitrone hat es geheilt. Dein Immunsystem läuft heute noch auf demselben Code." },
  'Chia Seeds':    { en: "Chia seeds have more omega-3 per gram than salmon. They were the original fuel of Aztec warriors — 'chia' literally means strength.", de: "Chiasamen haben mehr Omega-3 pro Gramm als Lachs. Sie waren der Originalbrennstoff aztekischer Krieger — 'Chia' bedeutet buchstäblich Stärke." },
  'Walnuts':       { en: "Walnuts look like tiny brains — and they might actually protect yours. They're the richest plant source of omega-3 and are linked to better memory.", de: "Walnüsse sehen aus wie winzige Gehirne. Zufall? Vielleicht. Aber sie sind die reichste pflanzliche Omega-3-Quelle und fördern nachweislich Gedächtnis und Konzentration." },
  'Brazil Nuts':   { en: "Just two Brazil nuts cover your entire daily selenium requirement. More than a handful and you're actually overdoing it — they're that potent.", de: "Zwei Paranüsse pro Tag decken deinen gesamten Tagesbedarf an Selen. Mehr als eine Handvoll — und du übertreibst es. So potent sind sie." },
  'Flaxseeds':     { en: "Flaxseeds are the richest plant source of omega-3 ALA. The catch: they must be ground — whole seeds pass straight through undigested.", de: "Leinsamen sind die reichste pflanzliche Omega-3-Quelle. Der Haken: Sie müssen gemahlen sein — ganze Samen passieren ungenutzt den Darm." },
  'Pumpkin Seeds': { en: "Pumpkin seeds are one of the best plant sources of zinc — essential for immune function, wound healing, and your sense of taste and smell.", de: "Kürbiskerne gehören zu den besten pflanzlichen Zinkquellen — essenziell für Immunfunktion, Wundheilung und deinen Geschmacks- und Geruchssinn." },
  'Almonds':       { en: "A small handful of almonds covers nearly half your daily vitamin E — an antioxidant that protects your cell membranes from oxidative damage.", de: "Eine kleine Handvoll Mandeln deckt fast die Hälfte deines täglichen Vitamin-E-Bedarfs — einem Antioxidans das deine Zellmembranen schützt." },
  'Lentils':       { en: "Lentils deliver more protein and fiber per calorie than almost any other plant food. And unlike most legumes, they don't need soaking.", de: "Linsen liefern mehr Protein und Ballaststoffe pro Kalorie als fast jedes andere pflanzliche Lebensmittel. Und sie brauchen — anders als die meisten Hülsenfrüchte — kein Einweichen." },
  'Chickpeas':     { en: "Chickpeas are loaded with resistant starch — your gut bacteria eat it, not you. Think of it as fertilizer for your microbiome.", de: "Kichererbsen stecken voller resistenter Stärke — deine Darmbakterien essen sie, nicht du. Denk daran als Dünger für dein Mikrobiom." },
  'Edamame':       { en: "Edamame is one of the only plant foods that's a complete protein, packing all 9 essential amino acids in a single pod.", de: "Edamame ist eines der wenigen pflanzlichen Lebensmittel mit vollständigem Protein — alle 9 essenziellen Aminosäuren in einer Schote." },
  'Parsley':       { en: "Parsley isn't just a garnish — it has more vitamin K per gram than almost any food. Two tablespoons cover your full daily requirement.", de: "Petersilie ist keine Dekoration — sie hat mehr Vitamin K pro Gramm als fast jedes Lebensmittel. Zwei Esslöffel decken deinen vollen Tagesbedarf." },
  'Ginger':        { en: "Ginger's compound gingerol is a clinically proven anti-nausea agent — more effective than some pharmaceuticals for morning sickness.", de: "Gingerol, der Wirkstoff im Ingwer, ist ein klinisch bewährtes Mittel gegen Übelkeit — bei Schwangerschaftsübelkeit wirksamer als manche Medikamente." },
  'Nori':          { en: "Nori is one of the only plant foods that naturally contains vitamin B12 — the one nutrient almost every vegan is told to supplement.", de: "Nori ist eines der wenigen pflanzlichen Lebensmittel, das natürlich Vitamin B12 enthält — den einen Nährstoff, den fast jeder Veganer supplementieren muss." },
  'Spirulina':     { en: "Spirulina is 60–70% protein by dry weight — more than steak. It's a blue-green algae that's been eaten since the Aztec empire.", de: "Spirulina besteht zu 60–70% aus Protein — mehr als Fleisch. Es ist eine blaugrüne Alge, die schon im Aztekenreich gegessen wurde." },
};

function renderSpotlight() {
  const card = document.getElementById('spotlightCard');
  if (!card) return;
  if (!getFoodFacts()) { card.hidden = true; return; }
  card.hidden = false;

  const { entries } = getData();
  const weekStart = getWeekStart(todayStr());
  const thisWeekFoods = [...new Set(
    entries.filter(e => e.date >= weekStart).map(e => e.vegetable)
  )].filter(f => FOOD_FACTS[f]).sort();

  if (thisWeekFoods.length === 0) {
    card.innerHTML = `
      <p class="spotlight-label" data-i18n="spotlight_heading">${t('spotlight_heading')}</p>
      <p class="empty" style="margin-top:10px">${t('spotlight_empty')}</p>`;
    return;
  }

  // Pick randomly on each render
  const food = thisWeekFoods[Math.floor(Math.random() * thisWeekFoods.length)];
  const fact = FOOD_FACTS[food][getLang()] ?? FOOD_FACTS[food].en;
  const cp   = FOOD_EMOJI[food];
  const imgSrc = cp ? getEmojiUrl(cp, getEmojiStyle()) : null;

  card.innerHTML = `
    <p class="spotlight-label">${t('spotlight_heading')}</p>
    <div class="spotlight-body">
      ${imgSrc ? `<div class="spotlight-emoji-wrap"><img src="${imgSrc}" alt="" width="52" height="52"></div>` : ''}
      <div class="spotlight-content">
        <p class="spotlight-food-name">${esc(tFood(food))}</p>
        <p class="spotlight-fact">${esc(fact)}</p>
      </div>
    </div>`;
}

function renderAll() {
  renderSpotlight();
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
  if (!document.getElementById('tab-gallery').hidden)   { renderWeeklyCards(); renderDailyCards(); }
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

// ── Portion settings ─────────────────────────────────────────────────────────

function renderPortionSettings() {
  const filterEl = document.getElementById('portionFilter');
  const filter = filterEl ? filterEl.value.trim().toLowerCase() : '';
  const portions = getPortions();
  const allFoods = FOODS.map(f => f.toLowerCase())
    .sort((a, b) => tFood(toTitleCase(a)).localeCompare(tFood(toTitleCase(b)), getLang()));

  const foods = filter
    ? allFoods.filter(f => tFood(toTitleCase(f)).toLowerCase().includes(filter) || f.includes(filter))
    : allFoods.filter(f => portions[f] != null);

  const list = document.getElementById('portionSettingsList');
  if (!list) return;

  if (foods.length === 0 && !filter) {
    list.innerHTML = `<p class="empty settings-portions-empty">${t('portions_none_custom')}</p>`;
    return;
  }
  if (foods.length === 0) {
    list.innerHTML = `<p class="empty settings-portions-empty">${t('portions_no_match')}</p>`;
    return;
  }

  list.innerHTML = foods.map(food => {
    const defaultG = NUTRITION_DATA[food]?.g ?? 100;
    const customG = portions[food];
    const currentG = customG ?? defaultG;
    const isCustom = customG != null && customG !== defaultG;
    const displayName = toTitleCase(food);
    return `<div class="portion-setting-row">
      <span class="portion-setting-name${isCustom ? ' portion-setting-name--custom' : ''}">${esc(tFood(displayName))}</span>
      <label class="portion-wrap${isCustom ? ' portion-wrap--custom' : ''}">
        <input type="number" class="settings-portion-input" data-food="${esc(food)}" data-default="${defaultG}" value="${currentG}" min="1" max="9999">
        <span class="portion-unit">g</span>
        ${isCustom ? `<button class="settings-portion-reset" data-food="${esc(food)}" title="${t('btn_reset')}">↺</button>` : ''}
      </label>
    </div>`;
  }).join('');

  list.querySelectorAll('.settings-portion-input').forEach(input => {
    input.addEventListener('change', () => {
      const g = Math.max(1, Math.round(+input.value));
      if (!isNaN(g)) {
        const defaultG = +input.dataset.default;
        if (g === defaultG) {
          const p = getPortions();
          delete p[input.dataset.food];
          localStorage.setItem(PORTION_KEY, JSON.stringify(p));
        } else {
          setPortion(input.dataset.food, g);
        }
        renderPortionSettings();
        if (!document.getElementById('tab-nutrition').hidden) renderNutritionTab(true);
      }
    });
  });

  list.querySelectorAll('.settings-portion-reset').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = getPortions();
      delete p[btn.dataset.food];
      localStorage.setItem(PORTION_KEY, JSON.stringify(p));
      renderPortionSettings();
      if (!document.getElementById('tab-nutrition').hidden) renderNutritionTab(true);
    });
  });
}

// ── Celebrations ─────────────────────────────────────────────────────────────

function launchConfetti(type) {
  const weekly = type === 'weekly';

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const W = canvas.width  = window.innerWidth;
  const H = canvas.height = window.innerHeight;

  const N        = weekly ? 170 : 55;
  const DURATION = weekly ? 4500 : 2400;
  const COLORS   = ['#40916c','#52b788','#74c69d','#b7e4c7','#f4a261','#e76f51','#e9c46a','#a8dadc'];

  const particles = Array.from({ length: N }, () => ({
    x:     Math.random() * W,
    y:     -10 - Math.random() * (weekly ? 120 : 60),
    vx:    (Math.random() - 0.5) * (weekly ? 6 : 3),
    vy:    1 + Math.random() * (weekly ? 4 : 2),
    w:     5 + Math.random() * (weekly ? 12 : 6),
    h:     3 + Math.random() * 4,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rot:   Math.random() * Math.PI * 2,
    rotV:  (Math.random() - 0.5) * 0.22,
    shape: Math.random() > 0.4 ? 'rect' : 'circle',
  }));

  const start = performance.now();
  function frame(now) {
    const elapsed = now - start;
    if (elapsed > DURATION) { canvas.remove(); return; }
    const alpha = elapsed > DURATION * 0.65
      ? 1 - (elapsed - DURATION * 0.65) / (DURATION * 0.35) : 1;
    ctx.clearRect(0, 0, W, H);
    for (const p of particles) {
      p.vy += 0.13; p.x += p.vx; p.y += p.vy; p.rot += p.rotV;
      if (p.y > H + 20) continue;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.shape === 'circle') {
        ctx.beginPath(); ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
      ctx.restore();
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  const toast = document.createElement('div');
  toast.className = `confetti-toast${weekly ? ' confetti-toast--weekly' : ''}`;
  const goal = weekly ? getGoal() : getDailyGoal();
  toast.innerHTML = `
    <span class="confetti-toast__emoji">${weekly ? '🎉' : '✅'}</span>
    <span class="confetti-toast__title">${t(weekly ? 'celebrate_weekly_title' : 'celebrate_daily_title')}</span>
    <span class="confetti-toast__sub">${t(weekly ? 'celebrate_weekly_sub' : 'celebrate_daily_sub', { n: goal })}</span>`;
  document.body.appendChild(toast);
  const outDelay = weekly ? 3600 : 1900;
  setTimeout(() => toast.classList.add('confetti-toast--out'), outDelay);
  setTimeout(() => toast.remove(), outDelay + 500);
}

// ── Init ──────────────────────────────────────────────────────────────────────

async function init() {
  await loadNutritionData();
  applyStaticTranslations();

  // Populate datalist for autocomplete (rebuilt on language change)
  const datalist = document.getElementById('veggie-list');
  function populateDatalist() {
    datalist.innerHTML = '';
    [...FOODS].sort((a, b) => tFood(a).localeCompare(tFood(b), getLang())).forEach(v => {
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

    // Snapshot counts before adding to detect goal crossings
    const ws = getWeekStart(todayStr());
    const we = addDays(ws, 6);
    const isCurrentWeek = date >= ws && date <= we;
    const isToday = date === todayStr();
    const snapEntries = getData().entries;
    const weeklyBefore = isCurrentWeek ? uniqueVeggies(entriesInRange(snapEntries, ws, we)).length : -1;
    const dailyBefore  = isToday       ? uniqueVeggies(snapEntries.filter(e => e.date === date)).length : -1;

    const result = addEntry(date, canonicalFood(veggie));
    if (result === 'duplicate') {
      msg.textContent = t('err_duplicate', { food: tFood(toTitleCase(canonicalFood(veggie))), date: fmtDate(date) });
      return;
    }
    msg.textContent = '';
    document.getElementById('veggieInput').value = '';

    // Detect and celebrate goal crossings
    const newEntries = getData().entries;
    let celebrated = false;
    if (isCurrentWeek) {
      const weeklyAfter = uniqueVeggies(entriesInRange(newEntries, ws, we)).length;
      if (weeklyBefore < getGoal() && weeklyAfter >= getGoal()) {
        launchConfetti('weekly');
        celebrated = true;
      }
    }
    if (!celebrated && isToday) {
      const dailyAfter = uniqueVeggies(newEntries.filter(e => e.date === date)).length;
      if (dailyBefore < getDailyGoal() && dailyAfter >= getDailyGoal()) {
        launchConfetti('daily');
      }
    }

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

  // Settings: food facts toggle (spotlight)
  const foodFactsToggle = document.getElementById('foodFactsToggle');
  foodFactsToggle.checked = getFoodFacts();
  foodFactsToggle.addEventListener('change', () => {
    const s = getSettings();
    s.foodFacts = foodFactsToggle.checked;
    saveSettings(s);
    renderSpotlight();
  });

  // Settings: nutrient facts toggle (nutrition tab)
  const funFactsToggle = document.getElementById('funFactsToggle');
  funFactsToggle.checked = getNutrientFacts();
  funFactsToggle.addEventListener('change', () => {
    const s = getSettings();
    s.nutrientFacts = funFactsToggle.checked;
    saveSettings(s);
    renderNutrientFacts();
  });

  // Initial render
  renderNutrientFacts();

  // Settings: animal food suggestions toggle
  const animalSuggestionsToggle = document.getElementById('animalSuggestionsToggle');
  animalSuggestionsToggle.checked = getAnimalSuggestions();
  animalSuggestionsToggle.addEventListener('change', () => {
    const s = getSettings();
    s.animalSuggestions = animalSuggestionsToggle.checked;
    saveSettings(s);
    if (!document.getElementById('tab-nutrition').hidden) renderNutritionTab(true);
  });

  // Settings: seasonal country select
  const seasonalCountrySelect = document.getElementById('seasonalCountrySelect');
  seasonalCountrySelect.value = getSeasonalCountry();
  seasonalCountrySelect.addEventListener('change', () => {
    const s = getSettings();
    s.seasonalCountry = seasonalCountrySelect.value;
    saveSettings(s);
    if (!document.getElementById('tab-nutrition').hidden) renderNutritionTab(true);
  });

  // Settings: advanced portions toggle
  const advancedPortionsToggle = document.getElementById('advancedPortionsToggle');
  advancedPortionsToggle.checked = getAdvancedPortions();
  advancedPortionsToggle.addEventListener('change', () => {
    const s = getSettings();
    s.advancedPortions = advancedPortionsToggle.checked;
    saveSettings(s);
    if (!document.getElementById('tab-nutrition').hidden) renderNutritionTab(true);
  });

  // Settings: portion filter
  document.getElementById('portionFilter').addEventListener('input', renderPortionSettings);
  renderPortionSettings();

  // Settings: emoji style
  const emojiStyleSelect = document.getElementById('emojiStyleSelect');
  emojiStyleSelect.value = getEmojiStyle();
  renderEmojiPreview(getEmojiStyle());
  emojiStyleSelect.addEventListener('change', () => {
    const s = getSettings();
    s.emojiStyle = emojiStyleSelect.value;
    saveSettings(s);
    renderEmojiPreview(emojiStyleSelect.value);
    // Force redraw of gallery cards with new style
    document.querySelectorAll('.day-card[data-seed]').forEach(el => el.dataset.seed = '');
    if (!document.getElementById('tab-gallery').hidden) { renderWeeklyCards(); renderDailyCards(); }
  });

  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => { p.hidden = true; });
      btn.classList.add('active');
      const pane = document.getElementById('tab-' + btn.dataset.tab);
      pane.hidden = false;
      if (btn.dataset.tab === 'nutrition') { renderNutritionTab(); renderNutrientFacts(); }
      if (btn.dataset.tab === 'gallery')   { renderWeeklyCards(); renderDailyCards(); }
      if (btn.dataset.tab === 'settings') {
        goalInput.value = getGoal();
        dailyGoalInput.value = getDailyGoal();
        emojiStyleSelect.value = getEmojiStyle();
        renderEmojiPreview(getEmojiStyle());
        foodFactsToggle.checked = getFoodFacts();
        funFactsToggle.checked = getNutrientFacts();
        animalSuggestionsToggle.checked = getAnimalSuggestions();
        seasonalCountrySelect.value = getSeasonalCountry();
        advancedPortionsToggle.checked = getAdvancedPortions();
        renderPortionSettings();
      }
    });
  });

  initCardModal();
  renderAll();
}

document.addEventListener('DOMContentLoaded', init);
