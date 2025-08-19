/**
 * Get translated message using browser.i18n API
 * @param key - Message key from messages.json
 * @param substitutions - Optional substitutions for placeholders
 * @returns Translated message
 */
export const t = (key: string, substitutions?: string | string[]): string => {
  // WXT'de browser global olarak mevcut
  return browser.i18n.getMessage(key, substitutions) || key;
};

/**
 * Get current locale
 * @returns Current locale (e.g., 'en', 'tr')
 */
export const getCurrentLocale = (): string => {
  return browser.i18n.getUILanguage();
};

/**
 * Check if current locale is RTL
 * @returns True if RTL, false otherwise
 */
export const isRTL = (): boolean => {
  const rtlLocales = ['ar', 'he', 'fa', 'ur'];
  return rtlLocales.includes(getCurrentLocale().split('-')[0]);
};