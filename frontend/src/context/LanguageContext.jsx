import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import translations, { supportedLanguages } from '../i18n/translations';

const fallbackLang = 'en';

const translate = (language, key) => {
  if (!key) return '';
  return (
    translations[language]?.[key] ??
    translations[fallbackLang]?.[key] ??
    key
  );
};

const LanguageContext = createContext({
  language: fallbackLang,
  setLanguage: () => {},
  t: (key) => translate(fallbackLang, key),
  supportedLanguages
});

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(
    localStorage.getItem('travooz_language') || fallbackLang
  );

  useEffect(() => {
    localStorage.setItem('travooz_language', language);
    // Update document lang attribute for accessibility
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      supportedLanguages,
      t: (key) => translate(language, key)
    }),
    [language]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguageContext = () => useContext(LanguageContext);

export default LanguageContext;




