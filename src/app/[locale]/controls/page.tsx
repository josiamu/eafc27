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

  return (
    <div className="space-y-8">
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

      <ul className="grid gap-3 md:grid-cols-2">
        {getControlGroups().map((group) => (
          <li key={group.slug}>
            <Link
              href={`/${locale}/controls/${group.slug}/`}
              className="block h-full space-y-3 rounded-2xl border border-border bg-surface p-4 hover:border-accent"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-medium">{pick(group.title, locale)}</h2>
                  <p className="text-sm text-muted">{pick(group.summary, locale)}</p>
                </div>
                <span className="shrink-0 text-sm text-muted tabular-nums">{fill(t.controls.count, { n: group.controls.length })}</span>
              </div>
              <dl className="space-y-2">
                {group.controls
                  .filter((control) => control.featured)
                  .map((control) => (
                    <div key={control.name.en} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                      <dt className="text-sm">{pick(control.name, locale)}</dt>
                      <dd>
                        <InputSequence sequence={control.ways[0]} locale={locale} t={t.move} compact />
                      </dd>
                    </div>
                  ))}
              </dl>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
