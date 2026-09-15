import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DataBadge } from "@/components/DataBadge";
import { InputSequence } from "@/components/move/InputSequence";
import { Stars } from "@/components/Stars";
import { getMoves } from "@/data/moves";
import { fill, isLocale, pick } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata({ params }: PageProps<"/[locale]/skills">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return { title: t.skills.title, description: t.skills.lead };
}

export default async function SkillsPage({ params }: PageProps<"/[locale]/skills">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const moves = getMoves();
  const starLevels = [...new Set(moves.map((m) => m.stars))];

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">{t.skills.title}</h1>
        <p className="max-w-prose text-muted">{t.skills.lead}</p>
        <DataBadge label={t.dataBadge} />
      </header>

      {starLevels.map((stars) => (
        <section key={stars} className="space-y-3">
          <h2 className="font-display text-xl font-medium">{fill(t.skills.starsGroup, { n: stars })}</h2>
          <ul className="grid gap-3 md:grid-cols-2">
            {moves
              .filter((m) => m.stars === stars)
              .map((move) => (
                <li key={move.slug}>
                  <Link
                    href={`/${locale}/skills/${move.slug}/`}
                    className="block h-full space-y-3 rounded-2xl border border-border bg-surface p-4 hover:border-accent"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-display text-lg font-medium">{pick(move.name, locale)}</h3>
                        <p className="text-sm text-muted">{pick(move.summary, locale)}</p>
                      </div>
                      <Stars count={move.stars} label={fill(t.move.stars, { n: move.stars })} />
                    </div>
                    <InputSequence sequence={move.sequence} locale={locale} t={t.move} compact />
                    {!move.verified && (
                      <span className="inline-block rounded-full bg-warn-bg px-2 py-0.5 text-xs text-warn-fg">{t.move.unverified}</span>
                    )}
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
