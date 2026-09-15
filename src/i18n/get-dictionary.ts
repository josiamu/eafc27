import type { Locale } from "./config";
import en from "./dictionaries/en";
import th, { type Dictionary } from "./dictionaries/th";

const dictionaries: Record<Locale, Dictionary> = { th, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export type { Dictionary };
