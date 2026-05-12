'use strict';

// Storage, settings, entries, animal counts and portions live in data.js.

const FOODS = [
  // Vegetables
  'Artichoke', 'Asparagus', 'Aubergine', 'Avocado',
  'Bamboo Shoots', 'Bean Sprouts', 'Beetroot', 'Bell Pepper', 'Bitter Melon',
  'Broccoli', 'Brussels Sprouts', 'Butternut Squash', 'Cabbage',
  'Carrot', 'Cauliflower', 'Celeriac', 'Celery',
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
  'White Cabbage', 'Yam',
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
  'Olives',
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

// ── Trophy definitions ─────────────────────────────────────────────────────────

const TROPHY_DEFS = [
  // Daily streak trophies
  { id: 'streak_3',    icon: '🔥', type: 'daily_streak', threshold: 3,   category: 'streak' },
  { id: 'streak_7',    icon: '🔥', type: 'daily_streak', threshold: 7,   category: 'streak' },
  { id: 'streak_14',   icon: '🔥', type: 'daily_streak', threshold: 14,  category: 'streak' },
  { id: 'streak_30',   icon: '🔥', type: 'daily_streak', threshold: 30,  category: 'streak' },
  { id: 'streak_60',   icon: '🔥', type: 'daily_streak', threshold: 60,  category: 'streak' },
  { id: 'streak_100',  icon: '🔥', type: 'daily_streak', threshold: 100, category: 'streak' },
  { id: 'streak_200',  icon: '🔥', type: 'daily_streak', threshold: 200, category: 'streak' },
  { id: 'streak_365',  icon: '🔥', type: 'daily_streak', threshold: 365, category: 'streak' },
  // Weekly streak trophies
  { id: 'wstreak_2',   icon: '📅', type: 'weekly_streak', threshold: 2,   category: 'streak' },
  { id: 'wstreak_4',   icon: '📅', type: 'weekly_streak', threshold: 4,   category: 'streak' },
  { id: 'wstreak_8',   icon: '📅', type: 'weekly_streak', threshold: 8,   category: 'streak' },
  { id: 'wstreak_12',  icon: '📅', type: 'weekly_streak', threshold: 12,  category: 'streak' },
  { id: 'wstreak_26',  icon: '📅', type: 'weekly_streak', threshold: 26,  category: 'streak' },
  { id: 'wstreak_52',  icon: '📅', type: 'weekly_streak', threshold: 52,  category: 'streak' },
  { id: 'wstreak_104', icon: '📅', type: 'weekly_streak', threshold: 104, category: 'streak' },
  { id: 'wstreak_156', icon: '📅', type: 'weekly_streak', threshold: 156, category: 'streak' },
  // Total plants logged
  { id: 'total_10',   icon: '🌱', type: 'total_plants', threshold: 10,   category: 'total' },
  { id: 'total_30',   icon: '🌱', type: 'total_plants', threshold: 30,   category: 'total' },
  { id: 'total_50',   icon: '🌱', type: 'total_plants', threshold: 50,   category: 'total' },
  { id: 'total_100',  icon: '🌱', type: 'total_plants', threshold: 100,  category: 'total' },
  { id: 'total_200',  icon: '🌱', type: 'total_plants', threshold: 200,  category: 'total' },
  { id: 'total_365',  icon: '🌱', type: 'total_plants', threshold: 365,  category: 'total' },
  { id: 'total_500',  icon: '🌱', type: 'total_plants', threshold: 500,  category: 'total' },
  { id: 'total_750',  icon: '🌱', type: 'total_plants', threshold: 750,  category: 'total' },
  { id: 'total_1000', icon: '🌱', type: 'total_plants', threshold: 1000, category: 'total' },
  // Unique plants tried
  { id: 'unique_5',   icon: '✨', type: 'unique_plants', threshold: 5,    category: 'variety' },
  { id: 'unique_10',  icon: '✨', type: 'unique_plants', threshold: 10,   category: 'variety' },
  { id: 'unique_20',  icon: '✨', type: 'unique_plants', threshold: 20,   category: 'variety' },
  { id: 'unique_30',  icon: '✨', type: 'unique_plants', threshold: 30,   category: 'variety' },
  { id: 'unique_50',  icon: '✨', type: 'unique_plants', threshold: 50,   category: 'variety' },
  { id: 'unique_75',  icon: '✨', type: 'unique_plants', threshold: 75,   category: 'variety' },
  { id: 'unique_100', icon: '✨', type: 'unique_plants', threshold: 100, category: 'variety' },
  // Weekly goal met
  { id: 'weekly_goal_1',   icon: '🎯', type: 'weekly_goals_met', threshold: 1,   category: 'milestone' },
  { id: 'weekly_goal_5',   icon: '🎯', type: 'weekly_goals_met', threshold: 5,   category: 'milestone' },
  { id: 'weekly_goal_10',  icon: '🎯', type: 'weekly_goals_met', threshold: 10,  category: 'milestone' },
  { id: 'weekly_goal_25',  icon: '🎯', type: 'weekly_goals_met', threshold: 25,  category: 'milestone' },
  { id: 'weekly_goal_52',  icon: '🎯', type: 'weekly_goals_met', threshold: 52,  category: 'milestone' },
  { id: 'weekly_goal_100', icon: '🎯', type: 'weekly_goals_met', threshold: 100, category: 'milestone' },
  { id: 'weekly_goal_156', icon: '🎯', type: 'weekly_goals_met', threshold: 156, category: 'milestone' },
  // Per-food best streak
  { id: 'best_streak_7',   icon: '🏆', type: 'best_food_streak', threshold: 7,   category: 'streak' },
  { id: 'best_streak_14',  icon: '🏆', type: 'best_food_streak', threshold: 14,  category: 'streak' },
  { id: 'best_streak_30',  icon: '🏆', type: 'best_food_streak', threshold: 30,  category: 'streak' },
  { id: 'best_streak_60',  icon: '🏆', type: 'best_food_streak', threshold: 60,  category: 'streak' },
  { id: 'best_streak_90',  icon: '🏆', type: 'best_food_streak', threshold: 90,  category: 'streak' },
];

function checkTrophies() {
  const { entries } = getData();
  const earned = getEarnedTrophies();
  const newlyEarned = [];

  function unlock(id) {
    if (!earned.includes(id)) {
      earned.push(id);
      newlyEarned.push(id);
    }
  }

  // Daily streak
  const ds = dailyStreak();
  TROPHY_DEFS.filter(t => t.type === 'daily_streak').forEach(t => {
    if (ds >= t.threshold) unlock(t.id);
  });

  // Weekly streak
  const ws = weeklyGoalStreak();
  TROPHY_DEFS.filter(t => t.type === 'weekly_streak').forEach(t => {
    if (ws >= t.threshold) unlock(t.id);
  });

  // Total plants logged
  const totalEntries = entries.length;
  TROPHY_DEFS.filter(t => t.type === 'total_plants').forEach(t => {
    if (totalEntries >= t.threshold) unlock(t.id);
  });

  // Unique plants
  const uniqueCount = uniqueVeggies(entries).length;
  TROPHY_DEFS.filter(t => t.type === 'unique_plants').forEach(t => {
    if (uniqueCount >= t.threshold) unlock(t.id);
  });

  // Weekly goals met (count how many weeks the goal was met)
  const weekCount = countWeeklyGoalMet();
  TROPHY_DEFS.filter(t => t.type === 'weekly_goals_met').forEach(t => {
    if (weekCount >= t.threshold) unlock(t.id);
  });

  // Best per-food streak
  const bestStreak = Math.max(0, ...veggieStreaks().map(s => s.streak));
  TROPHY_DEFS.filter(t => t.type === 'best_food_streak').forEach(t => {
    if (bestStreak >= t.threshold) unlock(t.id);
  });

  if (newlyEarned.length > 0) {
    saveEarnedTrophies(earned);
  }

  return newlyEarned;
}

function countWeeklyGoalMet() {
  const { entries } = getData();
  if (entries.length === 0) return 0;
  const weeks = new Set(entries.map(e => getWeekStart(e.date)));
  let count = 0;
  for (const ws of weeks) {
    const we = addDays(ws, 6);
    if (uniqueVeggies(entriesInRange(entries, ws, we)).length >= getGoal()) count++;
  }
  return count;
}

function renderTrophies() {
  const earned = getEarnedTrophies();
  const grid = document.getElementById('trophiesGrid');
  if (!grid) return;

  const CATS = ['streak', 'total', 'variety', 'milestone'];
  const shown = [];
  for (const cat of CATS) {
    const catDefs = TROPHY_DEFS.filter(t => t.category === cat);
    const earnedInCat = catDefs.filter(t => earned.includes(t.id));
    if (earnedInCat.length > 0) {
      shown.push(earnedInCat[earnedInCat.length - 1]);
      const nextIdx = catDefs.indexOf(earnedInCat[earnedInCat.length - 1]) + 1;
      if (nextIdx < catDefs.length) shown.push(catDefs[nextIdx]);
    } else {
      shown.push(catDefs[0]);
    }
  }

  try {
    const items = shown.map(trophy => {
      const isEarned = earned.includes(trophy.id);
      const progress = getTrophyProgress(trophy);
      const percent = Math.min(100, Math.round((progress / trophy.threshold) * 100));
      const icon = isEarned ? trophy.icon : '🔒';
      const name = t('trophy_' + trophy.id);
      const desc = t('trophy_' + trophy.id + '_desc');
      let status;
      if (isEarned) {
        status = '<div class="trophy-earned-label">' + esc(t('trophy_earned')) + '</div>';
      } else {
        status = '<div class="trophy-progress-wrapper">' +
          '<div class="trophy-progress-bar"><div class="trophy-progress-bar-fill" style="width:' + percent + '%"></div></div>' +
          '<div class="trophy-progress-text">' + progress + ' / ' + trophy.threshold + '</div>' +
          '</div>';
      }
      return '<div class="trophy-item' + (isEarned ? ' trophy-item--earned' : ' trophy-item--locked') + '" data-id="' + esc(trophy.id) + '">' +
        '<div class="trophy-icon">' + icon + '</div>' +
        '<div class="trophy-name">' + esc(name) + '</div>' +
        '<div class="trophy-desc">' + esc(desc) + '</div>' +
        status +
        '</div>';
    });
    grid.innerHTML = items.join('');
  } catch (e) {
    console.error('renderTrophies error:', e);
    grid.innerHTML = '<p>Error loading trophies: ' + esc(String(e)) + '</p>';
  }
}

function getTrophyProgress(trophy) {
  const { entries } = getData();
  switch (trophy.type) {
    case 'daily_streak':       return dailyStreak();
    case 'weekly_streak':       return weeklyGoalStreak();
    case 'total_plants':        return entries.length;
    case 'unique_plants':        return uniqueVeggies(entries).length;
    case 'weekly_goals_met':    return countWeeklyGoalMet();
    case 'best_food_streak':    return Math.max(0, ...veggieStreaks().map(s => s.streak));
    default: return 0;
  }
}

// ── Plant statistics ───────────────────────────────────────────────────────────

function renderPlantStats() {
  const container = document.getElementById('plantStatsList');
  if (!container) return;
  const { entries } = getData();
  if (entries.length === 0) {
    container.innerHTML = `<p class="empty">${t('no_plants_yet')}</p>`;
    return;
  }

  const stats = [...veggieStreaks()].sort((a, b) => b.total - a.total || b.streak - a.streak);
  container.innerHTML = stats.map(s => {
    const food = s.name;
    const detail = computeVeggieDetail(food);
    if (!detail) return '';
    const cp = FOOD_EMOJI[food];
    const emojiChar = cp ? String.fromCodePoint(parseInt(cp, 16)) : '';
    return `
      <div class="plant-stat-row" data-food="${esc(food)}">
        <div class="plant-stat-header">
          <span class="plant-stat-emoji">${emojiChar}</span>
          <span class="plant-stat-name">${esc(tFood(food))}</span>
          <span class="plant-stat-meta">
            <span class="plant-stat-total">${detail.total}×</span>
            <span class="plant-stat-streak">🔥 ${s.streak}</span>
          </span>
        </div>
        <div class="plant-stat-detail">
          <div class="plant-stat-cell">
            <div class="plant-stat-val">${t(detail.maxStreak === 1 ? 'streak_day' : 'streak_days', { n: detail.maxStreak })}</div>
            <div class="plant-stat-lbl">${t('streak_best')}</div>
          </div>
          <div class="plant-stat-cell">
            <div class="plant-stat-val">${detail.avgPerWeek}×</div>
            <div class="plant-stat-lbl">${t('streak_avg_week')}</div>
          </div>
        </div>
      </div>`;
  }).join('');
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
    // Streak is counted if the vegetable was eaten today or yesterday;
    // flame is "active" only when eaten today (otherwise it's at risk)
    if (last === today || last === yesterday) {
      let d = last;
      while (dates.has(d)) { streak++; d = addDays(d, -1); }
    }
    const active = last === today;
    return { name, streak, last, total: dates.size, active };
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
const CHART_COLORS = [
  '#40916c', '#e76f51', '#2a9d8f', '#f4a261', '#6a4c93',
  '#1d3557', '#c77dff', '#06d6a0', '#ef476f', '#ffd166',
];

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
  const long = allStreaks.filter(s => s.streak >= 3);
  const streaks = long.length >= 6
    ? long.slice(0, 6)
    : [...long, ...allStreaks.filter(s => s.streak < 3)].slice(0, 6);
  const container = document.getElementById('veggieStreaks');

  if (streaks.length === 0) {
    container.innerHTML = `<p class="empty">${t('no_streaks_yet')}</p>`;
    return;
  }

  const tier = n => n >= 7 ? 'hot' : n >= 3 ? 'warm' : '';

  container.innerHTML = streaks.map(s => {
    const t_ = s.active ? tier(s.streak) : '';
    const streakLabel = `🔥 ${t(s.streak === 1 ? 'streak_day' : 'streak_days', { n: s.streak })}`;
    const streakCls = s.active ? 'vs-streak' : 'vs-streak vs-streak--inactive';
    return `
      <div class="vs-row${t_ ? ' vs-row--' + t_ : ''}${s.active ? '' : ' vs-row--inactive'}" data-food="${esc(s.name)}">
        <div class="vs-row-main">
          <span class="vs-name">${esc(tFood(s.name))}</span>
          <span class="vs-meta">
            <span class="vs-total">${s.total} ${t('col_total').toLowerCase()}</span>
            <span class="${streakCls}">${streakLabel}</span>
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
  renderHeatmap();
  renderStreaks();
  renderHistory();
  // Tab-specific renders: only run when that tab is visible
  if (!document.getElementById('tab-nutrition').hidden) renderNutritionTab();
  renderNutrientFacts();
  if (!document.getElementById('tab-gallery').hidden)   { renderWeeklyCards(); renderDailyCards(); }
  if (!document.getElementById('tab-trophies').hidden)  { checkTrophies(); renderTrophies(); renderPlantStats(); }
}

// ── Export / Import ───────────────────────────────────────────────────────────

function exportData() {
  const payload = { ...getData(), portions: getPortions(), settings: getSettings() };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
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
      if (imported.animalCounts && typeof imported.animalCounts === 'object') {
        current.animalCounts ??= {};
        for (const [date, counts] of Object.entries(imported.animalCounts)) {
          current.animalCounts[date] ??= {};
          for (const [food, n] of Object.entries(counts)) {
            current.animalCounts[date][food] = Math.max(current.animalCounts[date][food] ?? 0, n);
          }
        }
      }
      saveData(current);
      if (imported.portions && typeof imported.portions === 'object') {
        const merged = { ...getPortions(), ...imported.portions };
        localStorage.setItem(PORTION_KEY, JSON.stringify(merged));
      }
      if (imported.settings && typeof imported.settings === 'object') {
        const merged = { ...getSettings(), ...imported.settings };
        saveSettings(merged);
      }
      renderAll();
    } catch {
      alert(t('err_import_failed'));
    }
  };
  reader.readAsText(file);
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

  // Nutrient trend pills
  function buildTrendPills() {
    const container = document.getElementById('trendVitaminPills');
    if (!container) return;
    const selected = getTrendVitamins();
    container.innerHTML = '';
    NUTRIENT_DEFS.forEach(({ key }, i) => {
      const isSelected = selected.includes(key);
      const color = CHART_COLORS[i % CHART_COLORS.length];
      const pill = document.createElement('label');
      pill.className = 'trend-vitamin-pill' + (isSelected ? ' selected' : '');
      pill.innerHTML = `<span class="pill-dot" style="background:${isSelected ? '#fff' : color}"></span>${t('nutrient_' + key)}`;
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.value = key;
      cb.checked = isSelected;
      cb.addEventListener('change', () => {
        const cur = getTrendVitamins();
        const updated = cb.checked
          ? [...cur, key]
          : cur.filter(k => k !== key);
        setTrendVitamins(updated);
        buildTrendPills();
        renderNutrientTrend();
      });
      pill.insertBefore(cb, pill.firstChild);
      container.appendChild(pill);
    });
  }
  buildTrendPills();

  // Language select
  const langSelect = document.getElementById('langSelect');
  langSelect.value = getLang();
  langSelect.addEventListener('change', () => {
    setLang(langSelect.value);
    applyStaticTranslations();
    populateDatalist();
    buildTrendPills();
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

  // Nutrition tab: food database
  document.getElementById('foodDbFilter').addEventListener('input', renderFoodDatabase);

  // Settings: excluded foods
  const excludedInput = document.getElementById('excludedFoodInput');
  const excludedDatalist = document.getElementById('excluded-food-list');
  const allExcludableNames = [...FOODS, ...ANIMAL_FOODS.map(f => f.name)];
  excludedDatalist.innerHTML = allExcludableNames.map(f => `<option value="${esc(tFood(f))}">`).join('');
  document.getElementById('excludedFoodAdd').addEventListener('click', () => {
    const val = excludedInput.value.trim();
    if (!val) return;
    const canonical = canonicalFood(val);
    const current = getExcludedFoods();
    if (!current.some(f => f.toLowerCase() === canonical.toLowerCase())) {
      setExcludedFoods([...current, canonical]);
      renderExcludedFoods();
      if (!document.getElementById('tab-nutrition').hidden) renderNutritionTab(true);
    }
    excludedInput.value = '';
  });
  excludedInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('excludedFoodAdd').click();
  });
  renderExcludedFoods();

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
      if (btn.dataset.tab === 'nutrition') { _weekOffset = 0; renderNutritionTab(); renderNutrientFacts(); }
      if (btn.dataset.tab === 'gallery')   { renderWeeklyCards(); renderDailyCards(); }
      if (btn.dataset.tab === 'trophies')  { checkTrophies(); renderTrophies(); renderPlantStats(); }
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

  // Gear icon → open settings
  document.getElementById('settingsGear')?.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => { p.hidden = true; });
    document.querySelector('[data-tab="settings"]')?.classList.add('active');
    const pane = document.getElementById('tab-settings');
    if (pane) pane.hidden = false;
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
  });

  initCardModal();
  renderAll();
}

document.addEventListener('DOMContentLoaded', init);
