import { describe, it, expect } from 'vitest';
import { getLang, setLang, t } from '../i18n.js';

describe('i18n', () => {
  it('getLang returns stored language or default en', () => {
    localStorage.clear();
    expect(getLang()).toBe('en');

    localStorage.setItem('lang', 'de');
    expect(getLang()).toBe('de');
  });

  it('setLang stores language in localStorage', () => {
    localStorage.clear();
    setLang('de');
    expect(localStorage.getItem('lang')).toBe('de');
  });

  it('t returns translated string for en', () => {
    localStorage.setItem('lang', 'en');
    expect(t('tab_overview')).toBe('Overview');
    expect(t('btn_add')).toBe('Add');
  });

  it('t returns translated string for de', () => {
    localStorage.setItem('lang', 'de');
    expect(t('tab_overview')).toBe('Übersicht');
    expect(t('btn_add')).toBe('Hinzufügen');
  });

  it('t falls back to en for missing translation', () => {
    localStorage.setItem('lang', 'de');
    expect(t('nonexistent_key')).toBe('nonexistent_key');
  });

  it('t supports variable interpolation', () => {
    localStorage.setItem('lang', 'en');
    expect(t('covers_n_gaps', { n: 3 })).toBe('covers 3 gaps');

    localStorage.setItem('lang', 'de');
    expect(t('covers_n_gaps', { n: 3 })).toBe('deckt 3 Lücken');
  });

  it('German translations exist for key UI strings', () => {
    localStorage.setItem('lang', 'de');
    expect(t('nutrient_fact_heading')).toBe('Nährstoff des Tages');
    expect(t('season_badge')).toBe('🌱 In Saison');
    expect(t('covers_1_gap')).toBe('deckt 1 Lücke');
    expect(t('covers_n_gaps', { n: 2 })).toBe('deckt 2 Lücken');
    expect(t('sugg_all_covered')).toBe('Alle Nährstoffziele diese Woche erreicht!');
  });
});
