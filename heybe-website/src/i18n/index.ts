export { useTranslation, TranslationProvider } from './context'
export type { Language } from './context'

// Desteklenen diller
export const SUPPORTED_LANGUAGES = ['tr', 'en'] as const
export const DEFAULT_LANGUAGE = 'tr'
export const FALLBACK_LANGUAGE = 'en'

// Dil seçenekleri UI için
export const LANGUAGE_OPTIONS = [
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' }
] as const