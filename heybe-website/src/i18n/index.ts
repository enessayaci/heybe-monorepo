export { useTranslation } from './hooks/useTranslation'
export type { Language } from './hooks/useTranslation'

// Desteklenen diller
export const SUPPORTED_LANGUAGES = ['tr', 'en'] as const
export const DEFAULT_LANGUAGE = 'tr'
export const FALLBACK_LANGUAGE = 'en'

// Dil seçenekleri UI için
export const LANGUAGE_OPTIONS = [
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' }
] as const