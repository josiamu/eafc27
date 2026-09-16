import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DataBadge } from "@/components/DataBadge";
import { SkillsBrowser, type MoveCard } from "@/components/move/SkillsBrowser";
import { getMoves } from "@/data/moves";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: PageProps<"/[locale]/skills">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return pageMetadata(locale, "skills/", { title: t.skills.title, description: t.skills.lead });
}

export default async function SkillsPage({ params }: PageProps<"/[locale]/skills">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);

  // Filtering happens in the browser, so send only the fields a card draws.
  const moves: MoveCard[] = getMoves().map(({ slug, name, summary, stars, difficulty, verified, sequence }) => ({
    slug,
    name,
    summary,
    stars,
    difficulty,
    verified,
    sequence,
  }));

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">{t.skills.title}</h1>
        <p className="max-w-prose text-muted">{t.skills.lead}</p>
        <DataBadge label={t.dataBadge} href={`/${locale}/about/`} />
      </header>

      <SkillsBrowser moves={moves} locale={locale} t={t.skills} tMove={t.move} />
    </div>
  );
}
