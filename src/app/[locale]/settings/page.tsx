import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SettingsView } from "@/components/controller/SettingsView";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata({ params }: PageProps<"/[locale]/settings">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return { title: t.settings.title, description: t.settings.lead };
}

export default async function SettingsPage({ params }: PageProps<"/[locale]/settings">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <SettingsView locale={locale} t={getDictionary(locale).settings} />;
}
