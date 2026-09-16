"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { sampleGamepad } from "@/controller/input-sample";
import { begin, feed, isSupported, resolveSequence, type Progress, type ResolvedStep } from "@/controller/recognizer";
import { physicalFor, useControllerSettings } from "@/controller/store";
import { mirrorSteps } from "@/data/mirror";
import type { Move } from "@/data/schema";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/th";
import { InputSequence } from "./InputSequence";

const noSubscription = () => () => {};

/** Only the part of Progress the screen shows, so frames that change nothing cause no render. */
type View = { stepIndex: number; status: Progress["status"] };

const START: View = { stepIndex: 0, status: "waiting" };

/** The one control the section exists for, so it carries more weight than anything around it. */
const PRIMARY_BUTTON =
  "inline-flex h-11 items-center rounded-full bg-accent px-5 text-base font-semibold text-accent-fg transition hover:brightness-110 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2";
/** Stopping is not what a reader came to do, so it steps back while practice is running. */
const QUIET_BUTTON =
  "inline-flex h-11 items-center rounded-full border border-control px-5 text-base font-medium transition hover:border-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2";

export function MoveTrainer({ move, locale, t }: { move: Move; locale: Locale; t: Dictionary["move"] }) {
  const settings = useControllerSettings();
  const practisable = isSupported(move.sequence);
  const readable = useSyncExternalStore(noSubscription, () => typeof navigator.getGamepads === "function", () => true);

  /**
   * One variant per side. Inputs resolve through physicalFor, so practice follows whatever
   * bindings the player set, and a move with a twin passes performed either way round.
   */
  const variants: ResolvedStep[][] = useMemo(() => {
    const physical = (id: Parameters<typeof physicalFor>[1]) => physicalFor(settings, id);
    const sides = move.mirror ? [move.sequence, mirrorSteps(move.sequence)] : [move.sequence];
    return sides.map((side) => resolveSequence(side, physical));
  }, [move, settings]);

  const [active, setActive] = useState(false);
  const [view, setView] = useState<View>(START);
  const progress = useRef<Progress[]>([]);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!active) return;

    progress.current = variants.map(begin);
    let frame = 0;
    const poll = () => {
      const pad = navigator.getGamepads().find((candidate): candidate is Gamepad => candidate !== null);
      const sample = pad ? sampleGamepad(pad, performance.now()) : null;
      if (sample && progress.current.length > 0) {
        progress.current = progress.current.map((current, i) => feed(current, sample, variants[i]));
        const won = progress.current.some((p) => p.status === "success");
        // Follow whichever side the player is further into, so the highlight tracks them.
        const lead = progress.current.reduce((best, p) => (p.stepIndex > best.stepIndex ? p : best));
        const next: View = { stepIndex: lead.stepIndex, status: won ? "success" : lead.status };
        setView((shown) =>
          shown.stepIndex === next.stepIndex && shown.status === next.status ? shown : next,
        );
      }
      frame = requestAnimationFrame(poll);
    };
    frame = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(frame);
  }, [active, variants, attempt]);

  const heading = <h2 className="font-display text-xl font-bold">{t.practiceTitle}</h2>;

  if (!practisable) {
    return (
      <section className="space-y-2">
        {heading}
        <p className="max-w-prose rounded-xl bg-surface-2 px-3 py-2 text-sm text-muted">{t.practiceUnsupported}</p>
      </section>
    );
  }

  if (!readable) {
    return (
      <section className="space-y-2">
        {heading}
        <p className="max-w-prose rounded-xl bg-surface-2 px-3 py-2 text-sm text-muted">{t.practiceNoPad}</p>
      </section>
    );
  }

  const won = view.status === "success";

  return (
    <section className="space-y-3">
      {heading}
      <div className="space-y-3 rounded-2xl border border-border bg-surface p-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setActive(!active);
              setView(START);
            }}
            aria-pressed={active}
            className={active ? QUIET_BUTTON : PRIMARY_BUTTON}
          >
            {active ? t.practiceStop : t.practiceStart}
          </button>
          {won && (
            <button
              type="button"
              onClick={() => {
                setView(START);
                setAttempt((n) => n + 1);
              }}
              className={PRIMARY_BUTTON}
            >
              {t.practiceAgain}
            </button>
          )}
          <p aria-live="polite" className={`text-sm ${won ? "font-medium text-accent" : "text-muted"}`}>
            {!active ? t.practiceIdle : won ? t.practiceSuccess : t.practiceWaiting}
          </p>
        </div>

        {move.mirror && <p className="text-xs text-muted">{t.practiceEitherSide}</p>}

        {/* The step being waited for lights up, reusing the strip the move page already shows. */}
        <InputSequence sequence={move.sequence} activeStep={active && !won ? view.stepIndex : -1} locale={locale} t={t} />
      </div>
    </section>
  );
}
