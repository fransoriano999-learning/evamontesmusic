const DEFAULT_LANG = "es";
const SUPPORTED_LANGS = ["es", "en", "ca", "fr"];

function getTranslation(translations, key) {
  return translations[key];
}

async function loadLanguage(lang) {
  const selectedLang = SUPPORTED_LANGS.includes(lang) ? lang : DEFAULT_LANG;
  const response = await fetch(`lang/${selectedLang}.json`, { cache: "no-cache" });
  if (!response.ok) throw new Error(`Could not load lang/${selectedLang}.json`);
  return response.json();
}

function applyTranslations(translations, selectedLang) {
  document.documentElement.lang = selectedLang;

  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const key = element.dataset.i18n;
    const value = getTranslation(translations, key);
    if (typeof value === 'string') {
      if (element.tagName.toLowerCase() === 'title') {
        document.title = value;
      } else {
        element.textContent = value;
      }
    }
  });

  document.querySelectorAll('[data-i18n-alt]').forEach((element) => {
    const value = getTranslation(translations, element.dataset.i18nAlt);
    if (typeof value === 'string') element.setAttribute('alt', value);
  });

  document.querySelectorAll('[data-i18n-content]').forEach((element) => {
    const value = getTranslation(translations, element.dataset.i18nContent);
    if (typeof value === 'string') element.setAttribute('content', value);
  });

  document.querySelectorAll('[data-i18n-aria-label]').forEach((element) => {
    const value = getTranslation(translations, element.dataset.i18nAriaLabel);
    if (typeof value === 'string') element.setAttribute('aria-label', value);
  });
}

async function setLanguage(lang) {
  try {
    const translations = await loadLanguage(lang);
    applyTranslations(translations, lang);
    localStorage.setItem('preferredLanguage', lang);

    const selector = document.getElementById('languageSwitcher');
    if (selector) selector.value = lang;
  } catch (error) {
    console.error('Language loading error:', error);
    if (lang !== DEFAULT_LANG) await setLanguage(DEFAULT_LANG);
  }
}

function initLanguageSwitcher() {
  const selector = document.getElementById('languageSwitcher');
  const browserLang = (navigator.language || DEFAULT_LANG).slice(0, 2).toLowerCase();
  const savedLang = localStorage.getItem('preferredLanguage');
  const initialLang = SUPPORTED_LANGS.includes(savedLang)
    ? savedLang
    : (SUPPORTED_LANGS.includes(browserLang) ? browserLang : DEFAULT_LANG);

  if (selector) {
    selector.addEventListener('change', (event) => setLanguage(event.target.value));
  }

  setLanguage(initialLang);
}

document.addEventListener('DOMContentLoaded', initLanguageSwitcher);
