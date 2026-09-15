"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { BUTTON_IDS, DIGITAL_BUTTONS, STANDARD_GAMEPAD_INDEX, type ButtonId, type DigitalButtonId } from "@/controller/buttons";
import { GLYPH_SHAPES, PRESETS, PRESET_IDS, type GlyphShape, type PresetId } from "@/controller/presets";
import {
  appearance,
  physicalFor,
  resetOverrides,
  resetRemap,
  setOverride,
  setPreset,
  setRemap,
  useControllerSettings,
  type ControllerSettings,
} from "@/controller/store";
import { fill, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/th";
import { GlyphView } from "./GlyphView";

type T = Dictionary["settings"];

const PREVIEW: ButtonId[] = ["FACE_BOTTOM", "FACE_RIGHT", "FACE_LEFT", "FACE_TOP", "SHOULDER_R1", "TRIGGER_L2", "STICK_R"];
const INPUT = "h-9 rounded-lg border border-border bg-bg px-2 text-sm text-fg";
const SMALL_BUTTON =
  "inline-flex h-9 items-center rounded-full border border-border px-3 text-sm text-fg hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40";
const CARD = "rounded-2xl border border-border bg-surface";

export function SettingsView({ locale, t }: { locale: Locale; t: T }) {
  const settings = useControllerSettings();

  return (
    <div className="space-y-12">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">{t.title}</h1>
        <p className="max-w-prose text-muted">{t.lead}</p>
      </header>
      <PresetSection settings={settings} locale={locale} t={t} />
      <CustomizeSection settings={settings} t={t} />
      <BindSection settings={settings} locale={locale} t={t} />
    </div>
  );
}

function SectionHeading({ id, title, lead, action }: { id: string; title: string; lead: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="space-y-1">
        <h2 id={id} className="font-display text-2xl font-bold">
          {title}
        </h2>
        <p className="max-w-prose text-sm text-muted">{lead}</p>
      </div>
      {action}
    </div>
  );
}

function PresetSection({ settings, locale, t }: { settings: ControllerSettings; locale: Locale; t: T }) {
  return (
    <section aria-labelledby="preset-title" className="space-y-4">
      <SectionHeading id="preset-title" title={t.presetTitle} lead={t.presetLead} />
      <div className="grid gap-3 sm:grid-cols-2">
        {PRESET_IDS.map((id) => {
          const preset = PRESETS[id];
          const selected = settings.presetId === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={selected}
              onClick={() => setPreset(id)}
              className={`rounded-2xl border p-4 text-left transition-colors ${
                selected ? "border-accent bg-surface-2 shadow-[0_0_0_1px_var(--accent)]" : "border-border bg-surface hover:border-accent"
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="font-display text-lg font-medium">{preset.name[locale]}</span>
                {selected && <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-fg">{t.selected}</span>}
              </span>
              <span className="mt-3 flex flex-wrap items-center gap-2">
                {PREVIEW.map((button) => (
                  <GlyphView key={button} glyph={preset.buttons[button]} size="sm" direction={button === "STICK_R" ? "up" : undefined} />
                ))}
              </span>
              {preset.approximate && (
                <span className="mt-3 block rounded-lg bg-warn-bg px-2 py-1 text-xs text-warn-fg">
                  {t.approximate}: {t.approximateNote}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function CustomizeSection({ settings, t }: { settings: ControllerSettings; t: T }) {
  const hasOverrides = Object.keys(settings.overrides).length > 0;

  return (
    <section aria-labelledby="customize-title" className="space-y-4">
      <SectionHeading
        id="customize-title"
        title={t.customizeTitle}
        lead={t.customizeLead}
        action={
          <button type="button" className={SMALL_BUTTON} onClick={resetOverrides} disabled={!hasOverrides}>
            {t.resetAll}
          </button>
        }
      />
      <ul className={`divide-y divide-border ${CARD}`}>
        {BUTTON_IDS.map((id) => {
          const glyph = appearance(settings, id);
          return (
            <li key={id} className="flex flex-wrap items-end gap-3 p-3">
              <div className="flex min-w-44 flex-1 items-center gap-3 self-center">
                <GlyphView glyph={glyph} direction={glyph.shape === "stick" ? "up" : undefined} title={glyph.name} />
                <span className="text-sm">{t.roles[id]}</span>
              </div>
              <label className="flex flex-col gap-1 text-xs text-muted">
                {t.label}
                <input
                  className={`${INPUT} w-20`}
                  value={glyph.label}
                  maxLength={12}
                  onChange={(e) => setOverride(id, { label: e.target.value })}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-muted">
                {t.name}
                <input
                  className={`${INPUT} w-36`}
                  value={glyph.name}
                  maxLength={40}
                  onChange={(e) => setOverride(id, { name: e.target.value })}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-muted">
                {t.color}
                <input
                  type="color"
                  className="h-9 w-12 cursor-pointer rounded-lg border border-border bg-bg p-1"
                  value={glyph.color ?? "#f2f6f3"}
                  onChange={(e) => setOverride(id, { color: e.target.value })}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-muted">
                {t.shape}
                <select className={INPUT} value={glyph.shape} onChange={(e) => setOverride(id, { shape: e.target.value as GlyphShape })}>
                  {GLYPH_SHAPES.map((shape) => (
                    <option key={shape} value={shape}>
                      {t.shapes[shape]}
                    </option>
                  ))}
                </select>
              </label>
              <button type="button" className={SMALL_BUTTON} disabled={!settings.overrides[id]} onClick={() => setOverride(id, undefined)}>
                {t.reset}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function subscribeGamepads(onChange: () => void) {
  window.addEventListener("gamepadconnected", onChange);
  window.addEventListener("gamepaddisconnected", onChange);
  return () => {
    window.removeEventListener("gamepadconnected", onChange);
    window.removeEventListener("gamepaddisconnected", onChange);
  };
}

function connectedGamepads(): Gamepad[] {
  if (typeof navigator.getGamepads !== "function") return [];
  return navigator.getGamepads().filter((pad): pad is Gamepad => pad !== null);
}

const noSubscription = () => () => {};

function suggestPreset(padId: string): PresetId | null {
  if (/xbox|xinput|045e/i.test(padId)) return "xbox";
  if (/playstation|dualsense|dualshock|054c/i.test(padId)) return "playstation";
  if (/nintendo|switch|pro controller|057e/i.test(padId)) return "switch";
  return null;
}

function BindSection({ settings, locale, t }: { settings: ControllerSettings; locale: Locale; t: T }) {
  const supported = useSyncExternalStore(noSubscription, () => typeof navigator.getGamepads === "function", () => true);
  const padId = useSyncExternalStore(subscribeGamepads, () => connectedGamepads()[0]?.id ?? "", () => "");
  const [listening, setListening] = useState<DigitalButtonId | null>(null);

  useEffect(() => {
    if (!listening) return;

    // Ignore buttons already held when listening starts; wait for a fresh press.
    const held = new Set<string>();
    for (const pad of connectedGamepads()) {
      pad.buttons.forEach((b, i) => b.pressed && held.add(`${pad.index}:${i}`));
    }

    let frame = 0;
    const poll = () => {
      for (const pad of connectedGamepads()) {
        for (let i = 0; i < pad.buttons.length; i++) {
          const key = `${pad.index}:${i}`;
          if (!pad.buttons[i].pressed) {
            held.delete(key);
            continue;
          }
          const physical = pad.mapping === "standard" ? STANDARD_GAMEPAD_INDEX[i] : undefined;
          if (!held.has(key) && physical) {
            setRemap(listening, physical);
            setListening(null);
            return;
          }
        }
      }
      frame = requestAnimationFrame(poll);
    };
    frame = requestAnimationFrame(poll);

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setListening(null);
    const timeout = setTimeout(() => setListening(null), 10_000);
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timeout);
      window.removeEventListener("keydown", onKey);
    };
  }, [listening]);

  const suggestion = padId ? suggestPreset(padId) : null;
  const hasRemap = Object.keys(settings.remap).length > 0;

  return (
    <section aria-labelledby="bind-title" className="space-y-4">
      <SectionHeading
        id="bind-title"
        title={t.bindTitle}
        lead={t.bindLead}
        action={
          <button type="button" className={SMALL_BUTTON} onClick={resetRemap} disabled={!hasRemap}>
            {t.resetAll}
          </button>
        }
      />

      <div className={`space-y-2 p-3 text-sm ${CARD}`}>
        <p role="status" className="break-words text-muted">
          {!supported ? t.bindUnsupported : padId ? fill(t.padFound, { id: padId }) : t.padNone}
        </p>
        {suggestion && suggestion !== settings.presetId && (
          <p className="flex flex-wrap items-center gap-2">
            {fill(t.suggest, { name: PRESETS[suggestion].name[locale] })}
            <button type="button" className={SMALL_BUTTON} onClick={() => setPreset(suggestion)}>
              {t.usePreset}
            </button>
          </p>
        )}
        {listening && (
          <p aria-live="assertive" className="rounded-lg bg-warn-bg px-2 py-1 font-medium text-warn-fg">
            {t.bindListening}
          </p>
        )}
      </div>

      <ul className={`divide-y divide-border ${CARD}`}>
        <li aria-hidden className="hidden gap-3 px-3 py-2 text-xs text-muted sm:flex">
          <span className="w-52">{t.bindGuide}</span>
          <span>{t.bindActual}</span>
        </li>
        {DIGITAL_BUTTONS.map((guide) => {
          const guideGlyph = appearance(settings, guide);
          const physical = physicalFor(settings, guide) as DigitalButtonId;
          const actualGlyph = appearance(settings, physical);
          const isListening = listening === guide;
          return (
            <li key={guide} className="flex flex-wrap items-center gap-3 p-3">
              <div className="flex w-52 items-center gap-2">
                <GlyphView glyph={guideGlyph} title={guideGlyph.name} />
                <span className="text-sm">{t.roles[guide]}</span>
              </div>
              <span aria-hidden className="text-muted">
                →
              </span>
              <GlyphView glyph={actualGlyph} active={isListening || physical !== guide} title={actualGlyph.name} />
              <label className="sr-only" htmlFor={`bind-${guide}`}>
                {t.bindActual}: {t.roles[guide]}
              </label>
              <select
                id={`bind-${guide}`}
                className={`${INPUT} max-w-52`}
                value={physical}
                onChange={(e) => setRemap(guide, e.target.value as DigitalButtonId)}
              >
                {DIGITAL_BUTTONS.map((button) => (
                  <option key={button} value={button}>
                    {appearance(settings, button).label} · {t.roles[button]}
                  </option>
                ))}
              </select>
              <div className="ml-auto flex gap-2">
                <button
                  type="button"
                  className={SMALL_BUTTON}
                  disabled={!supported}
                  aria-pressed={isListening}
                  onClick={() => setListening(isListening ? null : guide)}
                >
                  {t.bindPress}
                </button>
                <button type="button" className={SMALL_BUTTON} disabled={physical === guide} onClick={() => setRemap(guide, undefined)}>
                  {t.reset}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
