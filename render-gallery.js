'use strict';

// Plant Gallery tab: generates square shareable cards by drawing a grid of
// OpenMoji images (with fallback to colored circles) onto a canvas.

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
