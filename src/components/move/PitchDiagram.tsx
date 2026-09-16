export type Point = readonly [number, number];

type Props = {
  player: Point;
  ball: Point;
  defender?: Point;
  /** Where the ball has been so far, drawn as a dashed line. */
  trail: readonly Point[];
  transitionMs: number;
  title: string;
};

/**
 * Top-down pitch, always attacking upward, so a stick direction in the data points the same
 * way on screen as it does on the pad: up is forward for both.
 *
 * Coordinates stay in the move's own frame — x toward the opponent's goal, y across the pitch —
 * and this rotation is the only place that knows which way the frame is drawn. Every move's
 * action falls inside x 46..95, y 38..69, so the view is cropped to that plus the goal above it
 * rather than showing a full pitch of empty grass.
 */
export function PitchDiagram({ player, ball, defender, trail, transitionMs, title }: Props) {
  const at = (p: Point) => ({
    transform: `translate(${p[0]}px, ${p[1]}px)`,
    transition: `transform ${transitionMs}ms ease-in-out`,
  });

  return (
    <svg viewBox="0 -8 100 132" role="img" aria-label={title} className="block h-auto w-full">
      {/* Keeping the full width and trimming only the length gives the shortest frame that
          still holds the goal: cropping the sides would make it taller relative to its width. */}
      <g transform="translate(0 160) rotate(-90)">
        <rect width="160" height="100" fill="var(--pitch)" />
        {[0, 40, 80, 120].map((x) => (
          <rect key={x} x={x} width="20" height="100" fill="var(--pitch-stripe)" />
        ))}
        <g fill="none" stroke="var(--pitch-line)" strokeWidth="0.6">
          <rect x="0.3" y="0.3" width="159.4" height="99.4" />
          <circle cx="0" cy="50" r="14" />
          <rect x="134" y="20" width="26" height="60" />
          <rect x="151" y="36" width="9" height="28" />
          <path d="M134 45.2 A12 12 0 0 0 134 54.8" />
        </g>
        <circle cx="145" cy="50" r="0.7" fill="var(--pitch-line)" />
        <rect x="160" y="44" width="5" height="12" fill="none" stroke="var(--pitch-line)" strokeWidth="0.8" />

        {trail.length > 1 && (
          <polyline
            points={trail.map((p) => p.join(",")).join(" ")}
            fill="none"
            stroke="#fff"
            strokeOpacity="0.75"
            strokeWidth="0.6"
            strokeDasharray="1.5 1.5"
          />
        )}
        {defender && (
          <g style={at(defender)}>
            <circle r="3.6" fill="var(--defender)" stroke="#000" strokeOpacity="0.4" strokeWidth="0.5" />
          </g>
        )}
        <g style={at(player)}>
          <circle r="3.6" fill="var(--highlight)" stroke="#0f1a14" strokeWidth="0.6" />
          {/* Points along +x, which the rotation turns into "up the screen": where the player faces. */}
          <path d="M4.3 -1.7 L6.8 0 L4.3 1.7z" fill="var(--highlight)" />
        </g>
        <g style={at(ball)}>
          <circle r="1.7" fill="#fff" stroke="#111" strokeWidth="0.4" />
        </g>
      </g>
    </svg>
  );
}
