// app.js - generated automatically for the current index.html
// Handles language loading from external JSON files and applies translations

(() => {
  const SUPPORTED_LANGS = ["es", "en", "ca", "fr"];
  const DEFAULT_LANG = "es";
  const STORAGE_KEY = 'site-language';
  const SELECTOR_ID = "languageSwitcher";

  const state = {
    lang: DEFAULT_LANG,
    translations: {}
  };

  function getNestedValue(obj, path) {
    return path.split('.').reduce((acc, part) => (acc && Object.prototype.hasOwnProperty.call(acc, part)) ? acc[part] : undefined, obj);
  }

  async function loadLanguage(lang) {
    if (!SUPPORTED_LANGS.includes(lang)) lang = DEFAULT_LANG;
    if (state.translations[lang]) return state.translations[lang];

    const response = await fetch(`./${lang}.json`, { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error(`Unable to load language file: ${lang}.json (${response.status})`);
    }

    const data = await response.json();
    state.translations[lang] = data;
    return data;
  }

  function applyTranslations(dict) {
    // Text content
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const value = getNestedValue(dict, key);
      if (typeof value !== 'undefined') {
        el.textContent = value;
      }
    });

    // Attributes
    const attrMap = [
      ['data-i18n-alt', 'alt'],
      ['data-i18n-title', 'title'],
      ['data-i18n-placeholder', 'placeholder'],
      ['data-i18n-aria-label', 'aria-label']
    ];

    attrMap.forEach(([dataAttr, realAttr]) => {
      document.querySelectorAll(`[${dataAttr}]`).forEach(el => {
        const key = el.getAttribute(dataAttr);
        const value = getNestedValue(dict, key);
        if (typeof value !== 'undefined') {
          el.setAttribute(realAttr, value);
        }
      });
    });

    // Optional document-level metadata
    const pageTitle = getNestedValue(dict, 'meta.title');
    if (pageTitle) document.title = pageTitle;

    const metaDescription = document.querySelector('meta[name="description"]');
    const descValue = getNestedValue(dict, 'meta.description');
    if (metaDescription && descValue) metaDescription.setAttribute('content', descValue);

    document.documentElement.lang = state.lang;
  }

  function normalizeLanguage(lang) {
    if (!lang) return DEFAULT_LANG;
    const short = String(lang).toLowerCase().split('-')[0];
    return SUPPORTED_LANGS.includes(short) ? short : DEFAULT_LANG;
  }

  function getPreferredLanguage() {
    const saved = normalizeLanguage(localStorage.getItem(STORAGE_KEY));
    if (saved && SUPPORTED_LANGS.includes(saved)) return saved;

    const browserLang = normalizeLanguage(navigator.language || navigator.userLanguage || DEFAULT_LANG);
    return browserLang;
  }

  async function setLanguage(lang) {
    state.lang = normalizeLanguage(lang);
    const dict = await loadLanguage(state.lang);
    applyTranslations(dict);
    localStorage.setItem(STORAGE_KEY, state.lang);

    const switcher = document.getElementById(SELECTOR_ID);
    if (switcher) switcher.value = state.lang;
  }

  function bindLanguageSwitcher() {
    const switcher = document.getElementById(SELECTOR_ID);
    if (!switcher) return;
    switcher.addEventListener('change', (event) => {
      setLanguage(event.target.value).catch(err => console.error(err));
    });
  }

  function exposeDebugInfo() {
    window.i18n = {
      get language() { return state.lang; },
      setLanguage,
      loadLanguage,
      get translations() { return state.translations; }
    };
  }

  document.addEventListener('DOMContentLoaded', async () => {
    bindLanguageSwitcher();
    exposeDebugInfo();
    try {
      await setLanguage(getPreferredLanguage());
    } catch (error) {
      console.error('Error initializing translations:', error);
      if (state.lang !== DEFAULT_LANG) {
        try {
          await setLanguage(DEFAULT_LANG);
        } catch (fallbackError) {
          console.error('Fallback language failed:', fallbackError);
        }
      }
    }
  });
})();
