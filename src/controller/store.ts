import { z } from "zod";
import { createStoredValue, useStoredValue } from "@/lib/stored-value";
import { BUTTON_IDS, DIGITAL_BUTTONS, isDigitalButton, type ButtonId, type DigitalButtonId } from "./buttons";
import { GLYPH_SHAPES, PRESETS, PRESET_IDS, type Glyph, type PresetId } from "./presets";

const overrideSchema = z.object({
  label: z.string().max(12).optional(),
  name: z.string().max(40).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  shape: z.enum(GLYPH_SHAPES).optional(),
});

const settingsSchema = z.object({
  presetId: z.enum(PRESET_IDS),
  /** Appearance changes, keyed by physical button. */
  overrides: z.partialRecord(z.enum(BUTTON_IDS), overrideSchema).default({}),
  /** Guide button → the physical button the player actually uses for it. */
  remap: z.partialRecord(z.enum(DIGITAL_BUTTONS), z.enum(DIGITAL_BUTTONS)).default({}),
});

export type ControllerSettings = z.infer<typeof settingsSchema>;
export type GlyphOverride = z.infer<typeof overrideSchema>;

const DEFAULT_SETTINGS: ControllerSettings = { presetId: "playstation", overrides: {}, remap: {} };

const controllerStore = createStoredValue<ControllerSettings>("eafc.controller", DEFAULT_SETTINGS, (raw) => {
  const result = settingsSchema.safeParse(JSON.parse(raw));
  return result.success ? result.data : undefined;
});

export function useControllerSettings() {
  return useStoredValue(controllerStore);
}

function update(change: (settings: ControllerSettings) => ControllerSettings) {
  controllerStore.set(change(controllerStore.get()));
}

export function setPreset(presetId: PresetId) {
  update((s) => ({ ...s, presetId }));
}

export function setOverride(id: ButtonId, patch: GlyphOverride | undefined) {
  update((s) => {
    const overrides = { ...s.overrides };
    const merged: GlyphOverride = { ...overrides[id], ...patch };
    for (const key of Object.keys(merged) as (keyof GlyphOverride)[]) {
      if (merged[key] === undefined) delete merged[key];
    }
    if (!patch || Object.keys(merged).length === 0) delete overrides[id];
    else overrides[id] = merged;
    return { ...s, overrides };
  });
}

export function resetOverrides() {
  update((s) => ({ ...s, overrides: {} }));
}

type Remap = ControllerSettings["remap"];

/** Which physical button a guide button's action sits on. Buttons with no entry keep their own. */
function heldBy(remap: Remap, guide: DigitalButtonId): DigitalButtonId {
  return remap[guide] ?? guide;
}

/**
 * Moves an action onto a physical button, handing whoever held it the button being vacated.
 * The mapping stays a permutation, so one physical button can never serve two actions —
 * a state no real controller can be in. Passing no button means taking back the guide's own.
 */
export function setRemap(guide: DigitalButtonId, physical: DigitalButtonId | undefined) {
  const target = physical ?? guide;
  update((s) => {
    const remap: Remap = { ...s.remap };
    const vacated = heldBy(remap, guide);
    if (vacated === target) return s;

    // The holder usually has no entry of its own, so every button has to be checked, not just keys.
    const holder = DIGITAL_BUTTONS.find((id) => heldBy(remap, id) === target);

    const assign = (id: DigitalButtonId, to: DigitalButtonId) => {
      if (to === id) delete remap[id];
      else remap[id] = to;
    };
    assign(guide, target);
    if (holder && holder !== guide) assign(holder, vacated);

    return { ...s, remap };
  });
}

export function resetRemap() {
  update((s) => ({ ...s, remap: {} }));
}

/** How a physical button looks with the current preset and the player's edits. */
export function appearance(settings: ControllerSettings, physical: ButtonId): Glyph {
  return { ...PRESETS[settings.presetId].buttons[physical], ...settings.overrides[physical] };
}

export function physicalFor(settings: ControllerSettings, id: ButtonId): ButtonId {
  return isDigitalButton(id) ? (settings.remap[id] ?? id) : id;
}

export function useGlyph(id: ButtonId): Glyph {
  const settings = useControllerSettings();
  return appearance(settings, physicalFor(settings, id));
}
