"use client";

import type { KeyboardEvent } from "react";
import type { ButtonId } from "@/controller/buttons";
import type { Glyph, PresetId } from "@/controller/presets";

type Pt = readonly [number, number];

const SHOULDERS = {
  SHOULDER_L1: [355, 128],
  SHOULDER_R1: [645, 128],
  TRIGGER_L2: [355, 95],
  TRIGGER_R2: [645, 95],
} as const satisfies Partial<Record<ButtonId, Pt>>;

/** PlayStation-style: d-pad and face buttons up top, both sticks low in the middle. */
const SYMMETRIC: Record<ButtonId, Pt> = {
  ...SHOULDERS,
  DPAD_UP: [335, 222],
  DPAD_DOWN: [335, 298],
  DPAD_LEFT: [297, 260],
  DPAD_RIGHT: [373, 260],
  FACE_TOP: [665, 218],
  FACE_BOTTOM: [665, 302],
  FACE_LEFT: [623, 260],
  FACE_RIGHT: [707, 260],
  VIEW: [440, 200],
  MENU: [560, 200],
  STICK_L: [420, 340],
  STICK_L_PRESS: [420, 392],
  STICK_R: [580, 340],
  STICK_R_PRESS: [580, 392],
};

/** Xbox / Switch Pro style: left stick up top, d-pad low, right stick low. */
const OFFSET: Record<ButtonId, Pt> = {
  ...SHOULDERS,
  STICK_L: [330, 245],
  STICK_L_PRESS: [330, 297],
  DPAD_UP: [420, 309],
  DPAD_DOWN: [420, 381],
  DPAD_LEFT: [384, 345],
  DPAD_RIGHT: [456, 345],
  FACE_TOP: [670, 203],
  FACE_BOTTOM: [670, 287],
  FACE_LEFT: [628, 245],
  FACE_RIGHT: [712, 245],
  VIEW: [445, 190],
  MENU: [555, 190],
  STICK_R: [580, 345],
  STICK_R_PRESS: [580, 397],
};

// The keyboard preset stands in for controller positions, so it uses a controller layout too.
const LAYOUTS: Record<PresetId, Record<ButtonId, Pt>> = {
  playstation: SYMMETRIC,
  xbox: OFFSET,
  switch: OFFSET,
  keyboard: OFFSET,
};

const LEFT_SIDE: ButtonId[] = ["TRIGGER_L2", "SHOULDER_L1", "VIEW", "STICK_L", "STICK_L_PRESS", "DPAD_UP", "DPAD_LEFT", "DPAD_RIGHT", "DPAD_DOWN"];
const RIGHT_SIDE: ButtonId[] = ["TRIGGER_R2", "SHOULDER_R1", "MENU", "FACE_TOP", "FACE_LEFT", "FACE_RIGHT", "FACE_BOTTOM", "STICK_R", "STICK_R_PRESS"];

const BODY =
  "M320 145 C400 128 600 128 680 145 C745 160 780 220 800 320 C822 430 810 525 735 525 C685 525 655 475 625 425 L375 425 C345 475 315 525 265 525 C190 525 178 430 200 320 C220 220 255 160 320 145 Z";

type Props = {
  presetId: PresetId;
  glyphFor: (id: ButtonId) => Glyph;
  roles: Record<ButtonId, string>;
  selected: ButtonId;
  onSelect: (id: ButtonId) => void;
  label: string;
};

export function ControllerDiagram(props: Props) {
  return (
    <>
      {/* Wide screens: controller with callout labels on both sides, like the in-game controls screen. */}
      <svg viewBox="0 40 1000 520" className="hidden h-auto w-full select-none sm:block" role="group" aria-label={props.label}>
        <Controller {...props} callouts />
      </svg>
      {/* Phones: controller only, cropped so buttons stay tappable. */}
      <svg viewBox="170 70 660 470" className="block h-auto w-full select-none sm:hidden" role="group" aria-label={props.label}>
        <Controller {...props} callouts={false} />
      </svg>
    </>
  );
}

function Controller({ presetId, glyphFor, roles, selected, onSelect, callouts }: Props & { callouts: boolean }) {
  const positions = LAYOUTS[presetId];

  const pressable = (id: ButtonId) => ({
    role: "button",
    tabIndex: 0,
    "aria-pressed": selected === id,
    "aria-label": `${roles[id]}: ${glyphFor(id).name}`,
    onClick: () => onSelect(id),
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelect(id);
      }
    },
    className: "cursor-pointer",
  });

  return (
    <>
      <path d={BODY} fill="var(--surface-2)" stroke="var(--border)" strokeWidth="3" />
      <circle cx="500" cy="300" r="10" fill="var(--border)" />

      {callouts &&
        [LEFT_SIDE, RIGHT_SIDE].map((side, sideIndex) => {
          const isLeft = sideIndex === 0;
          const ordered = [...side].sort((a, b) => positions[a][1] - positions[b][1]);
          return ordered.map((id, row) => {
            const y = 80 + (row * 450) / (ordered.length - 1);
            const [bx, by] = positions[id];
            const edge = isLeft ? 222 : 778;
            const elbow = isLeft ? edge + 26 : edge - 26;
            const active = selected === id;
            const glyph = glyphFor(id);
            return (
              <g key={id}>
                <polyline
                  points={`${edge},${y} ${elbow},${y} ${bx},${by}`}
                  fill="none"
                  stroke={active ? "var(--accent)" : "var(--border)"}
                  strokeWidth={active ? 3 : 1.5}
                />
                <g {...pressable(id)} tabIndex={-1} aria-hidden>
                  <svg x={isLeft ? 20 : 778} y={y - 23} width="202" height="46" overflow="hidden">
                    <rect
                      x="1"
                      y="1"
                      width="200"
                      height="44"
                      rx="10"
                      fill={active ? "var(--surface-2)" : "var(--surface)"}
                      stroke={active ? "var(--accent)" : "var(--border)"}
                      strokeWidth={active ? 3 : 1.5}
                    />
                    <text x="14" y="19" fontSize="16" fontWeight="600" fill="var(--fg)">
                      {glyph.name}
                    </text>
                    <text x="14" y="36" fontSize="12" fill="var(--muted)">
                      {roles[id]}
                    </text>
                  </svg>
                </g>
              </g>
            );
          });
        })}

      {(Object.keys(positions) as ButtonId[]).map((id) => (
        <g key={id} {...pressable(id)}>
          <SvgGlyph glyph={glyphFor(id)} at={positions[id]} active={selected === id} />
        </g>
      ))}
    </>
  );
}

function SvgGlyph({ glyph, at: [x, y], active }: { glyph: Glyph; at: Pt; active: boolean }) {
  const stroke = active ? "var(--accent)" : "var(--glyph-ring)";
  const strokeWidth = active ? 4 : 1.5;
  const body = { fill: "var(--glyph-bg)", stroke, strokeWidth };
  const long = glyph.label.length > 2;
  const text = (size: number) => (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={size} fontWeight="700" fill={glyph.color ?? "var(--glyph-fg)"}>
      {glyph.label}
    </text>
  );
  const widthFor = (min: number) => Math.max(min, glyph.label.length * 10 + 22);

  switch (glyph.shape) {
    case "round":
      return (
        <>
          <circle cx={x} cy={y} r="18" {...body} />
          {text(long ? 11 : 16)}
        </>
      );
    case "bumper": {
      const w = widthFor(64);
      return (
        <>
          <rect x={x - w / 2} y={y - 12} width={w} height="24" rx="12" {...body} />
          {text(13)}
        </>
      );
    }
    case "trigger": {
      const w = widthFor(56);
      const l = x - w / 2;
      const r = x + w / 2;
      return (
        <>
          <path d={`M${l} ${y + 14} V${y - 6} Q${l} ${y - 16} ${l + 12} ${y - 16} H${r - 12} Q${r} ${y - 16} ${r} ${y - 6} V${y + 14} Z`} {...body} />
          {text(13)}
        </>
      );
    }
    case "key": {
      const w = widthFor(38);
      return (
        <>
          <rect x={x - w / 2} y={y - 15} width={w} height="34" rx="6" fill="#000" opacity="0.35" />
          <rect x={x - w / 2} y={y - 17} width={w} height="32" rx="6" {...body} />
          {text(long ? 11 : 15)}
        </>
      );
    }
    case "dpad":
      return (
        <>
          <rect x={x - 15} y={y - 15} width="30" height="30" rx="6" {...body} />
          {text(15)}
        </>
      );
    case "stick":
      return (
        <>
          <circle cx={x} cy={y} r="30" {...body} />
          <circle cx={x} cy={y} r="19" fill="none" stroke="var(--glyph-fg)" strokeOpacity="0.25" strokeWidth="2" />
          {text(long ? 11 : 15)}
        </>
      );
  }
}
