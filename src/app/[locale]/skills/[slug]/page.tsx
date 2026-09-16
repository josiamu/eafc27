import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DataBadge } from "@/components/DataBadge";
import { MoveAnimation } from "@/components/move/MoveAnimation";
import { MoveTrainer } from "@/components/move/MoveTrainer";
import { VideoSlot } from "@/components/move/VideoSlot";
import { Stars } from "@/components/Stars";
import { getMove, getMoves } from "@/data/moves";
import { fill, isLocale, pick } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export const dynamicParams = false;

export function generateStaticParams() {
  return getMoves().map((move) => ({ slug: move.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/skills/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const move = getMove(slug);
  if (!isLocale(locale) || !move) return {};
  return { title: pick(move.name, locale), description: pick(move.summary, locale) };
}

export default async function MovePage({ params }: PageProps<"/[locale]/skills/[slug]">) {
  const { locale, slug } = await params;
  const move = getMove(slug);
  if (!isLocale(locale) || !move) notFound();
  const t = getDictionary(locale);
  const followUps = move.followUps.map(getMove).filter((m) => m !== undefined);
  const sourceCount = new Set(move.sources).size;

  return (
    <article className="space-y-8">
      <nav>
        <Link href={`/${locale}/skills/`} className="text-sm text-muted hover:text-fg">
          ← {t.move.back}
        </Link>
      </nav>

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <Stars count={move.stars} label={fill(t.move.stars, { n: move.stars })} />
          <DataBadge label={t.dataBadge} />
          {move.verified ? (
            <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium">✓ {fill(t.move.verified, { n: sourceCount })}</span>
          ) : (
            <span className="rounded-full bg-warn-bg px-2.5 py-1 text-xs font-medium text-warn-fg">{t.move.unverified}</span>
          )}
        </div>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">{pick(move.name, locale)}</h1>
        <p className="max-w-prose text-lg text-muted">{pick(move.summary, locale)}</p>
        {!move.verified && <p className="max-w-prose rounded-xl bg-warn-bg px-3 py-2 text-sm text-warn-fg">{t.move.unverifiedNote}</p>}
      </header>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-bold">{t.move.watch}</h2>
        <MoveAnimation move={move} locale={locale} t={t.move} />
        <p className="text-xs text-muted">{t.move.stickNote}</p>
      </section>

      <MoveTrainer move={move} locale={locale} t={t.move} />

      <div className="grid gap-4 md:grid-cols-2">
        <section className="space-y-2 rounded-2xl border border-border bg-surface p-4">
          <h2 className="font-display text-lg font-bold">{t.move.when}</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {move.situations.map((situation) => (
              <li key={situation.en}>{pick(situation, locale)}</li>
            ))}
          </ul>
        </section>

        <section className="space-y-2 rounded-2xl border border-border bg-surface p-4">
          <h2 className="font-display text-lg font-bold">{t.move.details}</h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
            {move.contexts.length > 0 && (
              <>
                <dt className="text-muted">{t.move.contextLabel}</dt>
                <dd>{move.contexts.map((c) => t.move.contexts[c]).join(" · ")}</dd>
              </>
            )}
            <dt className="text-muted">{t.move.difficultyLabel}</dt>
            <dd>{t.move.difficulty[move.difficulty - 1]}</dd>
            {followUps.length > 0 && (
              <>
                <dt className="text-muted">{t.move.followUps}</dt>
                <dd className="flex flex-wrap gap-x-3">
                  {followUps.map((f) => (
                    <Link key={f.slug} href={`/${locale}/skills/${f.slug}/`} className="text-accent underline underline-offset-4">
                      {pick(f.name, locale)}
                    </Link>
                  ))}
                </dd>
              </>
            )}
          </dl>
        </section>
      </div>

      <VideoSlot url={move.video} title={pick(move.name, locale)} heading={t.move.video} />

      <section className="space-y-2">
        <h2 className="font-display text-lg font-bold">{t.move.sources}</h2>
        <ul className="space-y-1 text-sm">
          {move.sources.map((url) => (
            <li key={url}>
              <a href={url} target="_blank" rel="noreferrer" className="break-all text-muted underline underline-offset-4 hover:text-fg">
                {new URL(url).hostname.replace(/^www\./, "")}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
