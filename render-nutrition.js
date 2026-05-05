'use strict';

// Nutrition tab: per-food table, weekly totals progress bars, top sources,
// gap-based plant & animal suggestions, nutrient trend chart, plus the
// portion-settings and food-database panels that share the same nutrient
// lookups.

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtVal(val) {
  if (val == null) return '—';
  return String(+val.toFixed(1));
}

function portionUnit(food) {
  return NUTRITION_DATA[food.toLowerCase()]?.unit ?? 'g';
}

// ── Animal foods ──────────────────────────────────────────────────────────────
// Nutrient amounts are per listed portion (not per 100g).

const ANIMAL_FOODS = [
  { name: 'Eggs',           portion: '1 medium (60 g)',  nutrients: { b2: 0.27, vitd: 1.7, selenium: 15, zinc: 0.65, b12: 1.2, b5: 0.95, vita: 80, b6: 0.09 } },
  { name: 'Chicken',        portion: '150 g breast',     nutrients: { b3: 17, b6: 1.3, b12: 0.4, selenium: 38, zinc: 1.5, b5: 1.5 } },
  { name: 'Beef',           portion: '150 g',            nutrients: { b12: 2.0, zinc: 6.0, iron: 3.0, b3: 9.0, b6: 0.5, selenium: 30 } },
  { name: 'Salmon',         portion: '150 g fillet',     nutrients: { vitd: 11,  b12: 4.2, b3: 12,  selenium: 43, b2: 0.5,  b6: 1.2, b5: 2.0 } },
  { name: 'Tuna',           portion: '120 g (tin)',      nutrients: { b3: 13, b12: 2.7, selenium: 50, b6: 0.5, vitd: 3.8 } },
  { name: 'Sardines',       portion: '90 g (tin)',        nutrients: { vitd: 4.8, b12: 3.5, calcium: 350, selenium: 30, b3: 5.4, b2: 0.22 } },
  { name: 'Mackerel',       portion: '150 g fillet',     nutrients: { vitd: 6.3, b12: 5.4, selenium: 53, b2: 0.5, b3: 9.0, b6: 0.7 } },
  { name: 'Chicken Liver',  portion: '75 g',             nutrients: { vita: 6400, b12: 18, b9: 600, b2: 1.3, iron: 7.5, zinc: 3.0, selenium: 35 } },
  { name: 'Oysters',        portion: '6 medium (85 g)',  nutrients: { zinc: 39, b12: 16, selenium: 55, iron: 4.6, vitd: 3.2 } },
  { name: 'Full-fat Yogurt',portion: '150 g',            nutrients: { calcium: 240, b12: 0.9, b2: 0.27, zinc: 0.9 } },
  { name: 'Cheddar',        portion: '30 g',             nutrients: { calcium: 218, b12: 0.5, b2: 0.15, zinc: 0.9 } },
  { name: 'Milk',           portion: '200 ml',           nutrients: { calcium: 240, b12: 0.9, vitd: 1.6, b2: 0.22 } },
];

// ── Seasonal calendar ────────────────────────────────────────────────────────
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

// ── Plant groups ──────────────────────────────────────────────────────────────
// Near-duplicate foods that get merged into one suggestion row (saves space and
// avoids "you should eat 4 kinds of cabbage" situations).

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

// ── Nutrition tab rendering ───────────────────────────────────────────────────

let _suggExpanded = false;
let _lastSuggTotals = null;
let _lastSuggFoods = null;
let _lastRawResults = null;
let _lastFoodCounts = null;
let _expandedNutrientKey = null;
let _showAllLoggedChips = false;
let _showAllRecChips = false;
let _showAllAnimalChips = false;
let _weekOffset = 0; // 0=current week, -1=previous, -2=two weeks ago, etc.

window._expandSugg = function () {
  _suggExpanded = true;
  renderNutritionTab(true);
};

async function renderNutritionTab(quiet = false) {
  const today = todayStr();
  const ws0 = getWeekStart(today);
  const wsOffset = addDays(ws0, _weekOffset * 7);
  const entries = entriesInRange(getData().entries, wsOffset, addDays(wsOffset, 6));
  const animalWeekTotals = _weekOffset === 0 ? weeklyAnimalTotals() : {};
  const hasAnimal = Object.keys(animalWeekTotals).length > 0;
  const empty = `<p class="empty">${t('empty_log_nutrition')}</p>`;

  // Always render week navigation
  const weekNavEl = document.getElementById('weekNavTotals');
  const navLabel = document.getElementById('weekNavTotalsLabel');
  const prevNav = document.getElementById('prevWeekTotals');
  const nextNav = document.getElementById('nextWeekTotals');
  const newPrev = prevNav.cloneNode(true);
  prevNav.parentNode.replaceChild(newPrev, prevNav);
  const newNext = nextNav.cloneNode(true);
  nextNav.parentNode.replaceChild(newNext, nextNav);
  newPrev.addEventListener('click', () => { _weekOffset--; renderNutritionTab(); });
  newNext.addEventListener('click', () => { if (_weekOffset < 0) { _weekOffset++; renderNutritionTab(); } });

  weekNavEl.hidden = false;
  newPrev.disabled = false;
  newNext.disabled = _weekOffset >= 0;
  navLabel.textContent = _weekOffset === 0 ? t('this_week') : fmtWeekRange(wsOffset);

  if (entries.length === 0 && !hasAnimal) {
    document.getElementById('nutritionTable').innerHTML = empty;
    document.getElementById('nutritionTotals').innerHTML = empty;
    renderFoodDatabase();
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
  }

  const rawResults = uniqueFoods.length ? await fetchNutritionForAll(uniqueFoods) : [];
  console.log('rawResults count:', rawResults.length, 'uniqueFoods:', uniqueFoods.length, 'hasAnimal:', hasAnimal);
  console.log('rawResults with nutrition:', rawResults.filter(r => r.nutrition).length);

  if (!rawResults.some(r => r.nutrition) && !hasAnimal) {
    const noData = `<p class="empty">${t('no_nutrition_data')}</p>`;
    document.getElementById('nutritionTable').innerHTML = noData;
    document.getElementById('nutritionTotals').innerHTML = noData;
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
    const unit = portionUnit(vegetable);
    const portionHtml = advancedPortions
      ? `<label class="portion-wrap${isCustom ? ' portion-wrap--custom' : ''}">
          <input type="number" class="portion-input" data-food="${esc(vegetable)}" data-default="${defaultG}" value="${portionG}" min="1" max="9999">
          <span class="portion-unit">${unit}</span>
          ${isCustom ? `<button class="portion-reset" data-food="${esc(vegetable)}" title="Reset to default">↺</button>` : ''}
        </label>`
      : `<span class="portion-static${isCustom ? ' portion-static--custom' : ''}">${portionG}${unit}</span>`;
    return `<tr>
      <td class="n-veggie">
        ${esc(tFood(vegetable))}${timesLabel}
        ${portionHtml}
      </td>${cells}</tr>`;
  }).join('');

  const tableEl = document.getElementById('nutritionTable');
  tableEl.innerHTML = results.length
    ? `
    <div class="nutrition-scroll">
      <table class="nutrition-table">
        <thead><tr><th>${t('col_food')} <span class="n-portion">${t('col_portion')}</span></th>${headerCells}</tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
    </div>`
    : `<p class="empty">${t('empty_log_nutrition')}</p>`;

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
  // Animal contributions (weekly counts × per-portion nutrients)
  for (const [foodName, count] of Object.entries(animalWeekTotals)) {
    const food = ANIMAL_FOODS.find(f => f.name === foodName);
    if (!food) continue;
    for (const [key, amount] of Object.entries(food.nutrients)) {
      totals[key] = (totals[key] ?? 0) + amount * count;
    }
  }
  for (const key of Object.keys(totals)) {
    if (totals[key] != null) totals[key] = +(totals[key].toFixed(1));
  }

  const dow = new Date().getDay(); // 0=Sun
  const dayOfWeek = dow === 0 ? 7 : dow; // Mon=1 … Sun=7
  const currPacePct = (dayOfWeek / 7) * 100;
  const showPace = _weekOffset === 0; // only show pace marker for current week
  const isPastWeek = _weekOffset < 0;
  const effectivePacePct = isPastWeek ? 100 : currPacePct; // past weeks assumed complete

  const progressRef = hasAnimal ? ANIMAL_WEEKLY_REF : NUTRIENT_WEEKLY_REF;
  const progressRows = NUTRIENT_DEFS
    .filter(({ key }) => NUTRIENT_DEFS.find(d => d.key === key)) // show all defined nutrients
    .map(({ key, unit }) => {
      const val = totals[key] ?? (key === 'vitd' ? 0 : null);
      const ref = (progressRef[key] ?? NUTRIENT_WEEKLY_REF[key]) ?? 0;
      if (val == null && key !== 'selenium') return '';
      const safeVal = val ?? 0;
      const pct = ref > 0 ? Math.min(1, safeVal / ref) : 0;
      const pctDisplay = Math.round(pct * 100);
      const pace = effectivePacePct / 100;
      const ratio = pace > 0 ? Math.min(pct / pace, 1.4) : 1;
      const h = ratio >= 1
        ? 130 + (ratio - 1) * 15
        : 5 + ratio * 125;
      const s = ratio >= 1 ? 52 + (ratio - 1) * 10 : 78;
      const l = ratio >= 1 ? 44 - (ratio - 1) * 8 : 52 - Math.abs(ratio - 0.55) * 6;
      const barColor = `hsl(${h.toFixed(0)},${s.toFixed(0)}%,${l.toFixed(0)}%)`;
      const labelSuffix = key === 'vitd' ? ' ☀️' : '';
      return `
        <div class="nutr-progress-row nutr-progress-row--clickable" data-nutrient-key="${key}">
          <div class="nutr-progress-header">
            <span class="nutr-progress-label">${esc(t('nutrient_' + key))}${labelSuffix}</span>
            <span class="nutr-progress-value">${fmtVal(safeVal)} / ${fmtVal(ref)} ${esc(unit)} · <strong>${pctDisplay}%</strong></span>
          </div>
          <div class="nutr-bar-track">
            <div class="nutr-bar-fill" style="width:${pct * 100}%;background:${barColor}"></div>
            ${showPace ? `<div class="nutr-bar-pace" style="left:${(pace * 100).toFixed(1)}%"></div>` : ''}
          </div>
        </div>`;
    }).join('');

  const nutritionTotalsEl = document.getElementById('nutritionTotals');
  nutritionTotalsEl.innerHTML = `<div class="nutr-progress-list">${progressRows}</div>`;
  nutritionTotalsEl.onclick = e => {
    const row = e.target.closest('[data-nutrient-key]');
    if (!row) return;
    const key = row.dataset.nutrientKey;
    _expandedNutrientKey = _expandedNutrientKey === key ? null : key;
    renderAll();
    if (_expandedNutrientKey) {
      const detailEl = document.getElementById('nutrientDetail');
      if (detailEl) {
        detailEl.hidden = false;
        requestAnimationFrame(() => detailEl.scrollIntoView({ behavior: 'smooth', block: 'center' }));
      }
    }
  };

  // ── Expanded nutrient detail (click on progress bar) ──
  const expandedDetailEl = document.getElementById('nutrientDetail');
  console.log('renderNutritionTab:', { _expandedNutrientKey, results: results?.length, NUTRITION_DATA_keys: Object.keys(NUTRITION_DATA).length });
  if (_expandedNutrientKey && results) {
    const rawResults = results;
    const foodCountsMap = foodCounts;
    const key = _expandedNutrientKey;
    const def = NUTRIENT_DEFS.find(d => d.key === key);
    const val = totals[key] ?? 0;
    const ref = (hasAnimal ? ANIMAL_WEEKLY_REF : NUTRIENT_WEEKLY_REF)[key] ?? 0;
    const pct = ref > 0 ? Math.round((val / ref) * 100) : 0;

    // Build ranked list of logged plants contributing to this nutrient
    const plantRanked = rawResults
      .map(({ vegetable, nutrition: n }) => {
        if (!n || n[key] == null) return null;
        const count = foodCountsMap.get(vegetable.toLowerCase())?.count ?? 1;
        return {
          name: vegetable,
          amount: +(n[key] * count).toFixed(1),
          pct: ref > 0 ? Math.round((n[key] * count) / ref * 100) : 0,
        };
      })
      .filter(Boolean)
      .filter(r => r.pct >= 1)
      .sort((a, b) => b.amount - a.amount);
    const top5 = plantRanked.filter(r => r.pct >= 5);
    const displayPlantRanked = top5.length >= 3 ? top5.slice(0, 3) : [...top5, ...plantRanked.filter(r => r.pct < 5).slice(0, 3 - top5.length)];
    const allLoggedChips = plantRanked.length
      ? plantRanked.map(r => `
          <div class="nutr-detail-chip">
            <span class="nutr-detail-chip-name">${esc(tFood(r.name))}</span>
            <span class="nutr-detail-chip-amt">${fmtVal(r.amount)} ${esc(def.unit)} <em>${r.pct}%</em></span>
          </div>`).join('')
      : `<p class="empty" style="margin:0">${t('no_data_week')}</p>`;
    const visibleLoggedChips = _showAllLoggedChips ? allLoggedChips : (displayPlantRanked.length ? displayPlantRanked.map(r => `
          <div class="nutr-detail-chip">
            <span class="nutr-detail-chip-name">${esc(tFood(r.name))}</span>
            <span class="nutr-detail-chip-amt">${fmtVal(r.amount)} ${esc(def.unit)} <em>${r.pct}%</em></span>
          </div>`).join('') : `<p class="empty" style="margin:0">${t('no_data_week')}</p>`);
    const loggedShowMore = plantRanked.length > 3
      ? `<button class="nutr-detail-show-more" data-show="logged">${_showAllLoggedChips ? t('show_less') : t('show_more')}</button>`
      : '';

    // Top recommendations for this specific nutrient
    const excludedSet = new Set(getExcludedFoods().map(f => f.toLowerCase()));
    const loggedSet = new Set(uniqueFoods.map(f => f.toLowerCase()));
    const seasonCountry = getSeasonalCountry();
    const seasonMap = seasonCountry !== 'off' ? (SEASONAL_CALENDAR[seasonCountry] ?? {}) : {};
    const currentMonth = new Date().getMonth() + 1;

    const recScores = Object.entries(NUTRITION_DATA)
      .filter(([name]) => !loggedSet.has(name) && !excludedSet.has(name))
      .filter(([name, d]) => d[key] != null)
      .map(([name, d]) => {
        const amount = +(d[key] * d.g / 100).toFixed(1);
        const recPct = ref > 0 ? Math.round(amount / ref * 100) : 0;
        const inSeason = seasonMap[name]?.includes(currentMonth) ?? false;
        return { name, amount, pct: recPct, inSeason };
      })
      .filter(f => f.pct >= 5)
      .sort((a, b) => b.pct - a.pct || b.amount - a.amount)
      .slice(0, 8);

    const recChips = recScores.length
      ? recScores.map(r => `
          <div class="nutr-detail-chip nutr-detail-chip--rec">
            <span class="nutr-detail-chip-name">${esc(tFood(r.name))}</span>
            ${r.inSeason ? '<span class="sugg-season-badge">🌱</span>' : ''}
            <span class="nutr-detail-chip-amt">${fmtVal(r.amount)} ${esc(def.unit)} <em>+${r.pct}%</em></span>
          </div>`).join('')
      : `<p class="empty" style="margin:0">${t('no_suggestions')}</p>`;
    const visibleRecChips = _showAllRecChips ? recChips : (recScores.length ? recScores.slice(0, 3).map(r => `
          <div class="nutr-detail-chip nutr-detail-chip--rec">
            <span class="nutr-detail-chip-name">${esc(tFood(r.name))}</span>
            ${r.inSeason ? '<span class="sugg-season-badge">🌱</span>' : ''}
            <span class="nutr-detail-chip-amt">${fmtVal(r.amount)} ${esc(def.unit)} <em>+${r.pct}%</em></span>
          </div>`).join('') : `<p class="empty" style="margin:0">${t('no_suggestions')}</p>`);
    const recShowMore = recScores.length > 3
      ? `<button class="nutr-detail-show-more" data-show="rec">${_showAllRecChips ? t('show_less') : t('show_more')}</button>`
      : '';

    const hasPoorPlantMsg = t('poorplant_' + key) !== 'poorplant_' + key;
    const showAnimal = pct < 20 && hasPoorPlantMsg && getAnimalSuggestions();
    let allAnimalChips = '';
    let visibleAnimalChips = '';
    let animalShowMore = '';
    if (showAnimal) {
      const refKey = ANIMAL_WEEKLY_REF[key] ?? ref;
      const topAnimal = ANIMAL_FOODS
        .filter(f => f.nutrients[key] != null)
        .map(f => {
          const amount = +(f.nutrients[key] * 1).toFixed(1);
          const apct = refKey > 0 ? Math.round(amount / refKey * 100) : 0;
          return { name: f.name, amount, pct: apct, unit: def.unit };
        })
        .sort((a, b) => b.pct - a.pct || b.amount - a.amount);
      allAnimalChips = topAnimal.map(f => `
          <div class="nutr-detail-chip nutr-detail-chip--animal">
            <span class="nutr-detail-chip-name">${esc(tFood(f.name))}</span>
            <span class="nutr-detail-chip-amt">${fmtVal(f.amount)} ${esc(def.unit)} <em>+${f.pct}%</em></span>
          </div>`).join('');
      visibleAnimalChips = _showAllAnimalChips ? allAnimalChips : (topAnimal.slice(0, 3).map(f => `
          <div class="nutr-detail-chip nutr-detail-chip--animal">
            <span class="nutr-detail-chip-name">${esc(tFood(f.name))}</span>
            <span class="nutr-detail-chip-amt">${fmtVal(f.amount)} ${esc(def.unit)} <em>+${f.pct}%</em></span>
          </div>`).join(''));
      if (topAnimal.length > 3) {
        animalShowMore = `<button class="nutr-detail-show-more" data-show="animal">${_showAllAnimalChips ? t('show_less') : t('show_more')}</button>`;
      }
    }
    const getPoorPlantMsg = (key) => {
      const base = `poorplant_${key}`;
      const suffix = getLang() === 'de' ? '_de' : '';
      const deVal = (TRANSLATIONS.de || {})[base + suffix];
      return deVal ? deVal : t(base);
    };
    const poorPlantWarning = pct < 20 && hasPoorPlantMsg ? `<div class="nutr-detail-warning">${esc(getPoorPlantMsg(key))}</div>` : '';

    const loggedLabel = getLang() === 'de' ? t('logged_this_nutrient_de') : t('logged_this_nutrient');
    const improveLabel = getLang() === 'de' ? t('would_improve_de') : t('would_improve');

    const closeBtn = `<button class="nutr-detail-close" data-key="${key}" title="Close">✕</button>`;
    expandedDetailEl.innerHTML = `
      <div class="nutr-detail-panel">
        <div class="nutr-detail-header">
          <div class="nutr-detail-title-row">
            ${closeBtn}
            <span class="nutr-detail-nutrient">${esc(t('nutrient_' + key))}</span>
          </div>
          <div class="nutr-detail-progress">
            <div class="nutr-bar-track" style="height:10px">
              <div class="nutr-bar-fill" style="width:${Math.min(100, pct)}%;background:hsl(130,52%,44%)"></div>
            </div>
            <span class="nutr-detail-pct">${fmtVal(val)} / ${fmtVal(ref)} ${esc(def.unit)} · <strong>${pct}%</strong></span>
          </div>
          ${poorPlantWarning}
        </div>
        <div class="nutr-detail-body">
          <div class="nutr-detail-section">
            <p class="nutr-detail-section-label">${esc(loggedLabel)}</p>
            <div class="nutr-detail-chip-list">${visibleLoggedChips}</div>
            ${loggedShowMore}
          </div>
          <div class="nutr-detail-divider"></div>
          <div class="nutr-detail-section">
            <p class="nutr-detail-section-label">${esc(improveLabel)}</p>
            <div class="nutr-detail-chip-list">${visibleRecChips}</div>
            ${recShowMore}
          </div>
          ${animalShowMore ? `<div class="nutr-detail-divider"></div>
          <div class="nutr-detail-section">
            <p class="nutr-detail-section-label">${esc(t('sugg_animal_label'))}</p>
            <div class="nutr-detail-chip-list">${visibleAnimalChips}</div>
            ${animalShowMore}
          </div>` : ''}
        </div>
      </div>`;

    expandedDetailEl.querySelector('.nutr-detail-close')?.addEventListener('click', () => {
      _expandedNutrientKey = null;
      _showAllLoggedChips = false;
      _showAllRecChips = false;
      _showAllAnimalChips = false;
      renderAll();
    });
    expandedDetailEl.querySelectorAll('.nutr-detail-show-more').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.show === 'logged') _showAllLoggedChips = !_showAllLoggedChips;
        if (btn.dataset.show === 'rec') _showAllRecChips = !_showAllRecChips;
        if (btn.dataset.show === 'animal') _showAllAnimalChips = !_showAllAnimalChips;
        renderAll();
      });
    });
    expandedDetailEl.hidden = false;
  } else {
    expandedDetailEl.hidden = true;
  }

  _lastRawResults = results;
  _lastFoodCounts = foodCounts;

  renderFoodDatabase();

  await renderNutrientTrend();
}

// ── Missing nutrient suggestions ─────────────────────────────────────────────
// Weekly reference maps (NUTRIENT_WEEKLY_REF, ANIMAL_WEEKLY_REF) are derived
// from NUTRIENT_DEFS in nutrition.js.

function renderNutrientSuggestions(totals, loggedFoodsThisWeek) {
  const el = document.getElementById('nutritionSuggestions');

  const dow = new Date().getDay();
  const pace = (dow === 0 ? 7 : dow) / 7;

  // Identify nutrients where the user is behind today's pace.
  // Use ANIMAL_WEEKLY_REF so b12 (requiresAnimal) is included.
  // For requiresAnimal nutrients treat null totals as 0 — plants provide none so
  // 0 is accurate and it means b12 always shows as a gap until it's actually covered.
  const gapNutrients = NUTRIENT_DEFS
    .filter(({ key }) => ANIMAL_WEEKLY_REF[key])
    .map(({ key, unit, requiresAnimal }) => {
      const raw = totals[key];
      const val = raw ?? (requiresAnimal ? 0 : null);
      if (val == null) return null;
      return { key, unit, coverage: val / ANIMAL_WEEKLY_REF[key] };
    })
    .filter(Boolean)
    .filter(n => n.coverage < pace)
    .sort((a, b) => a.coverage - b.coverage);

  const loggedSet = new Set(loggedFoodsThisWeek.map(f => f.toLowerCase()));
  const excludedSet = new Set(getExcludedFoods().map(f => f.toLowerCase()));

  let plantHtml = '';

  if (!gapNutrients.length) {
    plantHtml = `<p class="empty">${t('sugg_all_covered')}</p>`;
  } else {

    const MIN_COVERAGE = 0.05;
    const seasonCountry = getSeasonalCountry();
    const seasonMap = seasonCountry !== 'off' ? (SEASONAL_CALENDAR[seasonCountry] ?? {}) : {};
    const currentMonth = new Date().getMonth() + 1;

    const rawScores = Object.entries(NUTRITION_DATA)
      .filter(([name]) => !loggedSet.has(name) && !excludedSet.has(name))
      .map(([name, d]) => {
        const covered = gapNutrients
          .map(({ key, unit }) => {
            const amount = d[key] != null ? +(d[key] * d.g / 100).toFixed(1) : 0;
            const pct = amount / (NUTRIENT_WEEKLY_REF[key] ?? ANIMAL_WEEKLY_REF[key]);
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
        const ppKey = 'poorplant_' + gap.key;
        if (t(ppKey) === ppKey) continue; // skip if no translation exists (t() returns raw key as fallback)
        const def = NUTRIENT_DEFS.find(d => d.key === gap.key);
        const ref = ANIMAL_WEEKLY_REF[gap.key];
        // For requiresAnimal nutrients (b12): top 3 from ANIMAL_FOODS, not NUTRITION_DATA
        const top3 = def?.requiresAnimal
          ? ANIMAL_FOODS
              .filter(f => f.nutrients[gap.key] && !excludedSet.has(f.name.toLowerCase()))
              .map(f => ({
                name: f.name,
                amount: +f.nutrients[gap.key].toFixed(2),
                pct: Math.round(f.nutrients[gap.key] / ref * 100),
                unit: gap.unit,
              }))
              .sort((a, b) => b.amount - a.amount)
              .slice(0, 3)
          : Object.entries(NUTRITION_DATA)
              .filter(([name]) => !loggedSet.has(name) && NUTRITION_DATA[name][gap.key] != null)
              .map(([name, d]) => {
                const amount = +(d[gap.key] * d.g / 100).toFixed(2);
                const pct = Math.round(amount / ref * 100);
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
              <span class="sugg-food-badge sugg-food-badge--weak">${pct}${t('pct_per_week')}</span>
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

  // Animal food suggestions. All ANIMAL_FOODS are always shown with a stepper
  // so users can track them even when no gap applies (e.g. eggs for breakfast).
  // Foods that cover a gap get chips + badge and are sorted to the top.
  let animalHtml = '';
  if (getAnimalSuggestions()) {
    const MIN_COVERAGE = 0.05;
    const animalGaps = NUTRIENT_DEFS
      .filter(({ key }) => ANIMAL_WEEKLY_REF[key] && totals[key] != null)
      .map(({ key, unit }) => ({ key, unit, coverage: (totals[key] ?? 0) / ANIMAL_WEEKLY_REF[key] }))
      .filter(n => n.coverage < 1);
    const b12Covered = (totals.b12 ?? 0) >= ANIMAL_WEEKLY_REF.b12;
    if (!animalGaps.find(n => n.key === 'b12') && !b12Covered) {
      animalGaps.push({ key: 'b12', unit: 'µg', coverage: (totals.b12 ?? 0) / ANIMAL_WEEKLY_REF.b12 });
    }
    const animalScores = ANIMAL_FOODS
      .filter(food => !excludedSet.has(food.name.toLowerCase()))
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
      .sort((a, b) => b.covered.length - a.covered.length || b.totalScore - a.totalScore);

    if (animalScores.length) {
      const today = todayStr();
      const todayCounts = getAnimalCounts()[today] ?? {};
      const weekTotals = weeklyAnimalTotals();
      const rows = animalScores.map(({ name, portion, covered, nutrients }) => {
        const coveredKeys = new Set(covered.map(c => c.key));
        const countKey = covered.length === 1 ? 'covers_1_gap' : 'covers_n_gaps';
        // Show all of the food's nutrients; highlight gap-covering ones, dim the rest
        const chips = Object.entries(nutrients).map(([key, amount]) => {
          const def = NUTRIENT_DEFS.find(d => d.key === key);
          if (!def) return '';
          const cls = coveredKeys.has(key) ? 'sugg-nut-chip' : 'sugg-nut-chip sugg-nut-chip--weak';
          return `<span class="${cls}">${esc(t('nutrient_' + key))} <em>${+amount.toFixed(1)} ${esc(def.unit)}</em></span>`;
        }).join('');
        const todayN = todayCounts[name] ?? 0;
        const weekN = weekTotals[name] ?? 0;
        const weekBadge = weekN > 0
          ? `<span class="sugg-animal-week">${esc(t('animal_week_count', { n: weekN }))}</span>`
          : '';
        const gapBadge = covered.length > 0
          ? `<span class="sugg-food-badge">${t(countKey, { n: covered.length })}</span>`
          : '';
        const stepper = `
          <div class="sugg-animal-stepper" data-food="${esc(name)}">
            <button class="sugg-animal-btn" data-action="dec" aria-label="−" ${todayN === 0 ? 'disabled' : ''}>−</button>
            <span class="sugg-animal-count">${todayN}</span>
            <button class="sugg-animal-btn sugg-animal-btn--plus" data-action="inc" aria-label="+">+</button>
          </div>`;
        return `
          <div class="sugg-food-row sugg-food-row--animal">
            <div class="sugg-food-header">
              <span class="sugg-food-name">${esc(tFood(name))}</span>
              <span class="sugg-food-portion">${esc(portion)}</span>
              ${weekBadge}
              ${gapBadge}
            </div>
            <div class="sugg-animal-row">
              <div class="sugg-nut-chips">${chips}</div>
              ${stepper}
            </div>
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

  el.querySelectorAll('.sugg-animal-stepper').forEach(stepper => {
    const food = stepper.dataset.food;
    stepper.addEventListener('click', e => {
      const btn = e.target.closest('[data-action]');
      if (!btn || btn.disabled) return;
      if (btn.dataset.action === 'inc') incAnimal(todayStr(), food);
      else decAnimal(todayStr(), food);
      renderNutritionTab(true);
    });
  });
}

// ── Nutrient trend chart ──────────────────────────────────────────────────────

async function renderNutrientTrend() {
  const { entries } = getData();
  const today = todayStr();
  const ws0 = getWeekStart(today);
  const WEEKS = 12;

  const weeks = Array.from({ length: WEEKS }, (_, i) => {
    const ws = addDays(ws0, -(WEEKS - 1 - i) * 7);
    return { ws, we: addDays(ws, 6), label: fmtWeekRange(ws) };
  });

  const weekEntries = weeks.map(({ ws, we }) => entriesInRange(entries, ws, we));
  const allFoods = [...new Set(weekEntries.flat().map(e => e.vegetable))];
  const wrap = document.getElementById('trendChartWrap');

  if (allFoods.length === 0) {
    wrap.innerHTML = `<p class="empty">${t('empty_log_trend')}</p>`;
    return;
  }

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

  const selected = getTrendVitamins();
  const defs = NUTRIENT_DEFS.filter(d => selected.includes(d.key));

  const datasets = defs.map((def, idx) => {
    const color = CHART_COLORS[idx % CHART_COLORS.length];
    const weeklyRef = NUTRIENT_WEEKLY_REF[def.key] ?? 1;
    const totals = weeks.map((_, i) => {
      const we = weekEntries[i];
      if (!we.length) return null;
      const counts = new Map();
      for (const e of we) counts.set(e.vegetable.toLowerCase(), (counts.get(e.vegetable.toLowerCase()) ?? 0) + 1);
      let sum = null;
      for (const [food, count] of counts) {
        const n = foodNutrition.get(food);
        if (n?.[def.key] != null) sum = (sum ?? 0) + n[def.key] * count;
      }
      return sum != null ? +((sum / weeklyRef) * 100).toFixed(1) : null;
    });
    return {
      data: totals,
      borderColor: color,
      backgroundColor: color + '1a',
      borderWidth: 2,
      pointRadius: 3,
      pointBackgroundColor: color,
      pointBorderColor: '#fff',
      pointBorderWidth: 1,
      fill: false,
      tension: 0.35,
      spanGaps: true,
      label: `${t('nutrient_' + def.key)} (%)`,
    };
  });

  if (!wrap.querySelector('canvas')) {
    wrap.innerHTML = '<canvas id="trendChart"></canvas>';
  }

  mkChart('trendChart', {
    type: 'line',
    data: { labels: weeks.map(w => w.label), datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: 'top', labels: { font: { size: 11 }, boxWidth: 14, padding: 8 } },
        tooltip: {
          callbacks: {
            label: ctx => ctx.raw != null ? `${defs[ctx.datasetIndex]?.label}: ${ctx.raw}%` : t('tooltip_no_data'),
          },
        },
      },
      scales: {
        y: { beginAtZero: true, max: 100, grid: { color: '#f0f5f2' }, ticks: { callback: v => v + '%' } },
        x: { grid: { display: false }, ticks: { font: { size: 9 }, maxRotation: 45 } },
      },
    },
  });
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
        <span class="portion-unit">${portionUnit(food)}</span>
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

// ── Food database lookup ─────────────────────────────────────────────────────

let _foodDbOpen = new Set();

function renderFoodDatabase() {
  const list = document.getElementById('foodDbList');
  if (!list) return;
  const filterEl = document.getElementById('foodDbFilter');
  const filter = filterEl ? filterEl.value.trim().toLowerCase() : '';

  const portions = getPortions();
  const allFoods = FOODS.map(f => f.toLowerCase())
    .sort((a, b) => tFood(toTitleCase(a)).localeCompare(tFood(toTitleCase(b)), getLang()));

  const foods = filter
    ? allFoods.filter(f => tFood(toTitleCase(f)).toLowerCase().includes(filter) || f.includes(filter))
    : allFoods;

  if (!foods.length) {
    list.innerHTML = `<p class="empty">${t('food_db_no_match')}</p>`;
    return;
  }

  const MAX_VISIBLE = filter ? 30 : 15;
  const visible = foods.slice(0, MAX_VISIBLE);
  const hidden = foods.length - visible.length;

  list.innerHTML = visible.map(food => {
    const data = NUTRITION_DATA[food];
    const defaultG = data?.g ?? 100;
    const portionG = portions[food] ?? defaultG;
    const isOpen = _foodDbOpen.has(food);
    const displayName = tFood(toTitleCase(food));

    let detailHtml = '';
    if (isOpen) {
      if (!data) {
        detailHtml = `<div class="food-db-detail"><p class="empty">${t('food_db_no_data')}</p></div>`;
      } else {
        const factor = portionG / 100;
        const rows = NUTRIENT_DEFS.map(({ key, unit }) => {
          const per100 = data[key];
          if (per100 == null) return '';
          const amount = +(per100 * factor).toFixed(1);
          const dailyRef = NUTRIENT_WEEKLY_REF[key] ? NUTRIENT_WEEKLY_REF[key] / 7 : null;
          const pct = dailyRef ? Math.round(amount / dailyRef * 100) : null;
          const pctStr = pct != null ? `<span class="food-db-pct">${pct}% / Tag</span>` : '';
          return `<div class="food-db-nut-row">
            <span class="food-db-nut-label">${esc(t('nutrient_' + key))}</span>
            <span class="food-db-nut-val">${fmtVal(amount)} ${esc(unit)}</span>
            ${pctStr}
          </div>`;
        }).join('');
        detailHtml = `<div class="food-db-detail">
          <p class="food-db-portion-note">${t('food_db_portion_label')}: <strong>${portionG} ${portionUnit(food)}</strong></p>
          <div class="food-db-nut-list">${rows}</div>
        </div>`;
      }
    }

    return `<div class="food-db-row${isOpen ? ' food-db-row--open' : ''}" data-food="${esc(food)}">
      <div class="food-db-row-main">
        <span class="food-db-name">${esc(displayName)}</span>
        <span class="food-db-portion">${portionG} ${portionUnit(food)}</span>
        <span class="food-db-chevron">${isOpen ? '▾' : '▸'}</span>
      </div>
      ${detailHtml}
    </div>`;
  }).join('') + (hidden > 0 ? `<p class="food-db-more-hint">${t('food_db_more_results', { n: hidden })}</p>` : '');

  list.querySelectorAll('.food-db-row-main').forEach(row => {
    row.addEventListener('click', () => {
      const food = row.parentElement.dataset.food;
      if (_foodDbOpen.has(food)) _foodDbOpen.delete(food);
      else _foodDbOpen.add(food);
      renderFoodDatabase();
    });
  });
}

// ── Excluded foods settings ───────────────────────────────────────────────────

function renderExcludedFoods() {
  const list = document.getElementById('excludedFoodsList');
  if (!list) return;
  const excluded = getExcludedFoods();

  if (!excluded.length) {
    list.innerHTML = `<p class="empty settings-portions-empty">${t('excluded_none')}</p>`;
    return;
  }

  list.innerHTML = excluded.map(name => `
    <div class="excluded-food-row">
      <span class="excluded-food-name">${esc(tFood(name))}</span>
      <button class="excluded-food-remove" data-food="${esc(name)}" aria-label="${t('excluded_remove')}">✕</button>
    </div>`).join('');

  list.querySelectorAll('.excluded-food-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      setExcludedFoods(getExcludedFoods().filter(f => f !== btn.dataset.food));
      renderExcludedFoods();
      if (!document.getElementById('tab-nutrition').hidden) renderNutritionTab(true);
    });
  });
}
