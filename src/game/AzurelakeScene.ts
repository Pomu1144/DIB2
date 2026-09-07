import Phaser from 'phaser';
import { azurelake, Rect, Service, Subsection } from './azurelake';
import { gameEvents } from './EventBus';
import { assetByName, worldAssets, WORLD_ASSET_ROOT } from './worldAssets';
import { propPlacements, sectionColliders, sectionSpawns as SPAWNS } from './worldGeometry';

const COLORS = { ground: 0x526a62, path: 0xbab9a7, water: 0x367f9e, wall: 0x667170, roof: 0x263b55, gold: 0xd2b06f };
const HUD_DEPTH = 10000;

export class AzurelakeScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private blockers!: Phaser.Physics.Arcade.StaticGroup;
  private current: Subsection = azurelake.plaza;
  private prompt?: Phaser.GameObjects.Text;
  private nearbyService?: Service;
  private nearbyNpc?: { name: string; line: string };
  private transitioning = false;
  private menuOpen = false;
  private debugEnabled = false;
  private debugGraphics?: Phaser.GameObjects.Graphics;
  private debugAt = 0;
  private collisionRects: Rect[] = [];
  private anchors: { x: number; y: number }[] = [];
  private moveTarget?: Phaser.Math.Vector2;
  private targetMarker?: Phaser.GameObjects.Arc;

  constructor() { super('Azurelake'); }

  preload() {
    for (const asset of worldAssets) this.load.image(asset.id, WORLD_ASSET_ROOT + asset.path);
    this.load.on('loaderror', (file: Phaser.Loader.File) => console.warn(`Asset unavailable: ${file.key}; using a placeholder.`));
  }

  create() {
    this.cameras.main.setBackgroundColor('#0a1014');
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keys = this.input.keyboard!.addKeys('W,A,S,D,E,F3') as Record<string, Phaser.Input.Keyboard.Key>;
    this.makePlayerTexture();
    const unsubscribe = gameEvents.subscribe(event => {
      if (event.type === 'menu') {
        this.menuOpen = event.open;
        this.stopWalking();
        this.input.keyboard!.resetKeys();
      }
      if (event.type === 'debug-travel' && this.debugEnabled && !this.transitioning && !this.menuOpen && SPAWNS[event.section]) {
        this.buildSection(event.section, ...SPAWNS[event.section]);
      }
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, unsubscribe);
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.menuOpen || this.transitioning || pointer.button !== 0) return;
      const position = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      this.moveTarget = new Phaser.Math.Vector2(position.x, position.y);
      this.targetMarker?.setPosition(position.x, position.y).setVisible(true);
    });
    this.buildSection('plaza', ...SPAWNS.plaza);
  }

  private makePlayerTexture() {
    if (this.textures.exists('prototype-player')) return;
    // A deliberately simple, correctly sized avatar until player animation art is supplied.
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x101d26, .3).fillEllipse(24, 57, 30, 10);
    g.fillStyle(0x293b51).fillRoundedRect(12, 23, 24, 31, 7);
    g.fillStyle(0x83c8cd).fillTriangle(24, 20, 8, 46, 40, 46);
    g.fillStyle(0xe0c29c).fillCircle(24, 15, 9);
    g.fillStyle(0x293442).fillRoundedRect(14, 5, 20, 9, 4);
    g.fillStyle(0x26313d).fillRect(15, 48, 7, 10).fillRect(27, 48, 7, 10);
    g.generateTexture('prototype-player', 48, 64); g.destroy();
  }

  private buildSection(id: string, spawnX: number, spawnY: number) {
    this.stopWalking();
    this.physics.world.colliders.destroy();
    this.blockers?.clear(true, true);
    this.blockers?.destroy();
    this.children.removeAll(true);
    this.current = azurelake[id]; this.transitioning = false;
    this.collisionRects = []; this.anchors = [];
    this.nearbyService = undefined; this.nearbyNpc = undefined;
    this.physics.world.setBounds(0, 0, this.current.width, this.current.height);
    this.cameras.main.setBounds(0, 0, this.current.width, this.current.height);
    this.blockers = this.physics.add.staticGroup();
    for (const rectangle of sectionColliders(this.current)) this.addBlock(rectangle);
    this.drawGround(); this.drawWater(); this.drawBuildings(); this.drawProps(); this.drawNPCs(); this.drawExits();
    this.targetMarker = this.add.circle(0, 0, 10, 0xdac38e, .25).setStrokeStyle(2, 0xf0dda7).setDepth(2).setVisible(false);
    this.player = this.physics.add.sprite(spawnX, spawnY, 'prototype-player').setOrigin(.5, .9);
    this.player.setSize(22, 14).setOffset(13, 45).setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.blockers, () => this.stopWalking());
    this.cameras.main.startFollow(this.player, true, .12, .12); this.cameras.main.setZoom(.9);
    this.prompt = this.add.text(18, 20, '', { fontFamily: 'Arial', fontSize: '16px', color: '#f2e8cf', backgroundColor: '#101419dd', padding: { x: 10, y: 7 } }).setScrollFactor(0).setDepth(HUD_DEPTH);
    this.debugGraphics = this.add.graphics().setDepth(HUD_DEPTH - 1);
    this.redrawDebug(); this.publishDebug();
    gameEvents.emit({ type: 'subsection', id: this.current.id, name: this.current.name });
  }

  private stopWalking() { this.moveTarget = undefined; this.targetMarker?.setVisible(false); this.player?.setVelocity(0, 0); }
  private addBlock(r: Rect) {
    const object = this.add.rectangle(r.x + r.w / 2, r.y + r.h / 2, r.w, r.h, 0, 0);
    this.physics.add.existing(object, true); this.blockers.add(object); this.collisionRects.push(r);
  }

  private placeAsset(name: string, x: number, y: number) {
    const asset = assetByName(name);
    if (!asset) return false;
    this.anchors.push({ x, y });
    if (this.textures.exists(asset.id)) {
      this.add.image(x, y, asset.id).setOrigin(asset.origin[0], asset.origin[1]).setScale(asset.scale).setDepth(y);
    } else {
      // Keep the same footprint and playable layout if an individual PNG fails to load.
      const r = asset.footprint;
      this.add.rectangle(x, y - r.h / 2, r.w, Math.max(30, r.h), 0x677b80).setStrokeStyle(2, 0xcbbb91).setDepth(y);
    }
    return true;
  }

  private drawGround() {
    const g = this.add.graphics().setDepth(-10);
    g.fillStyle(COLORS.ground).fillRect(0, 0, this.current.width, this.current.height);
    g.fillStyle(0x8f9b86).fillRoundedRect(490, 0, 940, this.current.height, 22).fillRoundedRect(0, 620, this.current.width, 380, 22);
    g.fillStyle(COLORS.path).fillRect(520, 0, 880, this.current.height).fillRect(0, 650, this.current.width, 320);
    // Deterministic prototype paving. Generated terrain is not yet approved for seamless joins.
    for (let y = 0; y < this.current.height; y += 36) {
      for (let x = -48; x < this.current.width; x += 96) {
        const bx = x + (Math.floor(y / 36) % 2) * 48;
        if ((bx >= 520 && bx + 94 <= 1400) || (y >= 650 && y + 34 <= 970)) {
          const tone = [0xb9bbaa, 0xc2c2af, 0xb0b6a7][Math.abs(Math.floor(bx / 48) + y / 36) % 3];
          g.fillStyle(tone).fillRoundedRect(bx + 1, y + 1, 93, 33, 3);
          g.lineStyle(1, 0x728078, .22).strokeRoundedRect(bx + 1, y + 1, 93, 33, 3);
        }
      }
    }
    if (this.current.id === 'plaza') g.lineStyle(5, 0xe1dac1, .7).strokeEllipse(960, 838, 400, 200);
  }

  private drawWater() {
    const g = this.add.graphics().setDepth(-5);
    for (const r of this.current.water) {
      g.fillStyle(COLORS.water).fillRect(r.x, r.y, r.w, r.h);
      g.lineStyle(6, 0x9aafaa).strokeRect(r.x, r.y, r.w, r.h);
      for (let y = r.y + 22; y < r.y + r.h; y += 32) {
        for (let x = r.x + 20; x < r.x + r.w - 40; x += 100) g.lineStyle(2, 0x9bd1cf, .3).lineBetween(x, y, x + 35, y);
      }
    }
  }

  private drawBuildings() {
    for (const s of this.current.services) {
      const y = s.y + s.h;
      if (s.action === 'shop') {
        this.placeAsset('market-stall', s.x + s.w / 2, y);
      } else {
        const g = this.add.graphics().setDepth(y);
        g.fillStyle(COLORS.wall).fillRoundedRect(s.x, s.y, s.w, s.h, 12);
        g.fillStyle(COLORS.roof).fillTriangle(s.x - 18, s.y + 35, s.x + s.w / 2, s.y - 88, s.x + s.w + 18, s.y + 35);
        g.lineStyle(4, s.tone, .7).strokeRoundedRect(s.x + 10, s.y + 10, s.w - 20, s.h - 20, 8);
        g.fillStyle(0x1c262b).fillRect(s.x + s.w / 2 - 38, y - 68, 76, 68);
      }
      this.add.text(s.x + s.w / 2, y + 12, s.name, { fontFamily: 'Georgia', fontSize: '20px', color: '#f0e7d2', backgroundColor: '#203033dd', padding: { x: 7, y: 4 } }).setOrigin(.5, 0).setDepth(y + 1);
    }
    for (const b of this.current.blockers.filter(b => !this.current.services.some(s => s.x === b.x && s.y === b.y))) {
      this.add.graphics().fillStyle(0x69746e).fillRoundedRect(b.x, b.y, b.w, b.h, 12).setDepth(b.y + b.h);
    }
  }

  private drawProps() {
    for (const prop of propPlacements(this.current)) this.placeAsset(prop.name, prop.x, prop.y);
  }

  private drawNPCs() {
    for (const n of this.current.npcs) {
      this.add.image(n.x, n.y, 'prototype-player').setOrigin(.5, .9).setTint(0xaaa7b7).setDepth(n.y);
      this.add.text(n.x, n.y - 63, n.name, { fontFamily: 'Arial', fontSize: '12px', color: '#dfd6c4', backgroundColor: '#11151aaa' }).setOrigin(.5).setDepth(n.y + 1);
    }
  }

  private drawExits() {
    for (const e of this.current.exits) this.add.text(e.x + e.w / 2, e.y + e.h / 2, e.label, { fontFamily: 'Georgia', fontSize: '18px', color: '#f0d594', backgroundColor: '#15191dcc', padding: { x: 8, y: 5 } }).setOrigin(.5).setDepth(5000);
  }

  update(time: number) {
    if (!this.player) return;
    if (Phaser.Input.Keyboard.JustDown(this.keys.F3)) { this.debugEnabled = !this.debugEnabled; this.redrawDebug(); this.publishDebug(); }
    this.player.setDepth(this.player.y);
    if (this.debugEnabled && time > this.debugAt) { this.debugAt = time + 100; this.publishDebug(); this.redrawDebug(); }
    if (this.menuOpen || this.transitioning) { this.stopWalking(); return; }
    let x = Number(this.cursors.right.isDown || this.keys.D.isDown) - Number(this.cursors.left.isDown || this.keys.A.isDown);
    let y = Number(this.cursors.down.isDown || this.keys.S.isDown) - Number(this.cursors.up.isDown || this.keys.W.isDown);
    if (x || y) { this.moveTarget = undefined; this.targetMarker?.setVisible(false); }
    else if (this.moveTarget) {
      x = this.moveTarget.x - this.player.x; y = this.moveTarget.y - this.player.y;
      if (Math.hypot(x, y) < 8) { this.stopWalking(); x = 0; y = 0; }
    }
    const length = Math.hypot(x, y);
    this.player.setVelocity(length ? 230 * x / length : 0, length ? 230 * y / length : 0);
    this.resolveNearby(); this.resolveExit();
    if (!this.transitioning && Phaser.Input.Keyboard.JustDown(this.keys.E)) this.activateNearby();
  }

  private resolveNearby() {
    this.nearbyService = undefined; this.nearbyNpc = undefined;
    let best = 115;
    for (const service of this.current.services) {
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, service.x + service.w / 2, service.y + service.h + 35);
      if (distance < best) { best = distance; this.nearbyService = service; }
    }
    if (!this.nearbyService) for (const npc of this.current.npcs) {
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y);
      if (distance < best) { best = distance; this.nearbyNpc = npc; }
    }
    this.prompt?.setText(this.nearbyService ? `[E] ${this.nearbyService.name}` : this.nearbyNpc ? `[E] Talk to ${this.nearbyNpc.name}` : 'WASD / Arrows · Click to walk · E to interact · F3 debug');
  }

  private activateNearby() {
    if (this.nearbyService) { this.menuOpen = true; this.stopWalking(); gameEvents.emit({ type: 'interaction', action: this.nearbyService.action, label: this.nearbyService.name }); }
    else if (this.nearbyNpc) gameEvents.emit({ type: 'toast', message: `${this.nearbyNpc.name}: “${this.nearbyNpc.line}”` });
  }

  private resolveExit() {
    for (const exit of this.current.exits) {
      if (Phaser.Geom.Rectangle.Contains(new Phaser.Geom.Rectangle(exit.x, exit.y, exit.w, exit.h), this.player.x, this.player.y)) {
        this.transitioning = true; this.stopWalking(); this.cameras.main.fadeOut(180, 0, 0, 0);
        this.time.delayedCall(190, () => { this.buildSection(exit.to, exit.spawnX, exit.spawnY); this.cameras.main.fadeIn(180, 0, 0, 0); }); break;
      }
    }
  }

  private redrawDebug() {
    const g = this.debugGraphics; if (!g) return; g.clear(); if (!this.debugEnabled) return;
    g.lineStyle(2, 0xff7373, .9); for (const r of this.collisionRects) g.strokeRect(r.x, r.y, r.w, r.h);
    g.lineStyle(2, 0x72eecb); for (const e of this.current.exits) g.strokeRect(e.x, e.y, e.w, e.h);
    g.lineStyle(2, 0xf0d27c); for (const s of this.current.services) g.strokeCircle(s.x + s.w / 2, s.y + s.h + 35, 115);
    for (const a of this.anchors) { g.lineStyle(2, 0xfef3b5).lineBetween(a.x - 6, a.y, a.x + 6, a.y).lineBetween(a.x, a.y - 6, a.x, a.y + 6); }
    const body = this.player?.body; if (body) g.lineStyle(2, 0xffffff).strokeRect(body.x, body.y, body.width, body.height);
  }

  private publishDebug() {
    gameEvents.emit({ type: 'debug', enabled: this.debugEnabled, section: this.current.id, x: Math.round(this.player?.x ?? 0), y: Math.round(this.player?.y ?? 0), loaded: worldAssets.filter(asset => this.textures.exists(asset.id)).length, total: worldAssets.length, blockers: this.collisionRects.length });
  }
}
