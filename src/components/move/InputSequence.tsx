"use client";

import { Fragment } from "react";
import { useGlyph } from "@/controller/store";
import type { ControlInput, ControlStep } from "@/data/control-schema";
import type { MoveInput, MoveStep } from "@/data/schema";
import { fill, pick, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/th";
import { GlyphView } from "../controller/GlyphView";

type Props = {
  sequence: (MoveStep | ControlStep)[];
  /** Index of the step being animated, or -1 for none. */
  activeStep?: number;
  locale: Locale;
  t: Dictionary["move"];
  compact?: boolean;
};

export function InputSequence({ sequence, activeStep = -1, locale, t, compact = false }: Props) {
  return (
    <ol className="flex flex-wrap items-center gap-2">
      {sequence.map((step, i) => {
        const active = i === activeStep;
        return (
          <li key={i} className="flex items-center gap-2">
            {i > 0 && (
              <span aria-hidden className="text-muted">
                →
              </span>
            )}
            <div
              aria-current={active ? "step" : undefined}
              className={`rounded-xl border transition-colors duration-200 ${compact ? "px-2 py-1.5" : "px-3 py-2"} ${
                active ? "border-accent bg-surface-2 shadow-[0_0_0_1px_var(--accent)]" : "border-border bg-surface"
              }`}
            >
              {!compact && <div className="text-xs text-muted">{fill(t.step, { n: i + 1 })}</div>}
              <div className={`flex flex-wrap items-center gap-1.5 ${compact ? "" : "mt-1"}`}>
                {step.inputs.map((input, j) => (
                  <Fragment key={j}>
                    {j > 0 && (
                      <span aria-hidden className="text-muted">
                        +
                      </span>
                    )}
                    <InputChip input={input} t={t} size={compact ? "sm" : "md"} />
                  </Fragment>
                ))}
              </div>
              {!compact && "note" in step && step.note && <p className="mt-1.5 max-w-xs text-xs text-muted">{pick(step.note, locale)}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function InputChip({ input, t, size }: { input: MoveInput | ControlInput; t: Dictionary["move"]; size: "sm" | "md" }) {
  const glyph = useGlyph("button" in input ? input.button : input.stick);
  const direction = input.kind === "flick" || input.kind === "hold-stick" ? input.direction : undefined;
  const path = input.kind === "rotate" ? input.path : undefined;
  const directionText = direction ? t.directions[direction] : path ? path.map((d) => t.directions[d]).join(" → ") : "";

  return (
    <span className="inline-flex items-center gap-1">
      <GlyphView glyph={glyph} direction={direction} path={path} size={size} />
      <span className="text-xs font-medium text-muted">{t.kinds[input.kind]}</span>
      <span className="sr-only">
        {glyph.name} {directionText}
      </span>
    </span>
  );
}
