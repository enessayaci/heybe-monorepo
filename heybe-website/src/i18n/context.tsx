import React, { createContext, useContext, useState, ReactNode } from 'react';
import trTranslations from './locales/tr.json';
import enTranslations from './locales/en.json';

export type Language = 'tr' | 'en';
type TranslationKey = string;

const translations = {
  tr: trTranslations,
  en: enTranslations,
};

const getNestedValue = (obj: any, path: string, returnObjects = false): any => {
  const result = path.split('.').reduce((current, key) => current?.[key], obj);
  
  if (result === undefined) return path;
  
  // Eğer returnObjects true ise ve result bir object ise, object'i döndür
  if (returnObjects && typeof result === 'object' && result !== null) {
    return result;
  }
  
  // Eğer returnObjects false ise ve result bir object ise, string'e çevir
  if (!returnObjects && typeof result === 'object' && result !== null) {
    return path; // Object'i string olarak döndüremeyiz, key'i döndür
  }
  
  return result;
};

interface TranslationOptions {
  returnObjects?: boolean;
}

interface TranslationContextType {
  language: Language;
  changeLanguage: (lang: Language) => void;
  t: (key: TranslationKey, options?: TranslationOptions) => any;
  isLoading: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

interface TranslationProviderProps {
  children: ReactNode;
}

export function TranslationProvider({ children }: TranslationProviderProps) {
  const [language, setLanguage] = useState<Language>(() => {
    // 1. localStorage'dan kontrol et
    const saved = localStorage.getItem('heybe-language') as Language;
    if (saved && ['tr', 'en'].includes(saved)) return saved;

    // 2. Browser dilini kontrol et
    const browserLang = navigator.language.split('-')[0] as Language;
    if (['tr', 'en'].includes(browserLang)) return browserLang;

    // 3. Fallback to English
    return 'en';
  });

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('heybe-language', lang);
  };

  const t = (key: TranslationKey, options?: TranslationOptions): any => {
    return getNestedValue(translations[language], key, options?.returnObjects);
  };

  const value = {
    language,
    changeLanguage,
    t,
    isLoading: false,
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}