import { z } from "zod";
import { GAME, localized, MOVE_INPUTS, stick } from "./schema";

/**
 * Controls use the move inputs plus stick motions whose direction is up to the player:
 * `move` pushes the stick where you want to go, `flick-any` flicks it any way, `neutral` leaves it centred.
 */
const input = z.discriminatedUnion("kind", [
  ...MOVE_INPUTS,
  z.object({ kind: z.literal("move"), stick }).strict(),
  z.object({ kind: z.literal("flick-any"), stick }).strict(),
  z.object({ kind: z.literal("neutral"), stick }).strict(),
]);

const step = z.object({ inputs: z.array(input).min(1) }).strict();

const control = z
  .object({
    name: localized,
    /** Each entry is one way to do it, a sequence of steps; the page joins them with "or". */
    ways: z.array(z.array(step).min(1)).min(1),
    note: localized.optional(),
    verified: z.boolean(),
  })
  .strict();

export const controlGroupSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
    game: GAME,
    order: z.number().int().min(1),
    title: localized,
    summary: localized,
    controls: z.array(control).min(1),
    sources: z.array(z.url()).min(1),
  })
  .strict()
  .superRefine((group, ctx) => {
    const verifiable = new Set(group.sources).size >= 2;
    group.controls.forEach((c, i) => {
      if (c.verified && !verifiable) {
        ctx.addIssue({ code: "custom", path: ["controls", i, "verified"], message: "a verified control needs at least two different sources" });
      }
      if (!c.verified && !c.note) {
        ctx.addIssue({ code: "custom", path: ["controls", i, "note"], message: "an unverified control must say where the sources differ" });
      }
    });
    const names = group.controls.map((c) => c.name.en);
    names.forEach((name, i) => {
      if (names.indexOf(name) !== i) ctx.addIssue({ code: "custom", path: ["controls", i, "name"], message: `duplicate control "${name}"` });
    });
  });

export type ControlGroup = z.infer<typeof controlGroupSchema>;
export type Control = ControlGroup["controls"][number];
export type ControlStep = Control["ways"][number][number];
export type ControlInput = ControlStep["inputs"][number];
export type ControlInputKind = ControlInput["kind"];
