import type { MetadataRoute } from "next";
import { getMoves } from "@/data/moves";
import { defaultLocale, locales } from "@/i18n/config";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

/** Every page in both languages, each entry naming its translation, as the pages' hreflang links do. */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "skills/", "controls/", "settings/", "about/", ...getMoves().map((move) => `skills/${move.slug}/`)];
  const url = (locale: string, path: string) => new URL(`${locale}/${path}`, SITE_URL).href;

  return paths.flatMap((path) =>
    locales.map((locale) => ({
      url: url(locale, path),
      alternates: {
        languages: { ...Object.fromEntries(locales.map((l) => [l, url(l, path)])), "x-default": url(defaultLocale, path) },
      },
    })),
  );
}
