"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  BUTTON_IDS,
  DIGITAL_BUTTONS,
  STANDARD_GAMEPAD_INDEX,
  isDigitalButton,
  type ButtonId,
  type DigitalButtonId,
} from "@/controller/buttons";
import { GLYPH_SHAPES, PRESETS, PRESET_IDS, type GlyphShape, type PresetId } from "@/controller/presets";
import {
  appearance,
  guideFor,
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
import { ControllerDiagram } from "./ControllerDiagram";
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
      <ButtonSection settings={settings} locale={locale} t={t} />
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
            </button>
          );
        })}
      </div>
    </section>
  );
}

type ActionPair = { attack?: string; defend?: string };

/** Takes a guide button, not a physical one: an action belongs to the guide that carries it. */
function actionPair(t: T, guide: ButtonId): ActionPair | undefined {
  return (t.actions as Partial<Record<ButtonId, ActionPair>>)[guide];
}

/**
 * What the button does in game, as "บุก: จ่ายบอลเรียด · รับ: ประกบ".
 * Falls back to the physical name for buttons no source covers, such as Menu and the D-pad.
 */
function actionText(t: T, guide: ButtonId): string {
  const action = actionPair(t, guide);
  const parts = [
    action?.attack && `${t.attackLabel}: ${action.attack}`,
    action?.defend && `${t.defendLabel}: ${action.defend}`,
  ].filter((part) => typeof part === "string");
  return parts.length > 0 ? parts.join(" · ") : t.roles[guide];
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

/**
 * One button at a time: pick it on the controller, then set how it looks and what it does.
 * Both are properties of the same physical button, so they share a selection.
 */
function ButtonSection({ settings, locale, t }: { settings: ControllerSettings; locale: Locale; t: T }) {
  const [selected, setSelected] = useState<ButtonId>("FACE_BOTTOM");
  const [listening, setListening] = useState(false);
  const supported = useSyncExternalStore(noSubscription, () => typeof navigator.getGamepads === "function", () => true);
  const padId = useSyncExternalStore(subscribeGamepads, () => connectedGamepads()[0]?.id ?? "", () => "");

  const glyph = appearance(settings, selected);
  // Which action sits here now. Only digital buttons can be rebound; sticks always keep their own.
  const carries = guideFor(settings, selected);
  const rebindable = isDigitalButton(selected);
  const hasEdits = Object.keys(settings.overrides).length > 0 || Object.keys(settings.remap).length > 0;
  const suggestion = padId ? suggestPreset(padId) : null;

  // Pressing a button on the real controller selects it here, so nobody has to hunt for it on the diagram.
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
            setSelected(physical);
            setListening(false);
            return;
          }
        }
      }
      frame = requestAnimationFrame(poll);
    };
    frame = requestAnimationFrame(poll);

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setListening(false);
    const timeout = setTimeout(() => setListening(false), 10_000);
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timeout);
      window.removeEventListener("keydown", onKey);
    };
  }, [listening]);

  return (
    <section aria-labelledby="customize-title" className="space-y-4">
      <SectionHeading
        id="customize-title"
        title={t.customizeTitle}
        lead={t.customizeLead}
        action={
          <button
            type="button"
            className={SMALL_BUTTON}
            onClick={() => {
              resetOverrides();
              resetRemap();
            }}
            disabled={!hasEdits}
          >
            {t.resetAll}
          </button>
        }
      />

      <div className={`${CARD} space-y-4 p-3 sm:p-5`}>
        <ControllerDiagram
          presetId={settings.presetId}
          glyphFor={(id) => appearance(settings, id)}
          roles={t.roles}
          actionFor={(id) => actionPair(t, guideFor(settings, id))}
          labels={{ attack: t.attackLabel, defend: t.defendLabel }}
          selected={selected}
          onSelect={setSelected}
          label={t.customizeTitle}
        />
        <p className="text-center text-xs text-muted">{t.diagramHint}</p>

        <div className="flex flex-wrap items-end gap-3 border-t border-border pt-4">
          <div className="flex min-w-48 flex-1 items-center gap-3 self-center" aria-live="polite">
            <GlyphView glyph={glyph} size="lg" direction={glyph.shape === "stick" ? "up" : undefined} title={glyph.name} />
            <label className="flex flex-col gap-1 text-xs text-muted">
              {t.editing}
              <select className={INPUT} value={selected} onChange={(e) => setSelected(e.target.value as ButtonId)}>
                {BUTTON_IDS.map((id) => (
                  <option key={id} value={id}>
                    {actionText(t, guideFor(settings, id))} · {appearance(settings, id).name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="flex flex-col gap-1 text-xs text-muted">
            {t.label}
            <input className={`${INPUT} w-20`} value={glyph.label} maxLength={12} onChange={(e) => setOverride(selected, { label: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted">
            {t.name}
            <input className={`${INPUT} w-36`} value={glyph.name} maxLength={40} onChange={(e) => setOverride(selected, { name: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted">
            {t.color}
            <input
              type="color"
              className="h-9 w-12 cursor-pointer rounded-lg border border-border bg-bg p-1"
              value={glyph.color ?? "#f2f6f3"}
              onChange={(e) => setOverride(selected, { color: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted">
            {t.shape}
            <select className={INPUT} value={glyph.shape} onChange={(e) => setOverride(selected, { shape: e.target.value as GlyphShape })}>
              {GLYPH_SHAPES.map((shape) => (
                <option key={shape} value={shape}>
                  {t.shapes[shape]}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className={SMALL_BUTTON} disabled={!settings.overrides[selected]} onClick={() => setOverride(selected, undefined)}>
            {t.reset}
          </button>
        </div>

        {rebindable && (
          <div className="flex flex-wrap items-end gap-3 border-t border-border pt-4">
            <label className="flex min-w-64 flex-1 flex-col gap-1 text-xs text-muted">
              {t.actionLabel}
              {/* Choosing an action moves it here; setRemap swaps it with whatever sat on this button. */}
              <select
                className={INPUT}
                value={carries}
                onChange={(e) => setRemap(e.target.value as DigitalButtonId, selected as DigitalButtonId)}
              >
                {DIGITAL_BUTTONS.map((guide) => (
                  <option key={guide} value={guide}>
                    {actionText(t, guide)}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className={SMALL_BUTTON}
              disabled={carries === selected}
              onClick={() => setRemap(carries as DigitalButtonId, undefined)}
            >
              {t.reset}
            </button>
          </div>
        )}

        <div className="space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className={SMALL_BUTTON}
              disabled={!supported}
              aria-pressed={listening}
              onClick={() => setListening(!listening)}
            >
              {t.bindPress}
            </button>
            <p role="status" className="break-words text-muted">
              {!supported ? t.bindUnsupported : padId ? fill(t.padFound, { id: padId }) : t.padNone}
            </p>
          </div>
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
      </div>
    </section>
  );
}
