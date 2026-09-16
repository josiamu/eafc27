import type { Metadata } from "next";
import { defaultLocale, locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { OG_SIZE } from "@/lib/og-image";

const OG_LOCALE: Record<Locale, string> = { th: "th_TH", en: "en_US" };

/**
 * Metadata for one page in both languages. `path` is the part after the locale, e.g. "skills/" or "".
 * `image` is the og.png route to share; pages without their own use the language's card.
 * Nested metadata objects replace their parent's wholesale, so every page sets all of openGraph here.
 */
export function pageMetadata(locale: Locale, path: string, page: { title?: string; description: string; image?: string }): Metadata {
  const site = getDictionary(locale).meta.title;
  const title = page.title ?? site;
  const url = (l: Locale) => `${l}/${path}`;
  const image = { url: page.image ?? `${locale}/og.png`, ...OG_SIZE, type: "image/png", alt: title };

  return {
    ...(page.title && { title: page.title }),
    description: page.description,
    alternates: {
      canonical: url(locale),
      languages: { ...Object.fromEntries(locales.map((l) => [l, url(l)])), "x-default": url(defaultLocale) },
    },
    openGraph: {
      type: "website",
      siteName: site,
      title,
      description: page.description,
      url: url(locale),
      locale: OG_LOCALE[locale],
      alternateLocale: locales.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
      images: [image],
    },
    twitter: { card: "summary_large_image", title, description: page.description, images: [image] },
  };
}
