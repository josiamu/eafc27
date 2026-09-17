import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { controlGroupSchema, type ControlGroup } from "./control-schema";

const CONTROLS_DIR = path.join(process.cwd(), "src", "data", "controls");

/** Reads and validates every control group file. Any problem throws, which fails `next build`. */
function loadControlGroups(): ControlGroup[] {
  const errors: string[] = [];
  const groups: ControlGroup[] = [];

  for (const file of fs.readdirSync(CONTROLS_DIR).filter((f) => f.endsWith(".json")).sort()) {
    let raw: unknown;
    try {
      raw = JSON.parse(fs.readFileSync(path.join(CONTROLS_DIR, file), "utf8"));
    } catch (error) {
      errors.push(`${file}: invalid JSON (${(error as Error).message})`);
      continue;
    }
    const result = controlGroupSchema.safeParse(raw);
    if (!result.success) {
      errors.push(`${file}:\n${z.prettifyError(result.error)}`);
      continue;
    }
    if (result.data.slug !== file.replace(/\.json$/, "")) {
      errors.push(`${file}: slug "${result.data.slug}" must match the file name`);
    }
    groups.push(result.data);
  }

  const orders = new Set<number>();
  for (const group of groups) {
    if (orders.has(group.order)) errors.push(`${group.slug}: order ${group.order} is used twice`);
    orders.add(group.order);
  }

  if (errors.length > 0) {
    throw new Error(`Invalid control data in src/data/controls:\n\n${errors.join("\n\n")}`);
  }
  return groups.sort((a, b) => a.order - b.order);
}

let cache: ControlGroup[] | undefined;

export function getControlGroups(): ControlGroup[] {
  // Re-read in dev so edits to JSON show up without restarting.
  if (process.env.NODE_ENV !== "production") return loadControlGroups();
  return (cache ??= loadControlGroups());
}

export function getControlGroup(slug: string): ControlGroup | undefined {
  return getControlGroups().find((group) => group.slug === slug);
}
