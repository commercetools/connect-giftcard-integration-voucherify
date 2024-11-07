import { Translations } from './definitions';
import { normalizeLanguageCode } from './utils';

export const defaultLanguage = 'en';

export default class I18n {
  protected translations: Translations;
  constructor(translations: Translations) {
    this.translations = translations;
  }

  translate(key: string, lang: string | undefined): string {
    const normalizedLang = normalizeLanguageCode(lang || defaultLanguage);
    if (!this.translations[normalizedLang]) {
      console.info(`Language '${lang}' not supported`);
    }
    return this.translations[normalizedLang]?.[key] || this.translations[defaultLanguage]?.[key] || key;
  }
}
