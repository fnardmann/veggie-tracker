import { describe, it, expect } from 'vitest';
import { setLang, t } from '../i18n.js';

localStorage.setItem('lang', 'en');

describe('render-nutrition state logic', () => {
  it('expandedNutrientKey toggles correctly', () => {
    let _expandedNutrientKey = null;

    const toggle = (key) => {
      _expandedNutrientKey = _expandedNutrientKey === key ? null : key;
    };

    toggle('vitc');
    expect(_expandedNutrientKey).toBe('vitc');

    toggle('vitc');
    expect(_expandedNutrientKey).toBe(null);

    toggle('vitc');
    expect(_expandedNutrientKey).toBe('vitc');

    toggle('vite');
    expect(_expandedNutrientKey).toBe('vite');

    toggle('b1');
    expect(_expandedNutrientKey).toBe('b1');

    toggle('b1');
    expect(_expandedNutrientKey).toBe(null);
  });

  it('generalHtml shows only when no nutrient is expanded', () => {
    const generalPlantHtml = '<div>Plants</div>';
    const generalAnimalHtml = '<div>Animals</div>';

    const getGeneralHtml = (expandedKey) => {
      return (!expandedKey && (generalPlantHtml || generalAnimalHtml))
        ? `<div class="sugg-section">${generalPlantHtml}${generalAnimalHtml}</div>`
        : '';
    };

    expect(getGeneralHtml(null)).toContain('sugg-section');
    expect(getGeneralHtml('vitc')).toBe('');
    expect(getGeneralHtml('vite')).toBe('');
    expect(getGeneralHtml('')).toBe('');
  });
});

describe('i18n integration', () => {
  it('t works with getLang for covers_1_gap', () => {
    localStorage.setItem('lang', 'en');
    expect(t('covers_1_gap')).toBe('covers 1 gap');

    localStorage.setItem('lang', 'de');
    expect(t('covers_1_gap')).toBe('deckt 1 Lücke');
  });

  it('t works with getLang for season_badge', () => {
    localStorage.setItem('lang', 'en');
    expect(t('season_badge')).toBe('🌱 In season');

    localStorage.setItem('lang', 'de');
    expect(t('season_badge')).toBe('🌱 In Saison');
  });
});
