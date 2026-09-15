"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import type { Move } from "@/data/schema";
import { fill, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/th";
import { InputSequence } from "./InputSequence";
import { PitchDiagram } from "./PitchDiagram";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const SPEEDS = [1, 0.5, 0.25] as const;

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export function MoveAnimation({ move, locale, t }: { move: Move; locale: Locale; t: Dictionary["move"] }) {
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
  // null = the player hasn't touched play/pause, so follow the motion preference.
  const [userPlaying, setUserPlaying] = useState<boolean | null>(null);
  const playing = userPlaying ?? !reducedMotion;
  const [frame, setFrame] = useState(-1);
  const [speed, setSpeed] = useState<number>(1);

  const { start, defender, keyframes } = move.diagram;
  const last = keyframes.length - 1;

  useEffect(() => {
    if (!playing) return;
    const delay = (frame === last ? 1500 : frame === -1 ? 700 : 950) / speed;
    const timer = setTimeout(() => setFrame((f) => (f >= last ? -1 : f + 1)), delay);
    return () => clearTimeout(timer);
  }, [playing, frame, last, speed]);

  const current = frame < 0 ? start : keyframes[frame];
  const activeStep = frame < 0 ? -1 : keyframes[frame].step;
  const trail = [start.ball, ...keyframes.slice(0, frame + 1).map((k) => k.ball)];

  const goTo = (next: number) => {
    setUserPlaying(false);
    setFrame(next);
  };

  const control =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-full border border-border bg-surface px-3 text-sm text-fg hover:bg-surface-2 disabled:opacity-40";

  return (
    <div className="grid overflow-hidden rounded-2xl border border-border bg-surface lg:grid-cols-[3fr_2fr]">
      <div className="relative self-start">
        <PitchDiagram
          player={current.player}
          ball={current.ball}
          defender={defender}
          trail={trail}
          transitionMs={reducedMotion ? 0 : 650 / speed}
          title={t.pitchTitle}
        />
        <span className="absolute left-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-xs text-white">
          {t.attackDirection} →
        </span>
      </div>

      <div className="space-y-3 p-3 sm:p-4">
        <InputSequence sequence={move.sequence} activeStep={activeStep} locale={locale} t={t} />

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={control} onClick={() => goTo(Math.max(-1, frame - 1))} disabled={frame < 0} aria-label={t.prev}>
            ‹
          </button>
          <button
            type="button"
            className={`${control} min-w-20 font-medium`}
            onClick={() => setUserPlaying(!playing)}
            aria-pressed={playing}
          >
            {playing ? t.pause : t.play}
          </button>
          <button type="button" className={control} onClick={() => goTo(frame >= last ? -1 : frame + 1)} aria-label={t.next}>
            ›
          </button>
          <button type="button" className={control} onClick={() => goTo(-1)}>
            {t.restart}
          </button>
          <span aria-live="polite" className="text-sm text-muted">
            {frame < 0 ? t.start : fill(t.step, { n: activeStep + 1 })}
          </span>

          <div role="group" aria-label={t.speed} className="ml-auto inline-flex rounded-full border border-border p-0.5">
            {SPEEDS.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={speed === s}
                onClick={() => setSpeed(s)}
                className={`rounded-full px-2.5 py-1 text-xs ${speed === s ? "bg-fg text-bg" : "text-muted hover:text-fg"}`}
              >
                {s}×
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
