"use client";

import type { ButtonId, Direction } from "@/controller/buttons";
import { useGlyph } from "@/controller/store";
import { GlyphView, type GlyphSize } from "./GlyphView";

/** Shows a neutral button name as it looks on the player's chosen controller. */
export function ButtonGlyph({
  id,
  direction,
  path,
  size,
  active,
  decorative = false,
}: {
  id: ButtonId;
  direction?: Direction;
  path?: readonly Direction[];
  size?: GlyphSize;
  active?: boolean;
  decorative?: boolean;
}) {
  const glyph = useGlyph(id);
  return <GlyphView glyph={glyph} direction={direction} path={path} size={size} active={active} title={decorative ? undefined : glyph.name} />;
}
