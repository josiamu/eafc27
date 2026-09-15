import { z } from "zod";
import { DIGITAL_BUTTONS, DIRECTIONS, STICKS } from "@/controller/buttons";

const localized = z.object({ th: z.string().min(1), en: z.string().min(1) }).strict();

/** Pitch coordinates: x 0–160 toward the opponent's goal on the right, y 0–100 top to bottom. */
const point = z.tuple([z.number().min(0).max(160), z.number().min(0).max(100)]);

const button = z.enum(DIGITAL_BUTTONS);
const stick = z.enum(STICKS);
const direction = z.enum(DIRECTIONS);

const input = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("tap"), button }).strict(),
  z.object({ kind: z.literal("hold"), button }).strict(),
  z.object({ kind: z.literal("flick"), stick, direction }).strict(),
  z.object({ kind: z.literal("hold-stick"), stick, direction }).strict(),
  z.object({ kind: z.literal("rotate"), stick, path: z.array(direction).min(2) }).strict(),
]);

const step = z.object({ inputs: z.array(input).min(1), note: localized.optional() }).strict();

const keyframe = z.object({ step: z.number().int().min(0), player: point, ball: point }).strict();

export const MOVE_CONTEXTS = ["standing", "jogging", "sprinting"] as const;

export const moveSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
    game: z.literal("FC26"),
    name: localized,
    summary: localized,
    stars: z.number().int().min(1).max(5),
    difficulty: z.number().int().min(1).max(3),
    contexts: z.array(z.enum(MOVE_CONTEXTS)).min(1),
    situations: z.array(localized).min(1),
    sequence: z.array(step).min(1),
    diagram: z
      .object({
        start: z.object({ player: point, ball: point }).strict(),
        defender: point.optional(),
        keyframes: z.array(keyframe).min(1),
      })
      .strict(),
    playstyles: z.array(z.string()),
    followUps: z.array(z.string()),
    video: z.url().nullable(),
    sources: z.array(z.url()).min(1),
    verified: z.boolean(),
  })
  .strict()
  .superRefine((move, ctx) => {
    const { keyframes } = move.diagram;
    keyframes.forEach((frame, i) => {
      if (frame.step >= move.sequence.length) {
        ctx.addIssue({ code: "custom", path: ["diagram", "keyframes", i, "step"], message: `step ${frame.step} does not exist` });
      }
      if (i > 0 && frame.step < keyframes[i - 1].step) {
        ctx.addIssue({ code: "custom", path: ["diagram", "keyframes", i, "step"], message: "keyframes must follow step order" });
      }
    });
    move.sequence.forEach((_, i) => {
      if (!keyframes.some((frame) => frame.step === i)) {
        ctx.addIssue({ code: "custom", path: ["diagram", "keyframes"], message: `step ${i} has no keyframe` });
      }
    });
    if (move.verified && new Set(move.sources).size < 2) {
      ctx.addIssue({ code: "custom", path: ["verified"], message: "a verified move needs at least two different sources" });
    }
    if (move.followUps.includes(move.slug)) {
      ctx.addIssue({ code: "custom", path: ["followUps"], message: "a move cannot follow up into itself" });
    }
  });

export type Move = z.infer<typeof moveSchema>;
export type MoveStep = Move["sequence"][number];
export type MoveInput = MoveStep["inputs"][number];
export type InputKind = MoveInput["kind"];
export type MoveContext = (typeof MOVE_CONTEXTS)[number];
