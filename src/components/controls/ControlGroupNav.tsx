import Link from "next/link";
import type { ControlGroup } from "@/data/control-schema";
import { pick, type Locale } from "@/i18n/config";

/** Links to every control group; the one being viewed is highlighted. Scrolls sideways on phones, wraps on wider screens. */
export function ControlGroupNav({
  groups,
  current,
  locale,
  label,
}: {
  groups: ControlGroup[];
  current?: string;
  locale: Locale;
  label: string;
}) {
  return (
    <nav aria-label={label} className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:overflow-visible sm:px-0">
      <ul className="flex w-max gap-2 pb-1 sm:w-auto sm:flex-wrap sm:pb-0">
        {groups.map((group) => {
          const active = group.slug === current;
          return (
            <li key={group.slug}>
              <Link
                href={`/${locale}/controls/${group.slug}/`}
                aria-current={active ? "page" : undefined}
                className={`inline-flex h-9 items-center whitespace-nowrap rounded-full border px-3 text-sm ${
                  active ? "border-accent bg-accent font-medium text-accent-fg" : "border-control bg-surface hover:bg-surface-2"
                }`}
              >
                {pick(group.title, locale)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
