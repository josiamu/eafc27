import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

// The dark theme's colours: the card reads the same whatever theme the sharer uses.
const BG = "#0a110d";
const FG = "#e7efe9";
const MUTED = "#9cb0a3";
const ACCENT = "#c6ef2f";
const BORDER = "#25362c";

// Satori reads TTF, not the WOFF2 next/font serves, and needs Thai glyphs; Kanit is the site's heading face.
const fontDir = path.join(process.cwd(), "src", "assets", "fonts");
const fonts = Promise.all([
  readFile(path.join(fontDir, "Kanit-Medium.ttf")).then((data) => ({ name: "Kanit", data, weight: 500 as const })),
  readFile(path.join(fontDir, "Kanit-Bold.ttf")).then((data) => ({ name: "Kanit", data, weight: 700 as const })),
]);

function Star({ filled }: { filled: boolean }) {
  return (
    <svg width="44" height="44" viewBox="0 0 24 24">
      <path
        d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"
        fill={filled ? ACCENT : "none"}
        stroke={filled ? ACCENT : BORDER}
        strokeWidth="1.6"
      />
    </svg>
  );
}

/** The shared card: site name, an optional star rating, a title and one supporting line. */
export async function ogImage({ title, subtitle, stars, footer }: { title: string; subtitle: string; stars?: number; footer: string }) {
  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: BG, color: FG, padding: "64px 72px", fontFamily: "Kanit" }}>
        <div style={{ display: "flex", fontSize: 34, fontWeight: 700 }}>
          EAFC<span style={{ color: ACCENT, marginLeft: 12 }}>Skill Hub</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "center", gap: 20 }}>
          {stars !== undefined && (
            <div style={{ display: "flex", gap: 6 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} filled={n <= stars} />
              ))}
            </div>
          )}
          <div style={{ display: "flex", fontSize: title.length > 28 ? 64 : 84, fontWeight: 700, lineHeight: 1.15 }}>{title}</div>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 500, color: MUTED, lineHeight: 1.4, maxWidth: 980 }}>{subtitle}</div>
        </div>

        <div style={{ display: "flex", borderTop: `2px solid ${BORDER}`, paddingTop: 24, fontSize: 26, fontWeight: 500, color: MUTED }}>{footer}</div>
      </div>
    ),
    { ...OG_SIZE, fonts: await fonts },
  );
}
