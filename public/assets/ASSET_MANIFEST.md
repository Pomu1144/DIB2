# DIB2 Final Asset Manifest

The game code now expects the user's approved/reference art at these runtime paths.

## Celestial evolution line
- `/assets/creatures/divine.png` — Divine base humanoid celestial form; Army, Bestiary, battle portrait.
- `/assets/creatures/seraphic.png` — Seraphic evolved humanoid winged form; Army, Bestiary, battle portrait.
- `/assets/creatures/empyrean.png` — Empyrean final humanoid celestial form; Army, Bestiary, boss encounter.
- `/assets/creatures/empyrean-alt.png` — alternate Empyrean pose for special ability/cut-in art.

## Sacred Beasts
- `/assets/creatures/sun-sovereign.png` — white/gold lion Sacred Beast; Moonfen/Starfall progression counterpart; boss and Bestiary art.
- `/assets/creatures/moon-sovereign.png` — indigo/silver lunar quadruped; Moonfen boss and Bestiary art.

## Enemy families
- `/assets/creatures/nocturne.png` — hooded scythe Shadow unit; forest/ruins encounter family.
- `/assets/creatures/infernus.png` — red multi-headed infernal beast; volcanic/ruins encounter family and temporary Rift Drake-family art.

## World/environment slots
- `/assets/world/world-map.png` — full island navigation layer.
- `/assets/world/starter-town.png`
- `/assets/world/forest-path.png`
- `/assets/world/mountain-pass.png`
- `/assets/world/ancient-ruins.png`
- `/assets/world/volcanic-wastes.png`
- `/assets/world/celestial-peak.png`

## Integration behavior
The full island is never used as the walking camera. The player exists inside one named subsection at a time. The world map remains the region/travel layer; each region owns multiple subsections, encounters, a danger rating, and optional region boss.

Creature art is wired by `Creature.asset` in `src/gameData.ts`. The approved alternate Empyrean pose should be used for cinematic ability cut-ins once binary art is present in the repo.
