'use strict';

const NUTRITION_CACHE_KEY = 'veggie-nutrition-v1';
const NUTRITION_CACHE_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days

// Displayed columns — values are per portion (scaled from per-100g data)
const NUTRIENT_DEFS = [
  { key: 'kcal',      label: 'Calories',  unit: 'kcal' },
  { key: 'protein',   label: 'Protein',   unit: 'g' },
  { key: 'fibre',     label: 'Fibre',     unit: 'g' },
  { key: 'vitc',      label: 'Vitamin C', unit: 'mg' },
  { key: 'iron',      label: 'Iron',      unit: 'mg' },
  { key: 'calcium',   label: 'Calcium',   unit: 'mg' },
  { key: 'potassium', label: 'Potassium', unit: 'mg' },
];

// Map Open Food Facts nutriment keys → our internal keys
const OFF_KEY_MAP = {
  'energy-kcal_100g': 'kcal',
  'proteins_100g':    'protein',
  'fiber_100g':       'fibre',
  'vitamin-c_100g':   'vitc',
  'iron_100g':        'iron',
  'calcium_100g':     'calcium',
  'potassium_100g':   'potassium',
};

function getNutritionCache() {
  try { return JSON.parse(localStorage.getItem(NUTRITION_CACHE_KEY) || '{}'); }
  catch { return {}; }
}

function setNutritionCache(data) {
  localStorage.setItem(NUTRITION_CACHE_KEY, JSON.stringify(data));
}

function scaleToPortionSize(data100g, portionG) {
  const factor = portionG / 100;
  const result = { g: portionG, fetched: data100g.fetched ?? Date.now(), source: data100g.source ?? 'static' };
  for (const { key } of NUTRIENT_DEFS) {
    result[key] = data100g[key] != null ? +(data100g[key] * factor).toFixed(1) : null;
  }
  return result;
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

    // Pick product with most of our target nutrients present
    const best = data.products
      .filter(p => p.nutriments)
      .map(p => ({
        p,
        score: Object.keys(OFF_KEY_MAP).filter(k => p.nutriments[k] != null && p.nutriments[k] !== '').length,
      }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)[0];

    if (!best) return null;

    const n = best.p.nutriments;
    const raw = { source: best.p.product_name, fetched: Date.now() };
    for (const [offKey, ourKey] of Object.entries(OFF_KEY_MAP)) {
      const val = n[offKey];
      raw[ourKey] = (val != null && val !== '') ? +val : null;
    }
    // Default portion: 100g for unknown foods from API
    return scaleToPortionSize(raw, 100);
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchNutrition(food) {
  // 1. Try static data first — always wins for known foods
  const staticResult = lookupStatic(food);
  if (staticResult) return staticResult;

  // 2. Check API cache
  const cache = getNutritionCache();
  const cacheKey = food.toLowerCase();
  const cached = cache[cacheKey];
  if (cached && (Date.now() - cached.fetched) < NUTRITION_CACHE_TTL) return cached;

  // 3. Fetch from Open Food Facts
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
