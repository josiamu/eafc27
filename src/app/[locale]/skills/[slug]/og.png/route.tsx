import { getMove, getMoves } from "@/data/moves";
import { fill, isLocale, locales, pick } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { ogImage } from "@/lib/og-image";

export const dynamic = "force-static";
export const dynamicParams = false;

// Route handlers don't inherit the layout's locales, so list every pair here.
export function generateStaticParams() {
  return locales.flatMap((locale) => getMoves().map((move) => ({ locale, slug: move.slug })));
}

export async function GET(_request: Request, { params }: RouteContext<"/[locale]/skills/[slug]/og.png">) {
  const { locale: raw, slug } = await params;
  const locale = isLocale(raw) ? raw : "th";
  const move = getMove(slug);
  if (!move) return new Response("Not found", { status: 404 });
  const t = getDictionary(locale);
  return ogImage({
    title: pick(move.name, locale),
    subtitle: pick(move.summary, locale),
    stars: move.stars,
    footer: `${fill(t.move.stars, { n: move.stars })} · ${t.dataBadge}`,
  });
}
