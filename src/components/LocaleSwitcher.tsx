"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALE_STORAGE_KEY, locales, type Locale } from "@/i18n/config";

const labels: Record<Locale, string> = { th: "ไทย", en: "EN" };

function swapLocale(pathname: string, locale: Locale) {
  const parts = pathname.split("/");
  // pathname looks like "/th/settings/" (basePath is already stripped by Next).
  parts[1] = locale;
  return parts.join("/") || `/${locale}/`;
}

export function LocaleSwitcher({ current, label }: { current: Locale; label: string }) {
  const pathname = usePathname() ?? `/${current}/`;

  return (
    <nav aria-label={label} className="inline-flex h-9 items-center rounded-full border border-control bg-surface p-0.5 text-sm">
      {locales.map((locale) => {
        const active = locale === current;
        return (
          <Link
            key={locale}
            href={swapLocale(pathname, locale)}
            hrefLang={locale}
            aria-current={active ? "true" : undefined}
            onClick={() => {
              try {
                localStorage.setItem(LOCALE_STORAGE_KEY, locale);
              } catch {}
            }}
            className={`rounded-full px-3 py-1.5 leading-none ${active ? "bg-fg text-bg" : "text-muted hover:text-fg"}`}
          >
            {labels[locale]}
          </Link>
        );
      })}
    </nav>
  );
}
