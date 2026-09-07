import type { Rect, Subsection } from './azurelake';
import { assetByName, footprintAt } from './worldAssets';

export function propPlacements(section: Subsection) {
  const placements = [
    ...section.trees.map(tree => ({ name: 'white-tree', x: tree.x, y: tree.y + 40 })),
    ...section.lamps.map(lamp => ({ name: 'street-lamp', ...lamp })),
  ];
  if (section.id === 'plaza') placements.push({ name: 'crystal-fountain', x: 960, y: 880 });
  if (section.id === 'harbor') for (const [x, y] of [[580, 720], [665, 775], [1350, 735]]) placements.push({ name: 'dock-crate', x, y });
  return placements;
}

export function sectionColliders(section: Subsection): Rect[] {
  const assetPlacements = [
    ...propPlacements(section),
    ...section.services.filter(service => service.action === 'shop').map(service => ({ name: 'market-stall', x: service.x + service.w / 2, y: service.y + service.h })),
  ];
  return [
    ...section.water,
    ...section.services.filter(service => service.action !== 'shop'),
    ...section.blockers.filter(blocker => !section.services.some(service => service.x === blocker.x && service.y === blocker.y)),
    ...section.npcs.map(npc => ({ x: npc.x - 12, y: npc.y - 12, w: 24, h: 16 })),
    ...assetPlacements.map(placement => {
      const asset = assetByName(placement.name);
      if (!asset) throw new Error(`Missing asset specification: ${placement.name}`);
      return footprintAt(asset, placement.x, placement.y);
    }),
  ];
}

export const sectionSpawns: Record<string, [number, number]> = { plaza: [850, 1120], arena: [960, 920], harbor: [960, 560] };
