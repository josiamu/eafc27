/**
 * Controller-neutral button names. Data files and components only ever use these;
 * presets translate them into what a player sees on their own controller.
 */
export const DIGITAL_BUTTONS = [
  "FACE_BOTTOM",
  "FACE_RIGHT",
  "FACE_LEFT",
  "FACE_TOP",
  "SHOULDER_L1",
  "SHOULDER_R1",
  "TRIGGER_L2",
  "TRIGGER_R2",
  "STICK_L_PRESS",
  "STICK_R_PRESS",
  "DPAD_UP",
  "DPAD_DOWN",
  "DPAD_LEFT",
  "DPAD_RIGHT",
  "MENU",
  "VIEW",
] as const;

export const STICKS = ["STICK_L", "STICK_R"] as const;

export const BUTTON_IDS = [...DIGITAL_BUTTONS, ...STICKS] as const;

export type DigitalButtonId = (typeof DIGITAL_BUTTONS)[number];
export type StickId = (typeof STICKS)[number];
export type ButtonId = (typeof BUTTON_IDS)[number];

export function isDigitalButton(id: ButtonId): id is DigitalButtonId {
  return (DIGITAL_BUTTONS as readonly string[]).includes(id);
}

/** Stick directions are relative to where the player faces: "up" means forward. */
export const DIRECTIONS = ["up", "up-right", "right", "down-right", "down", "down-left", "left", "up-left"] as const;
export type Direction = (typeof DIRECTIONS)[number];

const D = Math.SQRT1_2;
/** Unit vectors in screen space (y grows downward). */
export const DIRECTION_VECTORS: Record<Direction, readonly [number, number]> = {
  up: [0, -1],
  "up-right": [D, -D],
  right: [1, 0],
  "down-right": [D, D],
  down: [0, 1],
  "down-left": [-D, D],
  left: [-1, 0],
  "up-left": [-D, -D],
};

/** W3C "standard" Gamepad mapping: button index → physical position. */
export const STANDARD_GAMEPAD_INDEX: Partial<Record<number, DigitalButtonId>> = {
  0: "FACE_BOTTOM",
  1: "FACE_RIGHT",
  2: "FACE_LEFT",
  3: "FACE_TOP",
  4: "SHOULDER_L1",
  5: "SHOULDER_R1",
  6: "TRIGGER_L2",
  7: "TRIGGER_R2",
  8: "VIEW",
  9: "MENU",
  10: "STICK_L_PRESS",
  11: "STICK_R_PRESS",
  12: "DPAD_UP",
  13: "DPAD_DOWN",
  14: "DPAD_LEFT",
  15: "DPAD_RIGHT",
};
