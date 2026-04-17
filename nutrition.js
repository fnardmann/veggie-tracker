'use strict';

const NUTRITION_CACHE_KEY = 'veggie-nutrition-v1';
const NUTRITION_CACHE_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days

const NUTRIENT_DEFS = [
  { key: 'fibre',   label: 'Fibre',      unit: 'g'  },
  { key: 'vita',    label: 'Vitamin A',  unit: 'µg' },
  { key: 'b1',      label: 'B1',         unit: 'mg' },
  { key: 'b2',      label: 'B2',         unit: 'mg' },
  { key: 'b3',      label: 'B3',         unit: 'mg' },
  { key: 'b5',      label: 'B5',         unit: 'mg' },
  { key: 'b6',      label: 'B6',         unit: 'mg' },
  { key: 'b9',      label: 'Folate',     unit: 'µg' },
  { key: 'vitc',    label: 'Vitamin C',  unit: 'mg' },
  { key: 'vitd',    label: 'Vitamin D',  unit: 'µg' },
  { key: 'vite',    label: 'Vitamin E',  unit: 'mg' },
  { key: 'vitk',    label: 'Vitamin K',  unit: 'µg' },
  { key: 'iron',    label: 'Iron',       unit: 'mg' },
  { key: 'calcium', label: 'Calcium',    unit: 'mg' },
  { key: 'magnesium', label: 'Magnesium', unit: 'mg' },
  { key: 'potassium', label: 'Potassium', unit: 'mg' },
  { key: 'zinc',    label: 'Zinc',       unit: 'mg' },
];

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
