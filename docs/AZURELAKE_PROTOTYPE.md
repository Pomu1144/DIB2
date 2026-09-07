# Azurelake asset prototype

This branch integrates the five completed Batch 1 PNGs into the existing React + Phaser exploration game. Original PNG bytes, permanent asset IDs and category filenames are preserved. It does not generate or clear any backgrounds again.

## Run

Requires Node 22.12+ or Node 24 and npm.

```bash
npm ci
npm test
npm run dev
```

Open the URL printed by Vite. Move with WASD or arrows, click the ground to walk in a straight line, and press E at a front entrance or NPC. Click-to-walk stops at obstacles; it does not find paths around them. F3 toggles the collision/anchor overlay and a debug panel with reset buttons for all three sections.

## Integration

`public/assets/world/azurelake/runtime-manifest.json` is a small runtime projection of the revision 5 delivery manifest. It records relative paths, permanent IDs, original image checksums, Drive provenance, normalized origins, starting scales and rectangular ground footprints. It is not a replacement for the full asset production queue in Drive.

- White tree and street lamp replace their procedural stand-ins in all three sections.
- Crystal fountain replaces the plaza's painted circle and now has a solid base.
- Market stall supplies the shop art in the plaza and harbor.
- Three dock crates dress the harbor.
- Art depth follows ground-contact Y, including the player and NPC stand-ins.
- All collision rectangles come from `src/game/worldGeometry.ts`, shared by the scene and route tests.
- The player uses a 48×64 placeholder with an explicit 22×14 foot body instead of a scaled default texture.
- Opening a service menu stops movement; closing it resets held keys.
- Missing PNGs produce a console warning and a visible stand-in while retaining the same collision footprint. F3 reports how many assets actually loaded.

The PNGs remain full resolution, around 6.2 MiB combined on disk. Texture sizing, atlas packing, mobile GPU performance and production optimization remain future work.

## Validation performed

`npm test`: four passing tests verify exact image checksums, dimensions and RGBA PNG format, then perform conservative grid route searches with the player footprint through all three sections. Every service entrance, NPC and exit is reachable from its section spawn. Portal arrival positions avoid colliders and do not immediately retrigger an exit.

`npm run build`: TypeScript and the Vite production build pass. Vite reports the existing large Phaser application bundle; no bundle budget has been established.

Live browser QA could not run: the preview service reported running, but the test browser rejected access with `ERR_BLOCKED_BY_CLIENT`. Therefore asset appearance, frame rate, keyboard behavior, menu pausing and actual physics/transition execution are not claimed as tested. The PR stays a draft pending those checks.

## First playtest

1. Open the game and press F3. Confirm Assets 5/5 and inspect the red collision footprints and gold ground anchors.
2. Walk around the fountain, lamps and trees. Confirm that the avatar passes behind tall art, reappears in front, and cannot pass through the solid base.
3. Visit a front entrance and press E. Hold a movement key with the menu open; the avatar should remain stationary. Close the menu and move again.
4. Walk through the plaza's east exit to the arena and back, then its south exit to the harbor and back. Repeat to catch stale objects or transition problems.
5. In the harbor, inspect the crate footprints and verify that water remains solid.
6. Check the original shop purchases, team selection, healing and arena loop. No changes to those progression rules are intended.

## Assets still needed

Production terrain and verified road joins, the major building renders, player/NPC animation, remaining harbor/environment props and effects are unfinished. Their current stand-ins keep the first map playable. Art scale and ground-contact anchors are initial calibration values pending visual playtesting; passing the route tests is not final art approval.
