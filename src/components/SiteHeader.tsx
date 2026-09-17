import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/th";
import { PresetQuickSwitch } from "./controller/PresetQuickSwitch";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader({ locale, t }: { locale: Locale; t: Dictionary }) {
  const links = [
    { href: `/${locale}/`, label: t.nav.home },
    { href: `/${locale}/skills/`, label: t.nav.skills },
    { href: `/${locale}/controls/`, label: t.nav.controls },
    { href: `/${locale}/settings/`, label: t.nav.settings },
  ];

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-2.5 sm:px-6">
        <Link href={`/${locale}/`} className="font-display text-lg font-bold tracking-tight">
          EAFC <span className="text-accent">Skill Hub</span>
        </Link>

        <nav aria-label={t.nav.main} className="order-last -mx-1 flex w-full gap-1 overflow-x-auto text-sm md:order-none md:w-auto">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="whitespace-nowrap rounded-full px-3 py-1.5 text-muted hover:bg-surface-2 hover:text-fg">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <PresetQuickSwitch locale={locale} label={t.header.controller} />
          <LocaleSwitcher current={locale} label={t.header.language} />
          <ThemeToggle
            labels={{ theme: t.header.theme, system: t.header.themeSystem, light: t.header.themeLight, dark: t.header.themeDark }}
          />
        </div>
      </div>
    </header>
  );
}
