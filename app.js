const supportedLanguages = ['es', 'en', 'ca', 'fr'];
const languageSwitcher = document.getElementById('languageSwitcher');

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, part) => {
    if (acc === undefined || acc === null) return undefined;
    return acc[part];
  }, obj);
}

function applyTranslations(translations) {
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const key = element.dataset.i18n;
    const value = getNestedValue(translations, key);
    if (value !== undefined) {
      element.textContent = value;
    }
  });

  document.querySelectorAll('[data-i18n-alt]').forEach((element) => {
    const key = element.dataset.i18nAlt;
    const value = getNestedValue(translations, key);
    if (value !== undefined) {
      element.setAttribute('alt', value);
    }
  });

  document.querySelectorAll('[data-i18n-content]').forEach((element) => {
    const key = element.dataset.i18nContent;
    const value = getNestedValue(translations, key);
    if (value !== undefined) {
      element.setAttribute('content', value);
    }
  });

  document.querySelectorAll('[data-i18n-aria-label]').forEach((element) => {
    const key = element.dataset.i18nAriaLabel;
    const value = getNestedValue(translations, key);
    if (value !== undefined) {
      element.setAttribute('aria-label', value);
    }
  });

  const pageTitle = getNestedValue(translations, 'meta.title');
  if (pageTitle) {
    document.title = pageTitle;
  }

  const currentHtmlLang = document.documentElement.lang;
  if (supportedLanguages.includes(currentHtmlLang)) {
    document.documentElement.lang = currentHtmlLang;
  }
}

async function loadLanguage(language) {
  const lang = supportedLanguages.includes(language) ? language : 'es';

  try {
    const response = await fetch(`${lang}.json`, { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error(`Unable to load ${lang}.json`);
    }

    const translations = await response.json();
    applyTranslations(translations);
    document.documentElement.lang = lang;
    localStorage.setItem('preferredLanguage', lang);
    if (languageSwitcher) {
      languageSwitcher.value = lang;
    }
  } catch (error) {
    console.error('Language loading error:', error);
  }
}

const navToggle = document.getElementById('nav-toggle');
document.querySelectorAll('.main-nav a').forEach((link) => {
  link.addEventListener('click', () => {
    if (navToggle) {
      navToggle.checked = false;
    }
  });
});

if (languageSwitcher) {
  languageSwitcher.addEventListener('change', (event) => {
    loadLanguage(event.target.value);
  });
}

const browserLanguage = (navigator.language || 'es').slice(0, 2);
const savedLanguage = localStorage.getItem('preferredLanguage');
const initialLanguage = savedLanguage || (supportedLanguages.includes(browserLanguage) ? browserLanguage : 'es');
loadLanguage(initialLanguage);
