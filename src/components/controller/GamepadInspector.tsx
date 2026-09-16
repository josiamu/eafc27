"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { STICKS, type Direction } from "@/controller/buttons";
import { sampleGamepad, STICK_DEADZONE, type InputSample } from "@/controller/input-sample";
import { appearance, useControllerSettings } from "@/controller/store";
import type { Dictionary } from "@/i18n/dictionaries/th";
import { GlyphView } from "./GlyphView";

type T = Dictionary["settings"];

type Status = "none" | "nonstandard" | "reading";

const noSubscription = () => () => {};

/**
 * Live read-out of what the site sees from the controller. Mounted only while open, so the
 * polling loop stops when it is not being watched.
 */
export function GamepadInspector({ t, directions }: { t: T; directions: Record<Direction, string> }) {
  const settings = useControllerSettings();
  const [status, setStatus] = useState<Status>("none");
  const [sample, setSample] = useState<InputSample | null>(null);
  const [padId, setPadId] = useState("");
  // Read during render, not inside the effect: the server has no navigator, and setting state
  // from an effect body cascades renders.
  const supported = useSyncExternalStore(noSubscription, () => typeof navigator.getGamepads === "function", () => true);

  useEffect(() => {
    if (!supported) return;

    let frame = 0;
    const poll = () => {
      const pad = navigator.getGamepads().find((candidate): candidate is Gamepad => candidate !== null);
      if (!pad) {
        setStatus("none");
        setSample(null);
        setPadId("");
      } else {
        setPadId(pad.id);
        const next = sampleGamepad(pad, performance.now());
        setStatus(next ? "reading" : "nonstandard");
        setSample(next);
      }
      frame = requestAnimationFrame(poll);
    };
    frame = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(frame);
  }, [supported]);

  const message = !supported
    ? t.bindUnsupported
    : status === "nonstandard"
      ? t.inspectNonStandard
      : status === "none"
        ? t.padNone
        : padId;

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-surface p-4">
      <p role="status" className="break-words text-sm text-muted">
        {message}
      </p>

      <div className="space-y-1.5">
        <h3 className="text-xs font-medium text-muted">{t.inspectButtons}</h3>
        <div className="flex min-h-9 flex-wrap items-center gap-2">
          {sample && sample.pressed.length > 0 ? (
            sample.pressed.map((id) => {
              const glyph = appearance(settings, id);
              return <GlyphView key={id} glyph={glyph} size="sm" active title={glyph.name} />;
            })
          ) : (
            <span className="text-sm text-muted">{t.inspectIdle}</span>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {STICKS.map((stick) => {
          const reading = sample?.sticks[stick];
          const glyph = appearance(settings, stick);
          return (
            <div key={stick} className="space-y-1.5 rounded-xl border border-border bg-surface-2 p-3">
              <div className="flex items-center gap-2">
                <GlyphView
                  glyph={glyph}
                  size="sm"
                  direction={reading?.direction ?? undefined}
                  active={Boolean(reading?.direction)}
                  title={glyph.name}
                />
                <span className="text-sm font-medium">{glyph.name}</span>
              </div>
              <p className="text-sm">{reading?.direction ? directions[reading.direction] : t.inspectIdle}</p>
              {/* Raw values, so a stick that drifts or never reaches the deadzone is visible. */}
              <p className="font-mono text-xs text-muted">
                x {(reading?.x ?? 0).toFixed(2)} · y {(reading?.y ?? 0).toFixed(2)} · ≥{STICK_DEADZONE}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
