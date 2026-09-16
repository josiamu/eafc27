"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  BUTTON_IDS,
  DIGITAL_BUTTONS,
  STANDARD_GAMEPAD_INDEX,
  isDigitalButton,
  type ButtonId,
  type DigitalButtonId,
  type Direction,
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
import { GamepadInspector } from "./GamepadInspector";
import { GlyphView } from "./GlyphView";

type T = Dictionary["settings"];

const PREVIEW: ButtonId[] = ["FACE_BOTTOM", "FACE_RIGHT", "FACE_LEFT", "FACE_TOP", "SHOULDER_R1", "TRIGGER_L2", "STICK_R"];
const INPUT = "h-9 rounded-lg border border-control bg-bg px-2 text-sm text-fg";
const SMALL_BUTTON =
  "inline-flex h-9 items-center rounded-full border border-control px-3 text-sm text-fg hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40";
const CARD = "rounded-2xl border border-border bg-surface";

export function SettingsView({
  locale,
  t,
  directions,
}: {
  locale: Locale;
  t: T;
  directions: Record<Direction, string>;
}) {
  const settings = useControllerSettings();

  return (
    <div className="space-y-12">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">{t.title}</h1>
        <p className="max-w-prose text-muted">{t.lead}</p>
      </header>
      <PresetSection settings={settings} locale={locale} t={t} />
      <ButtonSection settings={settings} locale={locale} t={t} />
      <InspectorSection t={t} directions={directions} />
    </div>
  );
}

/** Diagnostics, closed by default: useful when a controller misbehaves, noise otherwise. */
function InspectorSection({ t, directions }: { t: T; directions: Record<Direction, string> }) {
  const [open, setOpen] = useState(false);

  return (
    <section aria-labelledby="inspect-title" className="space-y-4">
      <SectionHeading
        id="inspect-title"
        title={t.inspectTitle}
        lead={t.inspectLead}
        action={
          <button type="button" className={SMALL_BUTTON} aria-expanded={open} onClick={() => setOpen(!open)}>
            {open ? t.inspectHide : t.inspectShow}
          </button>
        }
      />
      {open && <GamepadInspector t={t} directions={directions} />}
    </section>
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

  /**
   * Picking a button is itself the intent to change it, so selecting one starts listening
   * for a gamepad press. Nothing can move before a deliberate choice, which is why the
   * listener is never armed on first load.
   */
  const chooseButton = (id: ButtonId) => {
    setSelected(id);
    setListening(supported && isDigitalButton(id));
  };

  const glyph = appearance(settings, selected);
  // Which action sits here now. Only digital buttons can be rebound; sticks always keep their own.
  const carries = guideFor(settings, selected);
  const rebindable = isDigitalButton(selected);
  const hasEdits = Object.keys(settings.overrides).length > 0 || Object.keys(settings.remap).length > 0;
  const suggestion = padId ? suggestPreset(padId) : null;

  // Pressing a button on the real controller moves the selected button's action onto it,
  // the same gesture EA FC's own remap screen uses.
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
            if (isDigitalButton(selected)) setRemap(guideFor(settings, selected) as DigitalButtonId, physical);
            // Follow the action to its new home so it is obvious where it landed.
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
    const timeout = setTimeout(() => setListening(false), 15_000);
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timeout);
      window.removeEventListener("keydown", onKey);
    };
  }, [listening, selected, settings]);

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
          onSelect={chooseButton}
          label={t.customizeTitle}
        />
        <p className="text-center text-xs text-muted">{t.diagramHint}</p>

        {/* Which button, then what it does, then how it looks. */}
        <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4" aria-live="polite">
          <GlyphView glyph={glyph} size="lg" direction={glyph.shape === "stick" ? "up" : undefined} title={glyph.name} />
          <label className="flex min-w-48 flex-1 flex-col gap-1 text-xs text-muted">
            {t.editing}
            {/* Named by position, not by action: this picks which physical button to edit. */}
            <select className={INPUT} value={selected} onChange={(e) => chooseButton(e.target.value as ButtonId)}>
              {BUTTON_IDS.map((id) => (
                <option key={id} value={id}>
                  {appearance(settings, id).name} · {t.roles[id]}
                </option>
              ))}
            </select>
          </label>
        </div>

        {rebindable && (
          <div className="flex flex-wrap items-end gap-3 border-t border-border pt-4">
            <label className="flex min-w-64 flex-1 flex-col gap-1 text-xs text-muted">
              {t.actionLabel}
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
            <p
              aria-live="polite"
              className={`basis-full text-xs ${listening ? "rounded-lg bg-warn-bg px-2 py-1 font-medium text-warn-fg" : "text-muted"}`}
            >
              {!supported ? t.bindUnsupported : listening ? t.bindListening : t.bindIdle}
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-end gap-3 border-t border-border pt-4">
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
              className="h-9 w-12 cursor-pointer rounded-lg border border-control bg-bg p-1"
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

        <div className="space-y-2 border-t border-border pt-4 text-sm">
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
        </div>
      </div>
    </section>
  );
}
