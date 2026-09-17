import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DataBadge } from "@/components/DataBadge";
import { getControlGroups } from "@/data/controls";
import { getMoves } from "@/data/moves";
import { fill, isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { pageMetadata } from "@/lib/metadata";
import { NEW_ISSUE_URL } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[locale]/about">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return pageMetadata(locale, "about/", { title: t.about.title, description: t.about.lead });
}

const hostOf = (url: string) => new URL(url).hostname.replace(/^www\./, "");

/** Each site the data cites: how many moves cite it and whether the controls page does, most-cited first. */
function sourceSites() {
  const counts = new Map<string, number>();
  for (const move of getMoves()) {
    for (const host of new Set(move.sources.map(hostOf))) counts.set(host, (counts.get(host) ?? 0) + 1);
  }
  const controlHosts = new Set(getControlGroups().flatMap((group) => group.sources.map(hostOf)));
  for (const host of controlHosts) if (!counts.has(host)) counts.set(host, 0);
  return [...counts]
    .map(([host, moves]) => ({ host, moves, controls: controlHosts.has(host) }))
    .sort((a, b) => b.moves - a.moves || a.host.localeCompare(b.host));
}

export default async function AboutPage({ params }: PageProps<"/[locale]/about">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale).about;
  const dataBadge = getDictionary(locale).dataBadge;

  return (
    <article className="max-w-prose space-y-10">
      <header className="space-y-3">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">{t.title}</h1>
        <p className="text-lg text-muted">{t.lead}</p>
        <DataBadge label={dataBadge} />
      </header>

      <section className="space-y-2">
        <h2 className="font-display text-xl font-bold">{t.versionTitle}</h2>
        <p>{t.versionBody}</p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-bold">{t.checkTitle}</h2>
        <ol className="list-decimal space-y-1.5 pl-5">
          {t.checkSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-bold">{t.sourcesTitle}</h2>
        <ul className="divide-y divide-border rounded-2xl border border-border bg-surface">
          {sourceSites().map(({ host, moves, controls }) => (
            <li key={host} className="flex flex-wrap items-baseline justify-between gap-x-4 px-4 py-2.5">
              <span className="font-medium">{host}</span>
              <span className="text-sm text-muted tabular-nums">
                {[moves > 0 && fill(t.sourcesCount, { n: moves }), controls && t.sourcesControls].filter(Boolean).join(" · ")}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-bold">{t.reportTitle}</h2>
        <p>{t.reportBody}</p>
        <ul className="list-disc space-y-1 pl-5 text-muted">
          {t.reportChecklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <a
          href={NEW_ISSUE_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-11 items-center rounded-full bg-accent px-5 font-medium text-accent-fg hover:opacity-90"
        >
          {t.reportCta}
        </a>
      </section>
    </article>
  );
}
