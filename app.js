// app.js - aligned package version
(() => {
  const SUPPORTED_LANGS = ['es', 'ca', 'en', 'fr'];
  const DEFAULT_LANG = 'es';
  const STORAGE_KEY = 'site-language';
  const SELECTOR_ID = 'languageSwitcher';
  const ATTR_MAP = [
    ['data-i18n', null],
    ['data-i18n-alt', 'alt'],
    ['data-i18n-title', 'title'],
    ['data-i18n-placeholder', 'placeholder'],
    ['data-i18n-aria-label', 'aria-label'],
    ['data-i18n-content', 'content'],
    ['data-i18n-href', 'href'],
    ['data-i18n-value', 'value']
  ];

  const cache = {};

  function getByPath(obj, path) {
    if (!obj || !path) return undefined;
    return path.split('.').reduce((acc, part) => (acc !== undefined && acc !== null) ? acc[part] : undefined, obj);
  }

  function normalizeLang(lang) {
    const short = String(lang || '').toLowerCase().split('-')[0];
    return SUPPORTED_LANGS.includes(short) ? short : DEFAULT_LANG;
  }

  async function loadLanguage(lang) {
    const current = normalizeLang(lang);
    if (cache[current]) return cache[current];
    const response = await fetch(`./${current}.json`, { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error(`Cannot load ${current}.json (${response.status})`);
    }
    const data = await response.json();
    cache[current] = data;
    return data;
  }

  function applyTranslation(dict, fallbackDict) {
    ATTR_MAP.forEach(([dataAttr, targetAttr]) => {
      document.querySelectorAll(`[${dataAttr}]`).forEach(el => {
        const key = el.getAttribute(dataAttr);
        let value = getByPath(dict, key);
        if (value === undefined && fallbackDict) {
          value = getByPath(fallbackDict, key);
        }
        if (typeof value !== 'string') return;

        if (targetAttr === null) {
          el.textContent = value;
        } else {
          el.setAttribute(targetAttr, value);
        }
      });
    });

    const pageTitle = getByPath(dict, 'meta.title') || (fallbackDict && getByPath(fallbackDict, 'meta.title'));
    if (typeof pageTitle === 'string' && pageTitle.trim()) {
      document.title = pageTitle;
    }

    const htmlLang = document.documentElement;
    if (htmlLang) {
      htmlLang.lang = normalizeLang(localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG);
    }
  }

  function getPreferredLanguage() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return normalizeLang(saved);
    return normalizeLang(navigator.language || DEFAULT_LANG);
  }

  async function setLanguage(lang) {
    const current = normalizeLang(lang);
    const [dict, fallbackDict] = await Promise.all([
      loadLanguage(current),
      current === DEFAULT_LANG ? Promise.resolve(null) : loadLanguage(DEFAULT_LANG)
    ]);
    applyTranslation(dict, fallbackDict);
    localStorage.setItem(STORAGE_KEY, current);
    document.documentElement.lang = current;
    const selector = document.getElementById(SELECTOR_ID);
    if (selector) selector.value = current;
    return current;
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const selector = document.getElementById(SELECTOR_ID);
    if (selector) {
      selector.addEventListener('change', event => {
        setLanguage(event.target.value).catch(error => console.error('Language switch error:', error));
      });
    }

    try {
      await setLanguage(getPreferredLanguage());
    } catch (error) {
      console.error('i18n initialization failed:', error);
      if (DEFAULT_LANG !== 'es') {
        try { await setLanguage('es'); } catch (_) {}
      }
    }
  });

  window.i18n = {
    setLanguage,
    loadLanguage,
    normalizeLang
  };
})();
