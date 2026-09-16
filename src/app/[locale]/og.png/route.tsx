import { isLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { ogImage } from "@/lib/og-image";

// A route rather than opengraph-image.tsx: that convention exports a file with no extension,
// which GitHub Pages serves as application/octet-stream.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

/** The card for every page in this language that doesn't draw its own. */
export async function GET(_request: Request, { params }: RouteContext<"/[locale]/og.png">) {
  const { locale } = await params;
  const t = getDictionary(isLocale(locale) ? locale : "th");
  return ogImage({ title: t.home.title, subtitle: t.home.lead, footer: t.dataBadge });
}
