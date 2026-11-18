import { Preferences } from '@capacitor/preferences';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ar from './ar.json';
import en from './en.json';

export type Lang = 'en' | 'ar';

const STORAGE_KEY = 'lu.lang';

void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, ar: { translation: ar } },
  lng: 'en',
  fallbackLng: 'en',
  initAsync: false,
  interpolation: { escapeValue: false },
});

const isLang = (value: unknown): value is Lang => value === 'en' || value === 'ar';

function applyToDocument(lang: Lang): void {
  const html = document.documentElement;
  html.lang = lang;
  html.dir = lang === 'ar' ? 'rtl' : 'ltr';
}

async function switchTo(lang: Lang): Promise<void> {
  await i18n.changeLanguage(lang);
  applyToDocument(lang);
}

/** The app is Arabic-first (docs/redesign/PLAN.md, decision 17); English is a setting. */
export const DEFAULT_LANG: Lang = 'ar';

/** Order: the saved choice, then Arabic. The device language doesn't decide. */
export async function initLanguage(): Promise<void> {
  const { value } = await Preferences.get({ key: STORAGE_KEY });
  await switchTo(isLang(value) ? value : DEFAULT_LANG);
}

export async function setLanguage(lang: Lang): Promise<void> {
  await switchTo(lang);
  await Preferences.set({ key: STORAGE_KEY, value: lang });
}

export function currentLanguage(): Lang {
  return isLang(i18n.language) ? i18n.language : 'en';
}

export default i18n;
