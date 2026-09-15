@AGENTS.md

# EAFC Skill Hub

Bilingual (th default, en) static site teaching EA FC skill moves and PlayStyles. Plan and progress: `PLAN.md`.

## Commands

- `npm run dev` → http://localhost:3000/eafc27/ (basePath applies in dev too)
- `npm run build` → static export in `out/`; also validates all move data
- `npm run lint`

Deploys to https://josiamu.github.io/eafc27/ via `.github/workflows/deploy.yml` on push to `main`.

## Rules

- **Content lives in JSON**, never in components. Moves: `src/data/moves/<slug>.json`, validated by `src/data/schema.ts` in `src/data/moves.ts`. Invalid data must fail the build.
- **Buttons use neutral names** (`SHOULDER_R1`, `STICK_R`, see `src/controller/buttons.ts`). Never write "R1"/"RB" in data. Presets in `src/controller/presets.ts` turn them into labels.
- **Player choices live in localStorage** via `src/lib/stored-value.ts`: controller (`eafc.controller`), theme (`eafc.theme`), locale (`eafc.locale`). Every read must survive storage being unavailable.
- Stick directions in data are relative to the player's facing (`up` = forward). Pitch diagrams always attack to the right; coordinates are x 0–160, y 0–100.
- A move may be `"verified": true` only when at least two sources agree on stars and inputs. Otherwise `false`, and the site shows a "needs checking" badge.
- Static export: every dynamic route needs `generateStaticParams` and `dynamicParams = false`. No redirects, cookies, or server actions.
- Every UI string goes in both `src/i18n/dictionaries/th.ts` and `en.ts` (en is type-checked against th).
- Don't use console makers' logos or button artwork; glyphs are text characters.
- Video links: YouTube only for now (`VideoSlot` hides anything else).
