import type { Direction } from "../controller/buttons";
import type { MoveStep } from "./schema";

/**
 * The same direction with left and right swapped. Lives here rather than in buttons.ts
 * because having a side is a property of a move, not of a controller — and because keeping
 * every import in this file type-only lets it run outside the bundler, under test.
 */
const MIRRORED: Record<Direction, Direction> = {
  up: "up",
  "up-right": "up-left",
  right: "left",
  "down-right": "down-left",
  down: "down",
  "down-left": "down-right",
  left: "right",
  "up-left": "up-right",
};

/**
 * The same steps with left and right swapped: the move's opposite-side twin.
 *
 * Derived rather than stored, so a move and its twin cannot fall out of step. Buttons are
 * untouched — only stick directions have a side.
 */
export function mirrorSteps(sequence: MoveStep[]): MoveStep[] {
  return sequence.map((step) => ({
    ...step,
    inputs: step.inputs.map((input) => {
      if (input.kind === "flick" || input.kind === "hold-stick") {
        return { ...input, direction: MIRRORED[input.direction] };
      }
      if (input.kind === "rotate") {
        return { ...input, path: input.path.map((direction) => MIRRORED[direction]) };
      }
      return input;
    }),
  }));
}
