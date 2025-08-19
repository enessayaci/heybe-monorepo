// WXT browser API types
declare const browser: typeof chrome;

// Eğer chrome types da eksikse
declare namespace chrome {
  namespace i18n {
    function getMessage(messageName: string, substitutions?: string | string[]): string;
    function getUILanguage(): string;
  }
}