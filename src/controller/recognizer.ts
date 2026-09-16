import type { MoveStep } from "../data/schema";
import type { ButtonId, Direction, DigitalButtonId, StickId } from "./buttons";
import type { InputSample } from "./input-sample";

/**
 * Decides whether a player performed a move's inputs, from a stream of controller frames.
 *
 * Deliberately free of React, of `navigator` and of the settings store: everything it needs
 * arrives as arguments, so it can be exercised with invented frames instead of hardware.
 */

/** Tuned by feel, not measured. Expect these to move once real hands are on a controller. */
export const TIMINGS = {
  /** Longest press still counted as a tap rather than a hold. */
  tapMax: 250,
  /** Longest excursion from centre still counted as a flick. */
  flickMax: 350,
  /** How long a stick must stay put before it counts as held. */
  holdStickMin: 150,
  /** Idle time before an unfinished attempt starts over. */
  restartAfter: 2000,
} as const;

/** A move input with its button already resolved to the one this player physically presses. */
export type Expected =
  | { kind: "tap"; button: ButtonId }
  | { kind: "hold"; button: ButtonId }
  | { kind: "flick"; stick: StickId; direction: Direction }
  | { kind: "hold-stick"; stick: StickId; direction: Direction };

export type ResolvedStep = { inputs: Expected[] };

/** Rotations are not recognised yet, so moves containing one cannot be practised. */
export function isSupported(sequence: MoveStep[]): boolean {
  return sequence.every((step) => step.inputs.every((input) => input.kind !== "rotate"));
}

/**
 * Rewrites a move's inputs against the player's own bindings. `physical` is normally
 * `(id) => physicalFor(settings, id)`; passing it in keeps the store out of here.
 */
export function resolveSequence(sequence: MoveStep[], physical: (id: ButtonId) => ButtonId): ResolvedStep[] {
  return sequence.map((step) => ({
    inputs: step.inputs.flatMap((input): Expected[] => {
      if (input.kind === "rotate") return [];
      if (input.kind === "tap" || input.kind === "hold") {
        return [{ kind: input.kind, button: physical(input.button) }];
      }
      return [{ kind: input.kind, stick: input.stick, direction: input.direction }];
    }),
  }));
}

type StickMemory = { direction: Direction | null; since: number; leftCentreAt: number | null };

export type Progress = {
  stepIndex: number;
  /** Per input of the current step. `hold` entries are re-judged every frame. */
  done: boolean[];
  status: "waiting" | "running" | "success";
  /** Drives the restart timer; bumped whenever anything is achieved. */
  lastChangeAt: number;
  pressedSince: Partial<Record<DigitalButtonId, number>>;
  sticks: Partial<Record<StickId, StickMemory>>;
  previous: InputSample | null;
};

export function begin(steps: ResolvedStep[]): Progress {
  return {
    stepIndex: 0,
    done: new Array(steps[0]?.inputs.length ?? 0).fill(false),
    status: "waiting",
    lastChangeAt: 0,
    pressedSince: {},
    sticks: {},
    previous: null,
  };
}

function heldFor(progress: Progress, button: ButtonId, sample: InputSample): number | null {
  if (!sample.pressed.includes(button as DigitalButtonId)) return null;
  const since = progress.pressedSince[button as DigitalButtonId];
  return since === undefined ? 0 : sample.at - since;
}

/**
 * Folds one frame into the attempt. Returns a new Progress; the caller keeps the latest and
 * restarts by calling `begin` again once it reads "success".
 */
export function feed(progress: Progress, sample: InputSample, steps: ResolvedStep[]): Progress {
  if (progress.status === "success" || steps.length === 0) return progress;

  const previous = progress.previous;
  const pressedSince: Partial<Record<DigitalButtonId, number>> = {};
  for (const button of sample.pressed) {
    pressedSince[button] = progress.pressedSince[button] ?? sample.at;
  }

  const sticks: Partial<Record<StickId, StickMemory>> = {};
  for (const [stick, reading] of Object.entries(sample.sticks) as [StickId, InputSample["sticks"][StickId]][]) {
    const before = progress.sticks[stick];
    const changed = !before || before.direction !== reading.direction;
    sticks[stick] = {
      direction: reading.direction,
      since: changed ? sample.at : before.since,
      leftCentreAt:
        reading.direction === null ? null : (before?.leftCentreAt ?? sample.at),
    };
  }

  const step = steps[progress.stepIndex];
  const done = [...progress.done];
  let changedSomething = false;

  step.inputs.forEach((input, index) => {
    switch (input.kind) {
      case "hold": {
        // Judged live: letting go before the step completes un-satisfies it.
        const held = heldFor(progress, input.button, sample) !== null;
        if (held !== done[index]) {
          done[index] = held;
          if (held) changedSomething = true;
        }
        break;
      }
      case "tap": {
        if (done[index]) break;
        const wasPressed = previous?.pressed.includes(input.button as DigitalButtonId) ?? false;
        const isPressed = sample.pressed.includes(input.button as DigitalButtonId);
        const since = progress.pressedSince[input.button as DigitalButtonId];
        if (wasPressed && !isPressed && since !== undefined && sample.at - since <= TIMINGS.tapMax) {
          done[index] = true;
          changedSomething = true;
        }
        break;
      }
      case "flick": {
        if (done[index]) break;
        const before = progress.sticks[input.stick];
        const returned = before?.direction === input.direction && sample.sticks[input.stick].direction === null;
        const quick = before?.leftCentreAt != null && sample.at - before.leftCentreAt <= TIMINGS.flickMax;
        if (returned && quick) {
          done[index] = true;
          changedSomething = true;
        }
        break;
      }
      case "hold-stick": {
        if (done[index]) break;
        const memory = sticks[input.stick];
        if (memory?.direction === input.direction && sample.at - memory.since >= TIMINGS.holdStickMin) {
          done[index] = true;
          changedSomething = true;
        }
        break;
      }
    }
  });

  let stepIndex = progress.stepIndex;
  let status: Progress["status"] = "running";
  let nextDone = done;

  if (done.every(Boolean)) {
    stepIndex += 1;
    changedSomething = true;
    if (stepIndex >= steps.length) {
      status = "success";
      nextDone = [];
    } else {
      nextDone = new Array(steps[stepIndex].inputs.length).fill(false);
    }
  }

  const lastChangeAt = changedSomething ? sample.at : progress.lastChangeAt;
  const started = progress.status !== "waiting" || changedSomething;
  const stale = started && status !== "success" && sample.at - lastChangeAt > TIMINGS.restartAfter;

  if (stale) {
    return { ...begin(steps), previous: sample, pressedSince, sticks, lastChangeAt: sample.at };
  }

  return {
    stepIndex,
    done: nextDone,
    status: status === "success" ? "success" : started ? "running" : "waiting",
    lastChangeAt,
    pressedSince,
    sticks,
    previous: sample,
  };
}
