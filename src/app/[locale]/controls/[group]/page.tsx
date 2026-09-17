import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ControlGroupNav } from "@/components/controls/ControlGroupNav";
import { ControlList } from "@/components/controls/ControlList";
import { DataBadge } from "@/components/DataBadge";
import { getControlGroup, getControlGroups } from "@/data/controls";
import { fill, isLocale, pick } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { pageMetadata } from "@/lib/metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return getControlGroups().map((group) => ({ group: group.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/controls/[group]">): Promise<Metadata> {
  const { locale, group: slug } = await params;
  const group = getControlGroup(slug);
  if (!isLocale(locale) || !group) return {};
  const t = getDictionary(locale);
  return pageMetadata(locale, `controls/${slug}/`, {
    title: `${pick(group.title, locale)} · ${t.controls.title}`,
    description: pick(group.summary, locale),
  });
}

export default async function ControlGroupPage({ params }: PageProps<"/[locale]/controls/[group]">) {
  const { locale, group: slug } = await params;
  const group = getControlGroup(slug);
  if (!isLocale(locale) || !group) notFound();
  const t = getDictionary(locale);
  const groups = getControlGroups();
  // By slug, not identity: in dev every call re-reads the files and returns new objects.
  const index = groups.findIndex((g) => g.slug === group.slug);
  const neighbours = [
    { group: groups[index - 1], label: t.controls.prev, arrow: "←" },
    { group: groups[index + 1], label: t.controls.next, arrow: "→" },
  ];

  return (
    <article className="space-y-8">
      <nav>
        <Link href={`/${locale}/controls/`} className="text-sm text-muted hover:text-fg">
          ← {t.controls.back}
        </Link>
      </nav>

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <DataBadge label={t.dataBadge} href={`/${locale}/about/`} />
          <span className="text-sm text-muted tabular-nums">{fill(t.controls.count, { n: group.controls.length })}</span>
        </div>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">{pick(group.title, locale)}</h1>
        <p className="max-w-prose text-lg text-muted">{pick(group.summary, locale)}</p>
        <p className="max-w-prose text-sm text-muted">{t.controls.classicNote}</p>
        <ControlGroupNav groups={groups} current={group.slug} locale={locale} label={t.controls.groups} />
      </header>

      <ControlList controls={group.controls} locale={locale} t={t} />

      <nav aria-label={t.controls.others} className="grid gap-3 sm:grid-cols-2">
        {neighbours.map(({ group: other, label, arrow }, i) =>
          other ? (
            <Link
              key={other.slug}
              href={`/${locale}/controls/${other.slug}/`}
              className={`rounded-2xl border border-border bg-surface p-4 hover:border-accent ${i === 1 ? "sm:col-start-2 sm:text-right" : ""}`}
            >
              <span className="block text-xs text-muted">
                {i === 0 && `${arrow} `}
                {label}
                {i === 1 && ` ${arrow}`}
              </span>
              <span className="font-medium">{pick(other.title, locale)}</span>
            </Link>
          ) : null,
        )}
      </nav>

      <section className="space-y-2">
        <h2 className="font-display text-lg font-bold">{t.controls.sources}</h2>
        <ul className="space-y-1 text-sm">
          {group.sources.map((url) => (
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
