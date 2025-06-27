import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Importar traducciones
import enTranslations from './locales/en.json';
import esTranslations from './locales/es.json';

// Detectar idioma del navegador o usar español por defecto
const getDefaultLanguage = () => {
  const savedLanguage = localStorage.getItem('i18nextLng');
  if (savedLanguage) return savedLanguage;
  
  const browserLanguage = navigator.language || navigator.userLanguage;
  if (browserLanguage.startsWith('es')) return 'es';
  return 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations
      },
      es: {
        translation: esTranslations
      }
    },
    lng: getDefaultLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n; 