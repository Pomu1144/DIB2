import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { azurelake } from '../src/game/azurelake';
import { worldAssets } from '../src/game/worldAssets';
import { sectionColliders, sectionSpawns } from '../src/game/worldGeometry';

test('all runtime PNGs preserve the delivered artwork, dimensions and RGBA format', () => {
  assert.equal(new Set(worldAssets.map(asset => asset.id)).size, worldAssets.length);
  for (const asset of worldAssets) {
    const bytes = readFileSync(new URL('../public/assets/world/azurelake/' + asset.path, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.source.sha256, asset.id);
    assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.deepEqual([bytes.readUInt32BE(16), bytes.readUInt32BE(20)], asset.source.dimensions);
    assert.equal(bytes[25], 6, `${asset.id} must use RGBA`);
    assert.ok(asset.origin.every(value => value >= 0 && value <= 1));
    assert.ok(asset.scale > 0 && asset.footprint.w > 0 && asset.footprint.h > 0);
  }
});

for (const section of Object.values(azurelake)) {
  test(`${section.id}: entrances and exits remain reachable with the player's footprint`, () => {
    const solids = sectionColliders(section);
    // The real 22 x 14 player foot body extends about 13px above its ground anchor.
    // Inflate slightly so this route check is conservative, on a 10px grid.
    const clear = (x: number, y: number) => x >= 12 && y >= 14 && x <= section.width - 12 && y <= section.height - 3 && !solids.some(r => x + 12 > r.x && x - 12 < r.x + r.w && y + 3 > r.y && y - 14 < r.y + r.h);
    const start = sectionSpawns[section.id]; assert.ok(clear(...start), 'default spawn is clear');
    const queue: [number, number][] = [start]; const visited = new Set([start.join(',')]);
    for (let head = 0; head < queue.length; head++) {
      const [x, y] = queue[head];
      for (const [dx, dy] of [[10, 0], [-10, 0], [0, 10], [0, -10]]) {
        const nx = x + dx, ny = y + dy, key = `${nx},${ny}`;
        if (!visited.has(key) && clear(nx, ny)) { visited.add(key); queue.push([nx, ny]); }
      }
    }
    for (const service of section.services) {
      const x = service.x + service.w / 2, y = service.y + service.h + 35;
      assert.ok(queue.some(([qx, qy]) => Math.hypot(qx - x, qy - y) < 35), `${service.name} entrance unreachable`);
    }
    for (const npc of section.npcs) assert.ok(queue.some(([x, y]) => Math.hypot(x - npc.x, y - npc.y) < 105), `${npc.name} unreachable`);
    for (const exit of section.exits) {
      assert.ok(queue.some(([x, y]) => x > exit.x && x < exit.x + exit.w && y > exit.y && y < exit.y + exit.h), `exit to ${exit.to} unreachable`);
      const destination = azurelake[exit.to]; assert.ok(destination);
      assert.ok(!sectionColliders(destination).some(r => exit.spawnX + 12 > r.x && exit.spawnX - 12 < r.x + r.w && exit.spawnY + 3 > r.y && exit.spawnY - 14 < r.y + r.h), `arrival in ${exit.to} intersects a collider`);
      assert.ok(!destination.exits.some(e => exit.spawnX >= e.x && exit.spawnX <= e.x + e.w && exit.spawnY >= e.y && exit.spawnY <= e.y + e.h), 'arrival must not immediately trigger a return');
    }
  });
}
