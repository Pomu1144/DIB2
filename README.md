# DIB2 — Isles of Ascendance

Original creature-collection / army RPG inspired by compact exploration and time-unit combat. This project does not redistribute Dragon Island Blue copyrighted art, maps, text, audio, or UI assets.

## Run
```bash
npm install
npm run dev
```

## Foundation included
- Segmented island world: world travel graph + local subsection model
- Turn/time-unit ability data
- Party / Army UI and Bestiary
- Variable-length, data-driven evolution graph (not limited to three stages)
- Divine → Seraphic → Empyrean sample line
- Sun and Moon Sacred Beast records
- Battle prototype and enemy HP loop
- Responsive original tactical-fantasy UI

## World scale target
The prototype starts with 8 connected subsections. Production content scales the same graph/data model to 80–120+ subsections, grouped into regions, settlements, dungeons, routes, sanctums and boss arenas. The player plays inside a subsection; the entire island is only the navigation/travel layer.

## Higgsfield asset pipeline
Use Higgsfield for original production assets. Never copy or trace Dragon Island Blue assets 1:1.

- `public/assets/creatures/<creature-id>/<form>.webp` — transparent creature renders
- `public/assets/maps/<region>/<subsection>.webp` — local environment plates
- `public/assets/ui/` — original frames, buttons, affinity icons
- `public/assets/fx/` — ability effects

Creature brief: dark-fantasy military creature concept art; exaggerated readable silhouette; sculptural layered anatomy; organic armor; restrained accessories; polished strategy-RPG render; transparent/no background; avoid generic D&D anatomy, excessive spikes, comic outlines and copyrighted character likenesses.

Divine brief: elegant supernatural anatomy, large flowing shapes, controlled palette, strong halo/astral motif where appropriate, humanoid silhouette for Divine line, distinct pose at every evolution, minimal accessories, transparent background.

## Next systems
Content expansion, local movement, encounter tables, capture, XP/leveling, evolution requirements, fusion, inventory, shops, NPCs, quests, save/load, platoon composition bonuses, commanders, AI, bosses, audio and production assets.