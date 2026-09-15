---
name: add-move
description: Add or update an EA FC skill move in src/data/moves/ — research inputs from multiple sources, write the JSON to the schema, set verified honestly, and prove the build passes. Use whenever adding, correcting, or bulk-importing skill moves.
---

# Add a skill move

One move = one file `src/data/moves/<slug>.json`, validated by `src/data/schema.ts` at build time.
Copy the shape of an existing file (e.g. `elastico.json`) rather than writing from memory.

## 1. Research (never from memory)

- Find the move in **at least two independent guides for the current game** (`game` field, now `FC26`). Sources used so far: fifauteam.com, dexerto.com, sportsdunia.com, skycoach.gg, eafczone.com, and insider-gaming.com for moves new in FC 26. Prefer EA's own pages when available.
- Record for each source: star rating, exact PlayStation input, hold vs tap vs flick, stick rotation direction, standing/jogging/running.
- When fetching a guide, ask for the input **verbatim** and for one or two star levels at a time. Page summaries drop moves and have mislabelled stars before, so re-check any surprising value against a second fetch.
- Guides copy each other. Identical wording across two sites (e.g. the FC 26 new-move blurbs) is weaker evidence than two independently worded guides; mention it in the report.
- Several different moves share the same input across all guides (e.g. Heel Flick / Heel to Heel, Stop and Turn / Turn and Spin). Keep both, and note the overlap instead of guessing how the game picks.

## 2. Decide `verified`

- `true` only when two or more sources agree on **both** stars and inputs. List every source you used in `sources`.
- Any disagreement → `false`, and explain the conflict in the step `note` (both languages). Never silently pick one side.

## 3. Write the JSON

- `slug`: kebab-case English name, equal to the file name. Guide entries named "… Left" / "… Right" are **one** move: encode the right-side version and say in the note how to do the other side. Distinct named moves (Elastico vs Reverse Elastico) stay separate.
- `contexts`: only what a source states (`standing`, `jogging`, `running`); leave `[]` otherwise.
- Notes refer to buttons by role ("left trigger", "pass button"), never by PlayStation/Xbox names, because the site re-labels glyphs per controller.
- Buttons use neutral names only (`src/controller/buttons.ts`). PlayStation → neutral: ✕ `FACE_BOTTOM`, ○ `FACE_RIGHT`, □ `FACE_LEFT`, △ `FACE_TOP`, L1 `SHOULDER_L1`, R1 `SHOULDER_R1`, L2 `TRIGGER_L2`, R2 `TRIGGER_R2`, L3 `STICK_L_PRESS`, R3 `STICK_R_PRESS`, left stick `STICK_L`, right stick `STICK_R`.
- Input kinds: `tap`, `hold` (buttons); `flick`, `hold-stick`, `rotate` (sticks). A rotation `path` lists directions in order, e.g. right→left along the bottom = `["right","down-right","down","down-left","left"]`.
- Stick directions are relative to the player's facing: `up` = forward.
- Each **step** is what happens at one moment; inputs in the same step are pressed together. Things done one after another are separate steps.
- `name`, `summary`, `situations`, notes: natural Thai **and** English. Thai may keep the common English name in parentheses.
- `difficulty` 1–3 is about execution timing, independent of stars.
- `diagram`: pitch x 0–160 (attacking right), y 0–100 (player's right side = larger y). Start near player `[62,50]`, ball `[66,50]`, add a `defender` when the move beats one. Give every step ≥1 keyframe, keyframes in step order, keep motion plausible (a few units per touch, not across the pitch).
- `followUps`: only slugs that exist. `playstyles`: leave `[]` until PlayStyle data exists.
- `video`: `null` unless you have a YouTube link.

## 4. Prove it

```
npm run build
npm run lint
```

Both must pass. If the build throws `Invalid move data`, fix the file — never loosen the schema to make data fit without a real reason.
