# DIB2 Playable World Architecture

DIB2 uses React for menus, inventory, teams, shops, tournaments and other application UI, while Phaser owns real-time exploration, camera movement, collision, NPC placement and subsection transitions.

## Current vertical slice

Azurelake is implemented as connected playable subsections rather than a single background image:

- `plaza` — spawn, Healing Sanctuary, Market Hall, Team Hall, Guild Hall, NPCs, fountain and exits.
- `arena` — Grand Arena, tournament registrar, trainer and return route.
- `harbor` — harbor supply shop, harbormaster, sailor and return route.

Walking into an exit zone fades and loads the neighboring subsection at the matching entrance coordinate. Buildings, water and NPCs have real collision geometry. Interactions happen near a building or NPC with `E`.

## Systems already wired

- WASD / arrow movement and following camera
- solid collision and water boundaries
- local subsection loading
- service interaction event bridge from Phaser to React
- free healing in Azurelake
- shop with gold and inventory persistence
- three-creature active team management
- three-round local arena tournament
- guild progression panel
- localStorage save state
- existing creature abilities used in arena combat
- reusable subsection data model for future towns, routes and dungeons

## AI asset workflow

Concept art is never used as the only collision map. AI artwork is the visual target. A gameplay subsection is built from separate high-resolution environment assets plus invisible collision geometry.

Expected runtime art structure:

```
public/assets/world/azurelake/
  style-guide.png
  ground/
  buildings/
  props/
  vegetation/
  water/
  npcs/
```

Until those final pieces are present, the Phaser scene draws procedural vector stand-ins so the entire gameplay loop remains testable.

## Scaling to the island

Every future region should use the same schema: `Region -> Subsection -> Services/NPCs/Encounters/Exits`. No world-scale image is loaded as a walking map. Adjacent subsections can later be preloaded during edge approach to make transitions effectively instantaneous.
