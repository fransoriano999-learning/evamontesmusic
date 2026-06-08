const languageSwitcher = document.getElementById('languageSwitcher');
const supportedLanguages = ['es', 'en', 'ca', 'fr'];

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, part) => {
    if (acc === undefined || acc === null) return undefined;
    if (/^\d+$/.test(part)) return acc[Number(part)];
    return acc[part];
  }, obj);
}

async function loadLanguage(lang) {
  const targetLang = supportedLanguages.includes(lang) ? lang : 'es';
  try {
    const response = await fetch(`lang/${targetLang}.json`, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`No se pudo cargar ${targetLang}.json`);
    const translations = await response.json();

    document.documentElement.lang = targetLang;

    document.querySelectorAll('[data-i18n]').forEach((element) => {
      const key = element.getAttribute('data-i18n');
      const value = getNestedValue(translations, key);
      if (value !== undefined) element.textContent = value;
    });

    document.querySelectorAll('[data-i18n-alt]').forEach((element) => {
      const key = element.getAttribute('data-i18n-alt');
      const value = getNestedValue(translations, key);
      if (value !== undefined) element.setAttribute('alt', value);
    });

    document.querySelectorAll('[data-i18n-aria-label]').forEach((element) => {
      const key = element.getAttribute('data-i18n-aria-label');
      const value = getNestedValue(translations, key);
      if (value !== undefined) element.setAttribute('aria-label', value);
    });

    document.querySelectorAll('[data-i18n-content]').forEach((element) => {
      const key = element.getAttribute('data-i18n-content');
      const value = getNestedValue(translations, key);
      if (value !== undefined) element.setAttribute('content', value);
    });

    localStorage.setItem('siteLanguage', targetLang);
    if (languageSwitcher) languageSwitcher.value = targetLang;
  } catch (error) {
    console.error('Error cargando idioma:', error);
    if (targetLang !== 'es') await loadLanguage('es');
  }
}

function detectInitialLanguage() {
  const savedLanguage = localStorage.getItem('siteLanguage');
  if (savedLanguage && supportedLanguages.includes(savedLanguage)) return savedLanguage;
  const browserLanguage = (navigator.language || navigator.userLanguage || 'es').slice(0, 2).toLowerCase();
  return supportedLanguages.includes(browserLanguage) ? browserLanguage : 'es';
}

if (languageSwitcher) {
  languageSwitcher.addEventListener('change', (event) => loadLanguage(event.target.value));
}

document.querySelectorAll('.main-nav a').forEach((link) => {
  link.addEventListener('click', () => {
    const toggle = document.getElementById('nav-toggle');
    if (toggle) toggle.checked = false;
  });
});

document.addEventListener('DOMContentLoaded', () => loadLanguage(detectInitialLanguage()));
