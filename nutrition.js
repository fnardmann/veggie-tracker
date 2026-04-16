'use strict';

const NUTRITION_CACHE_KEY = 'veggie-nutrition-v1';
const NUTRITION_CACHE_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days

const NUTRIENT_DEFS = [
  { key: 'energy-kcal_100g', label: 'Calories',  unit: 'kcal' },
  { key: 'proteins_100g',    label: 'Protein',   unit: 'g' },
  { key: 'fiber_100g',       label: 'Fibre',     unit: 'g' },
  { key: 'vitamin-c_100g',   label: 'Vitamin C', unit: 'mg' },
  { key: 'iron_100g',        label: 'Iron',      unit: 'mg' },
  { key: 'calcium_100g',     label: 'Calcium',   unit: 'mg' },
  { key: 'potassium_100g',   label: 'Potassium', unit: 'mg' },
];

function getNutritionCache() {
  try { return JSON.parse(localStorage.getItem(NUTRITION_CACHE_KEY) || '{}'); }
  catch { return {}; }
}

function setNutritionCache(data) {
  localStorage.setItem(NUTRITION_CACHE_KEY, JSON.stringify(data));
}

async function fetchNutritionFromAPI(vegetable) {
  const query = encodeURIComponent('raw ' + vegetable);
  const fields = 'product_name,nutriments';
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${query}&action=process&json=1&page_size=5&fields=${fields}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    const data = await res.json();

    const product = data.products?.find(
      p => p.nutriments && p.nutriments['energy-kcal_100g'] != null
    );
    if (!product) return null;

    const n = product.nutriments;
    const result = { source: product.product_name, fetched: Date.now() };
    for (const { key } of NUTRIENT_DEFS) {
      const val = n[key];
      result[key] = (val != null && val !== '') ? +val : null;
    }
    return result;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchNutrition(vegetable) {
  const cache = getNutritionCache();
  const cacheKey = vegetable.toLowerCase();
  const cached = cache[cacheKey];

  if (cached && (Date.now() - cached.fetched) < NUTRITION_CACHE_TTL) {
    return cached;
  }

  try {
    const result = await fetchNutritionFromAPI(vegetable);
    if (result) {
      cache[cacheKey] = result;
      setNutritionCache(cache);
    }
    return result;
  } catch {
    return cached || null; // return stale cache on network error
  }
}

async function fetchNutritionForAll(vegetables) {
  return Promise.all(
    vegetables.map(v => fetchNutrition(v).then(nutrition => ({ vegetable: v, nutrition })))
  );
}
