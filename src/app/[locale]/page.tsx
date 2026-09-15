import Link from "next/link";
import { notFound } from "next/navigation";
import { ButtonGlyph } from "@/components/controller/ButtonGlyph";
import { DataBadge } from "@/components/DataBadge";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);

  return (
    <div className="space-y-12">
      <section className="grid items-center gap-8 md:grid-cols-[1.2fr_1fr]">
        <div className="space-y-5">
          <p className="text-sm font-medium tracking-wide text-accent">{t.home.eyebrow}</p>
          <h1 className="font-display text-4xl leading-tight font-bold text-balance sm:text-5xl">{t.home.title}</h1>
          <p className="max-w-prose text-lg text-muted">{t.home.lead}</p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/${locale}/settings/`}
              className="inline-flex h-11 items-center rounded-full bg-accent px-5 font-medium text-accent-fg hover:opacity-90"
            >
              {t.home.ctaSettings}
            </Link>
            <Link
              href={`/${locale}/skills/`}
              className="inline-flex h-11 items-center rounded-full border border-border bg-surface px-5 font-medium hover:bg-surface-2"
            >
              {t.home.ctaSkills}
            </Link>
          </div>
          <DataBadge label={t.dataBadge} />
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-display text-lg font-medium">{t.home.previewTitle}</h2>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <ButtonGlyph id="FACE_BOTTOM" size="lg" />
            <ButtonGlyph id="FACE_RIGHT" size="lg" />
            <ButtonGlyph id="FACE_LEFT" size="lg" />
            <ButtonGlyph id="FACE_TOP" size="lg" />
            <ButtonGlyph id="SHOULDER_L1" size="lg" />
            <ButtonGlyph id="SHOULDER_R1" size="lg" />
            <ButtonGlyph id="TRIGGER_L2" size="lg" />
            <ButtonGlyph id="TRIGGER_R2" size="lg" />
            <ButtonGlyph id="STICK_L" size="lg" />
            <ButtonGlyph id="STICK_R" size="lg" direction="up" />
          </div>
          <p className="mt-4 text-sm text-muted">{t.home.previewNote}</p>
        </div>
      </section>

      <ol className="grid gap-4 sm:grid-cols-3">
        {t.home.steps.map((step, i) => (
          <li key={step.title} className="rounded-2xl border border-border bg-surface p-5">
            <span className="font-display text-3xl font-bold text-accent">{i + 1}</span>
            <h2 className="mt-2 font-display text-lg font-medium">{step.title}</h2>
            <p className="mt-1 text-sm text-muted">{step.body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
