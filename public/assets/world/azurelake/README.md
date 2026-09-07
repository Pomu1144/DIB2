# Azurelake runtime asset slots

The current playable scene uses procedural vector stand-ins so movement, collision, services and transitions can be tested without blocking on final art.

Replace these progressively with high-resolution AI-generated transparent assets matching the approved Azurelake style guide stored in the project's Google Drive `DIB2/public/assets/world/azurelake` folder:

- `ground/stone-path.png`
- `ground/grass.png`
- `water/lake-edge.png`
- `buildings/healing-sanctuary.png`
- `buildings/market-hall.png`
- `buildings/team-hall.png`
- `buildings/guild-hall.png`
- `buildings/grand-arena.png`
- `buildings/harbor-supply.png`
- `props/fountain.png`
- `props/lamppost.png`
- `props/banner.png`
- `vegetation/tree-01.png`
- `vegetation/tree-02.png`
- `npcs/guide-lysa.png`
- `npcs/arena-registrar.png`
- `npcs/harbormaster.png`

Final art must not contain baked collision, text labels, player sprites or UI. Collision and interaction geometry remain in Phaser data.
