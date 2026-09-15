export const locales = ["th", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "th";
export const LOCALE_STORAGE_KEY = "eafc.locale";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** A field stored in both languages. */
export type Localized = Record<Locale, string>;
export function pick(text: Localized, locale: Locale): string {
  return text[locale];
}

/** Fill "{name}" placeholders in a dictionary string. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}
