import { useState, useEffect } from "react";
import trTranslations from "../locales/tr.json";
import enTranslations from "../locales/en.json";

export type Language = "tr" | "en";
type TranslationKey = string;

const translations = {
  tr: trTranslations,
  en: enTranslations,
};

const getNestedValue = (obj: any, path: string): string => {
  return path.split(".").reduce((current, key) => current?.[key], obj) || path;
};

export function useTranslation() {
  const [language, setLanguage] = useState<Language>(() => {
    // 1. localStorage'dan kontrol et
    const saved = localStorage.getItem("heybe-language") as Language;
    if (saved && ["tr", "en"].includes(saved)) return saved;

    // 2. Browser dilini kontrol et
    const browserLang = navigator.language.split("-")[0] as Language;
    if (["tr", "en"].includes(browserLang)) return browserLang;

    // 3. Fallback to English
    return "en";
  });

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("heybe-language", lang);
  };

  const t = (key: TranslationKey): string => {
    return getNestedValue(translations[language], key) || key;
  };

  return {
    language,
    changeLanguage,
    t,
    isLoading: false,
  };
}
