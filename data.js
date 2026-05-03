'use strict';

// Storage layer: every read/write to localStorage lives here so the rest of the
// app can treat entries / settings / animal counts / portions as plain data.

const STORAGE_KEY = 'veggie-tracker-v1';
const SETTINGS_KEY = 'veggie-settings-v1';
const PORTION_KEY = 'veggie-portions-v1';
const TROPHY_KEY = 'veggie-trophies-v1';

const DEFAULT_GOAL = 30;
const DEFAULT_DAILY_GOAL = 5;

// ── Settings ─────────────────────────────────────────────────────────────────

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
function getExcludedFoods()    { return getSettings().excludedFoods    ?? []; }
function setExcludedFoods(arr) { const s = getSettings(); s.excludedFoods = arr; saveSettings(s); }

// ── Plant entries ────────────────────────────────────────────────────────────

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

// ── Animal entries (count per food per day; tracked from suggestions only) ───

function getAnimalCounts() {
  return getData().animalCounts ?? {};
}

function incAnimal(date, food) {
  const data = getData();
  data.animalCounts ??= {};
  data.animalCounts[date] ??= {};
  data.animalCounts[date][food] = (data.animalCounts[date][food] ?? 0) + 1;
  saveData(data);
}

function decAnimal(date, food) {
  const data = getData();
  const day = data.animalCounts?.[date];
  if (!day?.[food]) return;
  day[food] -= 1;
  if (day[food] <= 0) delete day[food];
  if (Object.keys(day).length === 0) delete data.animalCounts[date];
  saveData(data);
}

function weeklyAnimalTotals() {
  const ac = getAnimalCounts();
  const ws = getWeekStart(todayStr());
  const we = addDays(ws, 6);
  const totals = {};
  for (const [date, counts] of Object.entries(ac)) {
    if (date < ws || date > we) continue;
    for (const [food, n] of Object.entries(counts)) {
      totals[food] = (totals[food] ?? 0) + n;
    }
  }
  return totals;
}

// ── Portion overrides ────────────────────────────────────────────────────────

function getPortions() {
  try { return JSON.parse(localStorage.getItem(PORTION_KEY) || '{}'); } catch { return {}; }
}
function setPortion(food, grams) {
  const p = getPortions();
  p[food.toLowerCase()] = grams;
  localStorage.setItem(PORTION_KEY, JSON.stringify(p));
}

// ── Generic helpers used by data writers ─────────────────────────────────────

function toTitleCase(str) {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

// ── Trophies ─────────────────────────────────────────────────────────────────

function getEarnedTrophies() {
  try { return JSON.parse(localStorage.getItem(TROPHY_KEY) || '[]'); } catch { return []; }
}

function saveEarnedTrophies(earned) {
  localStorage.setItem(TROPHY_KEY, JSON.stringify(earned));
}
