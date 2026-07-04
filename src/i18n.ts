import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import arTranslations from './locales/ar.json';
import enTranslations from './locales/en.json';

const savedLang = localStorage.getItem('siyagha_lang') || 'ar';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ar: { translation: arTranslations },
      en: { translation: enTranslations },
    },
    lng: savedLang,
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

export default i18n;
