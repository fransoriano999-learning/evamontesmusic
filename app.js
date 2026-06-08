const I18N_FILES = {
  es: 'es.json',
  en: 'en.json',
  ca: 'ca.json',
  fr: 'fr.json'
};

const DEFAULT_LANG = 'es';
const STORAGE_KEY = 'preferredLanguage';

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, part) => {
    if (acc === undefined || acc === null) return undefined;
    if (/^\d+$/.test(part)) return acc[Number(part)];
    return acc[part];
  }, obj);
}

async function loadLanguageFile(lang) {
  const file = I18N_FILES[lang] || I18N_FILES[DEFAULT_LANG];
  const response = await fetch(file, { cache: 'no-cache' });
  if (!response.ok) {
    throw new Error(`Unable to load language file: ${file}`);
  }
  return response.json();
}

function applyTranslations(translations, lang) {
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const key = element.getAttribute('data-i18n');
    const value = getNestedValue(translations, key);
    if (value !== undefined) {
      element.textContent = value;
    }
  });

  document.querySelectorAll('[data-i18n-alt]').forEach((element) => {
    const key = element.getAttribute('data-i18n-alt');
    const value = getNestedValue(translations, key);
    if (value !== undefined) {
      element.setAttribute('alt', value);
    }
  });

  document.querySelectorAll('[data-i18n-content]').forEach((element) => {
    const key = element.getAttribute('data-i18n-content');
    const value = getNestedValue(translations, key);
    if (value !== undefined) {
      element.setAttribute('content', value);
    }
  });

  document.querySelectorAll('[data-i18n-aria-label]').forEach((element) => {
    const key = element.getAttribute('data-i18n-aria-label');
    const value = getNestedValue(translations, key);
    if (value !== undefined) {
      element.setAttribute('aria-label', value);
    }
  });

  if (translations.meta?.title) {
    document.title = translations.meta.title;
  }
}

async function setLanguage(lang) {
  const safeLang = I18N_FILES[lang] ? lang : DEFAULT_LANG;
  try {
    const translations = await loadLanguageFile(safeLang);
    applyTranslations(translations, safeLang);
    localStorage.setItem(STORAGE_KEY, safeLang);

    const switcher = document.getElementById('languageSwitcher');
    if (switcher && switcher.value !== safeLang) {
      switcher.value = safeLang;
    }
  } catch (error) {
    console.error('Translation error:', error);
    if (safeLang !== DEFAULT_LANG) {
      const fallbackTranslations = await loadLanguageFile(DEFAULT_LANG);
      applyTranslations(fallbackTranslations, DEFAULT_LANG);
      localStorage.setItem(STORAGE_KEY, DEFAULT_LANG);

      const switcher = document.getElementById('languageSwitcher');
      if (switcher) {
        switcher.value = DEFAULT_LANG;
      }
    }
  }
}

function getInitialLanguage() {
  const storedLang = localStorage.getItem(STORAGE_KEY);
  if (storedLang && I18N_FILES[storedLang]) return storedLang;

  const browserLang = (navigator.language || navigator.userLanguage || '').slice(0, 2).toLowerCase();
  if (I18N_FILES[browserLang]) return browserLang;

  return DEFAULT_LANG;
}

document.addEventListener('DOMContentLoaded', async () => {
  const switcher = document.getElementById('languageSwitcher');
  const initialLang = getInitialLanguage();

  if (switcher) {
    switcher.value = initialLang;
    switcher.addEventListener('change', (event) => {
      setLanguage(event.target.value);
    });
  }

  await setLanguage(initialLang);
});
