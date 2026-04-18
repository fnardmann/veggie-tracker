# Veggie Tracker

**Eat 30 different plants every week.** A free, offline-capable PWA to track your plant diversity, monitor nutrition gaps, and build healthy streaks.

🌐 **[Try it live →](https://fnardmann.github.io/veggie-tracker/)**

---

## Features

- **Log foods** — type any plant (vegetable, fruit, legume, nut, seed, grain, herb) and it counts toward your weekly 30
- **Streaks** — daily and weekly streak tracking to keep you motivated
- **Nutrition tab** — see which nutrients you're getting from your logged plants and which are low this week
- **"What to Eat More Of"** — smart suggestions for which plants (and optionally animal foods like eggs, fish, dairy) would fill your current nutrient gaps
- **Gallery** — shareable weekly and daily cards with emoji artwork, downloadable as images
- **Charts & heatmap** — daily, weekly, and monthly progress over time
- **Works offline** — full PWA with service worker caching, installable on iOS and Android
- **Two languages** — English and German
- **Privacy-first** — all data stays on your device, no account needed

## Install

Open [fnardmann.github.io/veggie-tracker](https://fnardmann.github.io/veggie-tracker/) in your browser and tap **"Add to Home Screen"** (iOS Safari / Android Chrome) to install it as an app.

## The science behind 30 plants

Research from the [American Gut Project](https://pubmed.ncbi.nlm.nih.gov/29795809/) found that people who eat 30+ different plant foods per week have significantly more diverse gut microbiomes than those who eat 10 or fewer. Plant diversity — not just quantity — is what matters.

**What counts as a plant?** Vegetables, fruits, legumes, nuts, seeds, whole grains, herbs, and spices. Each unique plant counts once per week regardless of how many times you eat it.

## Running locally

No build step needed — it's plain HTML, CSS, and JS.

```bash
git clone https://github.com/fnardmann/veggie-tracker.git
cd veggie-tracker
# serve with any static server, e.g.:
npx serve .
```

Then open `http://localhost:3000`.

## Tech stack

- Vanilla JS, HTML, CSS — no framework, no bundler
- [Chart.js](https://www.chartjs.org/) for charts
- [html2canvas](https://html2canvas.hertzen.com/) for gallery card export
- Service Worker for offline support
- Nutrition data from static JSON + Open Food Facts

## License

MIT
