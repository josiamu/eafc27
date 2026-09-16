import {
  DIRECTIONS,
  DIRECTION_VECTORS,
  STANDARD_GAMEPAD_INDEX,
  STICKS,
  type Direction,
  type DigitalButtonId,
  type StickId,
} from "./buttons";

/**
 * Reading a controller, kept free of React and of `navigator` so the recogniser built on top
 * can be exercised with made-up frames instead of hardware.
 */

/** Below this the stick counts as centred. Tuned by feel, not measured. */
export const STICK_DEADZONE = 0.5;

/**
 * The nearest of the eight directions, or null while the stick sits inside the deadzone.
 * Gamepad axes grow downward, which is the convention DIRECTION_VECTORS already uses.
 */
export function directionFor(x: number, y: number): Direction | null {
  const magnitude = Math.hypot(x, y);
  if (magnitude < STICK_DEADZONE) return null;

  let best: Direction = DIRECTIONS[0];
  let bestDot = -Infinity;
  for (const direction of DIRECTIONS) {
    const [dx, dy] = DIRECTION_VECTORS[direction];
    const dot = (x * dx + y * dy) / magnitude;
    if (dot > bestDot) {
      bestDot = dot;
      best = direction;
    }
  }
  return best;
}

export type StickSample = { x: number; y: number; direction: Direction | null };

/** One frame of controller state. */
export type InputSample = {
  /** Milliseconds, from the same clock throughout a session. */
  at: number;
  pressed: DigitalButtonId[];
  sticks: Record<StickId, StickSample>;
};

/** Axis indices in the W3C "standard" mapping. */
const STICK_AXES: Record<StickId, readonly [number, number]> = {
  STICK_L: [0, 1],
  STICK_R: [2, 3],
};

/** Null when the browser could not fit the pad to the standard layout, so positions are unknown. */
export function sampleGamepad(pad: Gamepad, at: number): InputSample | null {
  if (pad.mapping !== "standard") return null;

  const pressed: DigitalButtonId[] = [];
  pad.buttons.forEach((button, index) => {
    const id = STANDARD_GAMEPAD_INDEX[index];
    if (id && button.pressed) pressed.push(id);
  });

  const sticks = {} as Record<StickId, StickSample>;
  for (const stick of STICKS) {
    const [xAxis, yAxis] = STICK_AXES[stick];
    const x = pad.axes[xAxis] ?? 0;
    const y = pad.axes[yAxis] ?? 0;
    sticks[stick] = { x, y, direction: directionFor(x, y) };
  }

  return { at, pressed, sticks };
}
