import manifest from '../../public/assets/world/azurelake/runtime-manifest.json';
import type { Rect } from './azurelake';

export const worldAssets = manifest.assets;
export type WorldAsset = typeof worldAssets[number];
export const assetByName = (name: string) => worldAssets.find(asset => asset.name === name);
export function footprintAt(asset: WorldAsset, x: number, y: number): Rect {
  return { ...asset.footprint, x: x + asset.footprint.x, y: y + asset.footprint.y };
}
export const WORLD_ASSET_ROOT = `${import.meta.env?.BASE_URL ?? '/'}assets/world/azurelake/`;
