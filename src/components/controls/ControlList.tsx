import { InputSequence } from "@/components/move/InputSequence";
import type { Control } from "@/data/control-schema";
import { pick, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/th";

/** A group's controls as rows: name and note on one side, every way to do it on the other. */
export function ControlList({ controls, locale, t }: { controls: Control[]; locale: Locale; t: Dictionary }) {
  return (
    <ul className="divide-y divide-border rounded-2xl border border-border bg-surface">
      {controls.map((control) => (
        <li key={control.name.en} className="grid gap-2 px-4 py-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:items-center sm:gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{pick(control.name, locale)}</span>
              {!control.verified && <span className="rounded-full bg-warn-bg px-2 py-0.5 text-xs font-medium text-warn-fg">{t.move.unverified}</span>}
            </div>
            {control.note && <p className="text-sm text-muted">{pick(control.note, locale)}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {control.ways.map((way, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2">
                {i > 0 && <span className="text-sm text-muted">{t.controls.or}</span>}
                <InputSequence sequence={way} locale={locale} t={t.move} compact />
              </div>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}
