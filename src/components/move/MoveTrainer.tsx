"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { sampleGamepad } from "@/controller/input-sample";
import { begin, feed, isSupported, resolveSequence, type Progress } from "@/controller/recognizer";
import { physicalFor, useControllerSettings } from "@/controller/store";
import type { MoveStep } from "@/data/schema";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/th";
import { InputSequence } from "./InputSequence";

const noSubscription = () => () => {};

/** Only the part of Progress the screen shows, so frames that change nothing cause no render. */
type View = { stepIndex: number; status: Progress["status"] };

const START: View = { stepIndex: 0, status: "waiting" };

export function MoveTrainer({ sequence, locale, t }: { sequence: MoveStep[]; locale: Locale; t: Dictionary["move"] }) {
  const settings = useControllerSettings();
  const practisable = isSupported(sequence);
  const readable = useSyncExternalStore(noSubscription, () => typeof navigator.getGamepads === "function", () => true);

  // Follows the player's own bindings: the recogniser never learns about them itself.
  const steps = useMemo(() => resolveSequence(sequence, (id) => physicalFor(settings, id)), [sequence, settings]);

  const [active, setActive] = useState(false);
  const [view, setView] = useState<View>(START);
  const progress = useRef<Progress | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!active) return;

    progress.current = begin(steps);
    let frame = 0;
    const poll = () => {
      const pad = navigator.getGamepads().find((candidate): candidate is Gamepad => candidate !== null);
      const sample = pad ? sampleGamepad(pad, performance.now()) : null;
      if (sample && progress.current) {
        const next = feed(progress.current, sample, steps);
        progress.current = next;
        setView((current) =>
          current.stepIndex === next.stepIndex && current.status === next.status
            ? current
            : { stepIndex: next.stepIndex, status: next.status },
        );
      }
      frame = requestAnimationFrame(poll);
    };
    frame = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(frame);
  }, [active, steps, attempt]);

  const heading = <h2 className="font-display text-xl font-bold">{t.practiceTitle}</h2>;

  if (!practisable) {
    return (
      <section className="space-y-2">
        {heading}
        <p className="max-w-prose rounded-xl bg-surface-2 px-3 py-2 text-sm text-muted">{t.practiceRotateSoon}</p>
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
            className="inline-flex h-9 items-center rounded-full border border-border px-3 text-sm hover:border-accent"
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
              className="inline-flex h-9 items-center rounded-full border border-accent px-3 text-sm"
            >
              {t.practiceAgain}
            </button>
          )}
          <p aria-live="polite" className={`text-sm ${won ? "font-medium text-accent" : "text-muted"}`}>
            {!active ? t.practiceIdle : won ? t.practiceSuccess : t.practiceWaiting}
          </p>
        </div>

        {/* The step being waited for lights up, reusing the same strip the move page already shows. */}
        <InputSequence sequence={sequence} activeStep={active && !won ? view.stepIndex : -1} locale={locale} t={t} />
      </div>
    </section>
  );
}
