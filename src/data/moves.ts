import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { moveSchema, type Move } from "./schema";

const MOVES_DIR = path.join(process.cwd(), "src", "data", "moves");

/** Reads and validates every move file. Any problem throws, which fails `next build`. */
function loadMoves(): Move[] {
  const errors: string[] = [];
  const moves: Move[] = [];

  for (const file of fs.readdirSync(MOVES_DIR).filter((f) => f.endsWith(".json")).sort()) {
    let raw: unknown;
    try {
      raw = JSON.parse(fs.readFileSync(path.join(MOVES_DIR, file), "utf8"));
    } catch (error) {
      errors.push(`${file}: invalid JSON (${(error as Error).message})`);
      continue;
    }
    const result = moveSchema.safeParse(raw);
    if (!result.success) {
      errors.push(`${file}:\n${z.prettifyError(result.error)}`);
      continue;
    }
    if (result.data.slug !== file.replace(/\.json$/, "")) {
      errors.push(`${file}: slug "${result.data.slug}" must match the file name`);
    }
    moves.push(result.data);
  }

  const slugs = new Set<string>();
  for (const move of moves) {
    if (slugs.has(move.slug)) errors.push(`duplicate slug "${move.slug}"`);
    slugs.add(move.slug);
  }
  for (const move of moves) {
    for (const followUp of move.followUps) {
      if (!slugs.has(followUp)) errors.push(`${move.slug}: follow-up "${followUp}" does not exist`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Invalid move data in src/data/moves:\n\n${errors.join("\n\n")}`);
  }
  return moves.sort((a, b) => a.stars - b.stars || a.name.en.localeCompare(b.name.en));
}

let cache: Move[] | undefined;

export function getMoves(): Move[] {
  // Re-read in dev so edits to JSON show up without restarting.
  if (process.env.NODE_ENV !== "production") return loadMoves();
  return (cache ??= loadMoves());
}

export function getMove(slug: string): Move | undefined {
  return getMoves().find((move) => move.slug === slug);
}
