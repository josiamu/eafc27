import type { Localized } from "@/i18n/config";
import type { ButtonId } from "./buttons";

export const GLYPH_SHAPES = ["round", "bumper", "trigger", "stick", "key", "dpad"] as const;
export type GlyphShape = (typeof GLYPH_SHAPES)[number];

export type Glyph = {
  /** Short text drawn on the button. */
  label: string;
  /** Name read by screen readers and shown in settings. */
  name: string;
  shape: GlyphShape;
  color?: string;
};

export const PRESET_IDS = ["playstation", "xbox", "switch"] as const;
export type PresetId = (typeof PRESET_IDS)[number];

export type Preset = {
  id: PresetId;
  name: Localized;
  buttons: Record<ButtonId, Glyph>;
};

const g = (shape: GlyphShape, label: string, name: string, color?: string): Glyph => ({ label, name, shape, color });

const dpad = {
  DPAD_UP: g("dpad", "↑", "D-pad up"),
  DPAD_DOWN: g("dpad", "↓", "D-pad down"),
  DPAD_LEFT: g("dpad", "←", "D-pad left"),
  DPAD_RIGHT: g("dpad", "→", "D-pad right"),
};

const sticks = {
  STICK_L: g("stick", "L", "Left stick"),
  STICK_R: g("stick", "R", "Right stick"),
};

// Button symbols are plain text characters, not console makers' artwork.
export const PRESETS: Record<PresetId, Preset> = {
  playstation: {
    id: "playstation",
    name: { th: "PlayStation", en: "PlayStation" },
    buttons: {
      FACE_BOTTOM: g("round", "✕", "Cross", "#9db8ff"),
      FACE_RIGHT: g("round", "○", "Circle", "#ff8f95"),
      FACE_LEFT: g("round", "□", "Square", "#f2a9dc"),
      FACE_TOP: g("round", "△", "Triangle", "#6fdcbd"),
      SHOULDER_L1: g("bumper", "L1", "L1"),
      SHOULDER_R1: g("bumper", "R1", "R1"),
      TRIGGER_L2: g("trigger", "L2", "L2"),
      TRIGGER_R2: g("trigger", "R2", "R2"),
      STICK_L_PRESS: g("round", "L3", "L3"),
      STICK_R_PRESS: g("round", "R3", "R3"),
      MENU: g("bumper", "OPT", "Options"),
      VIEW: g("bumper", "CRT", "Create"),
      ...dpad,
      ...sticks,
    },
  },
  xbox: {
    id: "xbox",
    name: { th: "Xbox", en: "Xbox" },
    buttons: {
      FACE_BOTTOM: g("round", "A", "A", "#86dc86"),
      FACE_RIGHT: g("round", "B", "B", "#ff858b"),
      FACE_LEFT: g("round", "X", "X", "#7dbaff"),
      FACE_TOP: g("round", "Y", "Y", "#ffd479"),
      SHOULDER_L1: g("bumper", "LB", "LB"),
      SHOULDER_R1: g("bumper", "RB", "RB"),
      TRIGGER_L2: g("trigger", "LT", "LT"),
      TRIGGER_R2: g("trigger", "RT", "RT"),
      STICK_L_PRESS: g("round", "LS", "Left stick click"),
      STICK_R_PRESS: g("round", "RS", "Right stick click"),
      MENU: g("bumper", "☰", "Menu"),
      VIEW: g("bumper", "⧉", "View"),
      ...dpad,
      ...sticks,
    },
  },
  switch: {
    id: "switch",
    name: { th: "Nintendo Switch", en: "Nintendo Switch" },
    buttons: {
      FACE_BOTTOM: g("round", "B", "B"),
      FACE_RIGHT: g("round", "A", "A"),
      FACE_LEFT: g("round", "Y", "Y"),
      FACE_TOP: g("round", "X", "X"),
      SHOULDER_L1: g("bumper", "L", "L"),
      SHOULDER_R1: g("bumper", "R", "R"),
      TRIGGER_L2: g("trigger", "ZL", "ZL"),
      TRIGGER_R2: g("trigger", "ZR", "ZR"),
      STICK_L_PRESS: g("round", "LS", "Left stick click"),
      STICK_R_PRESS: g("round", "RS", "Right stick click"),
      MENU: g("round", "+", "Plus"),
      VIEW: g("round", "−", "Minus"),
      ...dpad,
      ...sticks,
    },
  },
};
