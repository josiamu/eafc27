import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DataBadge } from "@/components/DataBadge";
import { InputSequence } from "@/components/move/InputSequence";
import { getControlGroups } from "@/data/controls";
import { fill, isLocale, pick } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: PageProps<"/[locale]/controls">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return pageMetadata(locale, "controls/", { title: t.controls.title, description: t.controls.lead });
}

export default async function ControlsPage({ params }: PageProps<"/[locale]/controls">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const groups = getControlGroups();
  const sources = [...new Set(groups.flatMap((group) => group.sources))];

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">{t.controls.title}</h1>
        <p className="max-w-prose text-muted">{t.controls.lead}</p>
        <DataBadge label={t.dataBadge} href={`/${locale}/about/`} />
        <p className="max-w-prose text-sm text-muted">
          {t.controls.classicNote}{" "}
          <Link href={`/${locale}/settings/`} className="underline underline-offset-4 hover:text-fg">
            {t.controls.remapLink}
          </Link>
        </p>
      </header>

      <nav aria-label={t.controls.jump}>
        <ul className="flex flex-wrap gap-2">
          {groups.map((group) => (
            <li key={group.slug}>
              <a
                href={`#${group.slug}`}
                className="inline-flex h-9 items-center rounded-full border border-control bg-surface px-3 text-sm hover:bg-surface-2"
              >
                {pick(group.title, locale)}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {groups.map((group) => (
        <section key={group.slug} id={group.slug} aria-labelledby={`${group.slug}-title`} className="space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4">
            <h2 id={`${group.slug}-title`} className="font-display text-2xl font-bold">
              {pick(group.title, locale)}
            </h2>
            <span className="text-sm text-muted tabular-nums">{fill(t.controls.count, { n: group.controls.length })}</span>
          </div>
          <p className="max-w-prose text-muted">{pick(group.summary, locale)}</p>

          <ul className="divide-y divide-border rounded-2xl border border-border bg-surface">
            {group.controls.map((control) => (
              <li key={control.name.en} className="grid gap-2 px-4 py-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:items-center sm:gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{pick(control.name, locale)}</span>
                    {!control.verified && (
                      <span className="rounded-full bg-warn-bg px-2 py-0.5 text-xs font-medium text-warn-fg">{t.move.unverified}</span>
                    )}
                  </div>
                  {control.note && <p className="text-sm text-muted">{pick(control.note, locale)}</p>}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {control.ways.map((way, i) => (
                    <div key={i} className="flex flex-wrap items-center gap-2">
                      {i > 0 && <span className="text-sm text-muted">{t.controls.or}</span>}
                      <InputSequence sequence={way} locale={locale} t={t.move} compact />
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section className="space-y-2">
        <h2 className="font-display text-xl font-bold">{t.controls.sources}</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {sources.map((url) => (
            <li key={url}>
              <a href={url} target="_blank" rel="noreferrer" className="break-all underline underline-offset-4 hover:text-accent">
                {url}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
