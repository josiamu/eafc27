import { useId } from "react";
import { DIRECTION_VECTORS, type Direction } from "@/controller/buttons";
import type { Glyph } from "@/controller/presets";

const SIZES = { sm: 26, md: 34, lg: 44 } as const;
export type GlyphSize = keyof typeof SIZES;

type Props = {
  glyph: Glyph;
  direction?: Direction;
  path?: readonly Direction[];
  size?: GlyphSize;
  active?: boolean;
  /** Accessible name. Without it the glyph is decorative. */
  title?: string;
};

export function GlyphView({ glyph, direction, path, size = "md", active = false, title }: Props) {
  const px = SIZES[size];
  const a11y = title ? { role: "img", "aria-label": title } : { "aria-hidden": true };
  const ring = active ? "ring-2 ring-accent" : "ring-1 ring-[var(--glyph-ring)]";

  if (glyph.shape === "stick") {
    return <StickGlyph glyph={glyph} direction={direction} path={path} px={px} ring={ring} a11y={a11y} />;
  }

  const shape = {
    round: "rounded-full",
    bumper: "rounded-full px-2",
    trigger: "rounded-t-[0.9em] rounded-b-md px-2",
    key: "rounded-md border-b-[3px] border-black/40 px-1.5",
    dpad: "rounded-md",
  }[glyph.shape];

  return (
    <span
      {...a11y}
      className={`inline-flex shrink-0 items-center justify-center bg-[var(--glyph-bg)] font-semibold leading-none whitespace-nowrap text-[var(--glyph-fg)] ${shape} ${ring}`}
      style={{ height: px, minWidth: px, fontSize: Math.round(px * 0.42), color: glyph.color }}
    >
      {glyph.label}
    </span>
  );
}

function StickGlyph({
  glyph,
  direction,
  path,
  px,
  ring,
  a11y,
}: {
  glyph: Glyph;
  direction?: Direction;
  path?: readonly Direction[];
  px: number;
  ring: string;
  a11y: Record<string, unknown>;
}) {
  const markerId = `arrow-${useId().replace(/[^\w-]/g, "")}`;
  const color = glyph.color ?? "var(--highlight)";
  const d = path && path.length > 1 ? arcPath(path, 12) : direction ? linePath(direction) : null;

  return (
    <span {...a11y} className={`inline-flex shrink-0 rounded-full ${ring}`} style={{ width: px, height: px }}>
      <svg viewBox="-20 -20 40 40" width={px} height={px}>
        <defs>
          <marker id={markerId} viewBox="0 0 10 10" refX="4" refY="5" markerWidth="2.4" markerHeight="2.4" orient="auto-start-reverse">
            <path d="M0 0 10 5 0 10z" fill={color} />
          </marker>
        </defs>
        <circle r="19.5" fill="var(--glyph-bg)" />
        <circle r="12" fill="none" stroke="var(--glyph-fg)" strokeOpacity="0.22" strokeWidth="1.5" />
        {d && <path d={d} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" markerEnd={`url(#${markerId})`} />}
        {d ? (
          <>
            <circle r="6" fill="var(--glyph-fg)" />
            <text textAnchor="middle" dominantBaseline="central" fontSize="7" fontWeight="700" fill="var(--glyph-bg)">
              {glyph.label}
            </text>
          </>
        ) : (
          <text textAnchor="middle" dominantBaseline="central" fontSize={glyph.label.length > 2 ? 9 : 13} fontWeight="700" fill={glyph.color ?? "var(--glyph-fg)"}>
            {glyph.label}
          </text>
        )}
      </svg>
    </span>
  );
}

const fmt = (n: number) => Number(n.toFixed(2));

function linePath(direction: Direction) {
  const [x, y] = DIRECTION_VECTORS[direction];
  return `M ${fmt(x * 7.5)} ${fmt(y * 7.5)} L ${fmt(x * 13)} ${fmt(y * 13)}`;
}

function arcPath(path: readonly Direction[], r: number) {
  const points = path.map((dir) => DIRECTION_VECTORS[dir].map((v) => v * r) as [number, number]);
  let d = `M ${fmt(points[0][0])} ${fmt(points[0][1])}`;
  for (let i = 1; i < points.length; i++) {
    const [px, py] = points[i - 1];
    const [x, y] = points[i];
    let diff = Math.atan2(y, x) - Math.atan2(py, px);
    while (diff <= -Math.PI) diff += 2 * Math.PI;
    while (diff > Math.PI) diff -= 2 * Math.PI;
    // Screen y grows downward, so a positive angle change is clockwise (sweep 1).
    d += ` A ${r} ${r} 0 0 ${diff > 0 ? 1 : 0} ${fmt(x)} ${fmt(y)}`;
  }
  return d;
}
