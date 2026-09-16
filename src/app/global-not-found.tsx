import type { Metadata } from "next";
import Link from "next/link";
import { defaultLocale, LOCALE_STORAGE_KEY, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { bodyFont, headingFont } from "@/lib/fonts";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "404 · EAFC Skill Hub",
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// One static file serves every missing URL, so the language is picked in the browser:
// from the URL when it has one, then the saved choice. Without JavaScript both languages show.
const pickLanguageScript = `(function(){var ls=${JSON.stringify(locales)},l="${defaultLocale}";var seg=location.pathname.slice(${basePath.length}).split("/")[1];if(ls.indexOf(seg)>-1)l=seg;else try{var s=localStorage.getItem("${LOCALE_STORAGE_KEY}");if(ls.indexOf(s)>-1)l=s}catch(e){}document.documentElement.lang=l;document.getElementById("home").setAttribute("href","${basePath}/"+l+"/");document.querySelectorAll("[data-locale]").forEach(function(el){el.hidden=el.getAttribute("data-locale")!==l})})()`;

export default function GlobalNotFound() {
  return (
    <html lang={defaultLocale} className={`${bodyFont.variable} ${headingFont.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-dvh flex-col antialiased">
        <header className="border-b border-border">
          <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6">
            <Link id="home" href={`/${defaultLocale}/`} className="font-display text-lg font-bold tracking-tight">
              EAFC <span className="text-accent">Skill Hub</span>
            </Link>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-10 px-4 py-12 sm:px-6">
          <p className="font-display text-7xl font-bold text-accent" aria-hidden>
            404
          </p>
          {locales.map((locale) => {
            const t = getDictionary(locale).notFound;
            return (
              <section key={locale} data-locale={locale} lang={locale} className="max-w-prose space-y-4">
                <h1 className="font-display text-3xl font-bold sm:text-4xl">{t.title}</h1>
                <p className="text-lg text-muted">{t.body}</p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/${locale}/skills/`}
                    className="inline-flex h-11 items-center rounded-full bg-accent px-5 font-medium text-accent-fg hover:opacity-90"
                  >
                    {t.toSkills}
                  </Link>
                  <Link
                    href={`/${locale}/`}
                    className="inline-flex h-11 items-center rounded-full border border-control bg-surface px-5 font-medium hover:bg-surface-2"
                  >
                    {t.toHome}
                  </Link>
                </div>
              </section>
            );
          })}
        </main>
        <script dangerouslySetInnerHTML={{ __html: pickLanguageScript }} />
      </body>
    </html>
  );
}
