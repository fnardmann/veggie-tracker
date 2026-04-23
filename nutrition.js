'use strict';

let NUTRITION_DATA = {};

async function loadNutritionData() {
  try {
    const r = await fetch('./nutrition-data.json');
    NUTRITION_DATA = await r.json();
  } catch {
    NUTRITION_DATA = {};
  }
}

const NUTRITION_CACHE_KEY = 'veggie-nutrition-v1';
const NUTRITION_CACHE_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days

// Single source of truth for every tracked nutrient.
// - dailyRef: DV used in "% of daily goal" facts (µg/mg per day)
// - weeklyRef: target for the weekly progress bar (defaults to dailyRef × 7)
// - requiresAnimal: excluded from plant-only suggestions; plant total always 0
const NUTRIENT_DEFS = [
  { key: 'fibre',     label: 'Fibre',     unit: 'g',  dailyRef: 30 },
  { key: 'vita',      label: 'Vitamin A', unit: 'µg', dailyRef: 800 },
  { key: 'b1',        label: 'B1',        unit: 'mg', dailyRef: 1.2 },
  { key: 'b2',        label: 'B2',        unit: 'mg', dailyRef: 1.4 },
  { key: 'b3',        label: 'B3',        unit: 'mg', dailyRef: 16 },
  { key: 'b5',        label: 'B5',        unit: 'mg', dailyRef: 5 },
  { key: 'b6',        label: 'B6',        unit: 'mg', dailyRef: 1.4 },
  { key: 'b9',        label: 'Folate',    unit: 'µg', dailyRef: 400 },
  { key: 'vitc',      label: 'Vitamin C', unit: 'mg', dailyRef: 75 },
  { key: 'vitd',      label: 'Vitamin D', unit: 'µg', dailyRef: 20 },
  { key: 'vite',      label: 'Vitamin E', unit: 'mg', dailyRef: 13 },
  { key: 'vitk',      label: 'Vitamin K', unit: 'µg', dailyRef: 80 },
  { key: 'iron',      label: 'Iron',      unit: 'mg', dailyRef: 9 },
  { key: 'calcium',   label: 'Calcium',   unit: 'mg', dailyRef: 1000 },
  { key: 'magnesium', label: 'Magnesium', unit: 'mg', dailyRef: 350 },
  { key: 'potassium', label: 'Potassium', unit: 'mg', dailyRef: 3500 },
  { key: 'zinc',      label: 'Zinc',      unit: 'mg', dailyRef: 10 },
  { key: 'selenium',  label: 'Selenium',  unit: 'µg', dailyRef: 55 },
  // Plant-only suggestions skip b12; animal tracking uses the explicit weeklyRef (14 µg/day).
  { key: 'b12',       label: 'B12',       unit: 'µg', dailyRef: 2.5, weeklyRef: 98, requiresAnimal: true },
];

// Derived lookups. Kept as objects for fast `ref[key]` access at render time.
const NUTRIENT_DAILY_REF = Object.fromEntries(
  NUTRIENT_DEFS.map(d => [d.key, { val: d.dailyRef, unit: d.unit }])
);
const NUTRIENT_WEEKLY_REF = Object.fromEntries(
  NUTRIENT_DEFS.filter(d => !d.requiresAnimal).map(d => [d.key, d.weeklyRef ?? d.dailyRef * 7])
);
const ANIMAL_WEEKLY_REF = Object.fromEntries(
  NUTRIENT_DEFS.map(d => [d.key, d.weeklyRef ?? d.dailyRef * 7])
);

// Open Food Facts nutriment keys → our internal keys (fallback for unknown foods)
const OFF_KEY_MAP = {
  'fiber_100g':              'fibre',
  'vitamin-a_100g':          'vita',
  'vitamin-b1_100g':         'b1',
  'vitamin-b2_100g':         'b2',
  'vitamin-pp_100g':         'b3',
  'pantothenic-acid_100g':   'b5',
  'vitamin-b6_100g':         'b6',
  'folates_100g':            'b9',
  'vitamin-c_100g':          'vitc',
  'vitamin-d_100g':          'vitd',
  'vitamin-e_100g':          'vite',
  'vitamin-k_100g':          'vitk',
  'iron_100g':               'iron',
  'calcium_100g':            'calcium',
  'magnesium_100g':          'magnesium',
  'potassium_100g':          'potassium',
  'zinc_100g':               'zinc',
  'selenium_100g':           'selenium',
  'vitamin-b12_100g':        'b12',
};

function getNutritionCache() {
  try { return JSON.parse(localStorage.getItem(NUTRITION_CACHE_KEY) || '{}'); }
  catch { return {}; }
}

function setNutritionCache(data) {
  localStorage.setItem(NUTRITION_CACHE_KEY, JSON.stringify(data));
}

function scoreProduct(nutriments) {
  return Object.keys(OFF_KEY_MAP).filter(k => nutriments[k] != null && nutriments[k] !== '').length;
}

function scaleToPortionSize(data100g, portionG) {
  const factor = portionG / 100;
  const result = { g: portionG, fetched: data100g.fetched ?? Date.now(), source: data100g.source ?? 'static', _per100g: {} };
  for (const { key } of NUTRIENT_DEFS) {
    const val = data100g[key] != null ? data100g[key] : null;
    result._per100g[key] = val;
    result[key] = val != null ? +(val * factor).toFixed(1) : null;
  }
  return result;
}

function rescaleNutrition(nutrition, newG) {
  const factor = newG / 100;
  const scaled = { ...nutrition, g: newG };
  for (const { key } of NUTRIENT_DEFS) {
    const val = nutrition._per100g?.[key];
    scaled[key] = val != null ? +(val * factor).toFixed(1) : null;
  }
  return scaled;
}

function lookupStatic(food) {
  const entry = NUTRITION_DATA[food.toLowerCase()];
  if (!entry) return null;
  return scaleToPortionSize({ ...entry, fetched: Date.now() }, entry.g);
}

async function fetchNutritionFromAPI(food) {
  const query = encodeURIComponent(food);
  const fields = 'product_name,nutriments';
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${query}&action=process&json=1&page_size=20&fields=${fields}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.products?.length) return null;

    const best = data.products
      .filter(p => p.nutriments)
      .map(p => ({ p, score: scoreProduct(p.nutriments) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)[0];

    if (!best) return null;

    const n = best.p.nutriments;
    const raw = { source: best.p.product_name, fetched: Date.now() };
    for (const [offKey, ourKey] of Object.entries(OFF_KEY_MAP)) {
      const val = n[offKey];
      raw[ourKey] = (val != null && val !== '') ? +val : null;
    }
    return scaleToPortionSize(raw, 100);
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchNutrition(food) {
  const staticResult = lookupStatic(food);
  if (staticResult) return staticResult;

  const cache = getNutritionCache();
  const cacheKey = food.toLowerCase();
  const cached = cache[cacheKey];
  if (cached && (Date.now() - cached.fetched) < NUTRITION_CACHE_TTL) return cached;

  try {
    const result = await fetchNutritionFromAPI(food);
    if (result) {
      cache[cacheKey] = result;
      setNutritionCache(cache);
    }
    return result ?? cached ?? null;
  } catch {
    return cached ?? null;
  }
}

async function fetchNutritionForAll(foods) {
  return Promise.all(
    foods.map(v => fetchNutrition(v).then(nutrition => ({ vegetable: v, nutrition })))
  );
}
