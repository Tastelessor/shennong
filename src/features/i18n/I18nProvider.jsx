import React, { createContext, useContext, useState } from 'react';
import { translations } from '.';

const I18nContext = createContext();

export const I18nProvider = ({ children }) => {
  const [lang, setLang] = useState('zh');

  const t = (key) => {
    return translations[lang][key] || key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);