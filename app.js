const supportedLanguages = ['es', 'en', 'ca', 'fr'];
const languageSwitcher = document.getElementById('languageSwitcher');
const DEFAULT_LANGUAGE = 'es';

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, part) => {
    if (acc === undefined || acc === null) return undefined;
    return acc[part];
  }, obj);
}

function applyTranslations(translations, lang) {
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

  document.documentElement.lang = lang;
  if (languageSwitcher) {
    languageSwitcher.value = lang;
  }
}

async function fetchTranslations(language) {
  const lang = supportedLanguages.includes(language) ? language : DEFAULT_LANGUAGE;
  const candidatePaths = [
    `./${lang}.json`,
    `${lang}.json`,
    `./lang/${lang}.json`,
    `lang/${lang}.json`
  ];

  let lastError = null;

  for (const path of candidatePaths) {
    try {
      const response = await fetch(path, { cache: 'no-cache' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} while loading ${path}`);
      }
      return await response.json();
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error(`Unable to load translations for ${lang}`);
}

async function loadLanguage(language) {
  const lang = supportedLanguages.includes(language) ? language : DEFAULT_LANGUAGE;

  try {
    const translations = await fetchTranslations(lang);
    applyTranslations(translations, lang);
    localStorage.setItem('preferredLanguage', lang);
    return true;
  } catch (error) {
    console.error(`Language loading error for "${lang}":`, error);

    if (lang !== DEFAULT_LANGUAGE) {
      try {
        const fallbackTranslations = await fetchTranslations(DEFAULT_LANGUAGE);
        applyTranslations(fallbackTranslations, DEFAULT_LANGUAGE);
        localStorage.setItem('preferredLanguage', DEFAULT_LANGUAGE);
        console.warn(`Fallback applied: ${DEFAULT_LANGUAGE}`);
        return true;
      } catch (fallbackError) {
        console.error(`Fallback language loading error for "${DEFAULT_LANGUAGE}":`, fallbackError);
      }
    }

    return false;
  }
}

function detectInitialLanguage() {
  const savedLanguage = localStorage.getItem('preferredLanguage');
  if (savedLanguage && supportedLanguages.includes(savedLanguage)) {
    return savedLanguage;
  }

  const browserLanguage = (navigator.language || navigator.userLanguage || DEFAULT_LANGUAGE)
    .slice(0, 2)
    .toLowerCase();

  return supportedLanguages.includes(browserLanguage) ? browserLanguage : DEFAULT_LANGUAGE;
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

document.addEventListener('DOMContentLoaded', () => {
  loadLanguage(detectInitialLanguage());
});
