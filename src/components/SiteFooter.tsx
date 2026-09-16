import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/th";
import { ISSUES_URL } from "@/lib/site";

export function SiteFooter({ locale, t }: { locale: Locale; t: Dictionary }) {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-sm text-muted sm:px-6">
        <p>{t.footer.note}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <Link href={`/${locale}/about/`} className="underline underline-offset-4 hover:text-fg">
            {t.nav.about}
          </Link>
          <a href={ISSUES_URL} className="underline underline-offset-4 hover:text-fg" target="_blank" rel="noreferrer">
            {t.footer.report}
          </a>
        </div>
      </div>
    </footer>
  );
}
