
import React, { createContext, useState, useContext, PropsWithChildren } from 'react';
import { translations, Language } from '../translations';

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  getTranslation: (lang: Language, key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Fix: Use PropsWithChildren to correctly type the component and resolve errors
// in App.tsx where LanguageProvider was reported as missing a 'children' prop.
export const LanguageProvider = ({ children }: PropsWithChildren) => {
  const [language, setLanguage] = useState<Language>('bn');

  const getTranslation = (lang: Language, key: string): string => {
    const keys = key.split('.');
    let result: any = translations[lang];
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        return key;
      }
    }
    return result || key;
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let result: any = translations[language];
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        // Fallback to English if translation is missing
        let fallbackResult: any = translations['en'];
        for (const fk of keys) {
            fallbackResult = fallbackResult?.[fk];
        }
        return fallbackResult || key;
      }
    }
    return result || key;
  };
  

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, getTranslation }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};