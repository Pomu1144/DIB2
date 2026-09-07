import Phaser from 'phaser';
import { azurelake, Rect, Service, Subsection } from './azurelake';
import { gameEvents } from './EventBus';

const COLORS={ground:0x8e8a78,path:0xc9c0a7,water:0x367f9e,water2:0x2e6e8b,wall:0x3d4146,roof:0x263b55,tree:0x294d39,tree2:0x3c6b4d,gold:0xd2b06f,white:0xe8e0cf};

export class AzurelakeScene extends Phaser.Scene {
  private player!:Phaser.Physics.Arcade.Sprite;
  private cursors!:Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!:Record<string,Phaser.Input.Keyboard.Key>;
  private interact!:Phaser.Input.Keyboard.Key;
  private blockers!:Phaser.Physics.Arcade.StaticGroup;
  private current:Subsection=azurelake.plaza;
  private prompt?:Phaser.GameObjects.Text;
  private nearbyService?:Service;
  private nearbyNpc?:{name:string;line:string};
  private transitioning=false;

  constructor(){super('Azurelake');}
  create(){
    this.cameras.main.setBackgroundColor('#0a1014');
    this.cursors=this.input.keyboard!.createCursorKeys();
    this.wasd=this.input.keyboard!.addKeys('W,A,S,D') as Record<string,Phaser.Input.Keyboard.Key>;
    this.interact=this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.buildSection('plaza',960,1180);
  }

  private buildSection(id:string,spawnX:number,spawnY:number){
    this.transitioning=false; this.current=azurelake[id]; this.children.removeAll(true); this.physics.world.colliders.destroy();
    this.physics.world.setBounds(0,0,this.current.width,this.current.height); this.cameras.main.setBounds(0,0,this.current.width,this.current.height);
    this.blockers=this.physics.add.staticGroup();
    this.drawGround(); this.drawWater(); this.drawBuildings(); this.drawProps(); this.drawNPCs(); this.drawExits();
    this.player=this.physics.add.sprite(spawnX,spawnY,'__DEFAULT').setDisplaySize(34,46).setTint(0x202833).setDepth(20);
    this.player.body!.setSize(28,36); this.player.setCollideWorldBounds(true); this.physics.add.collider(this.player,this.blockers);
    this.cameras.main.startFollow(this.player,true,.1,.1); this.cameras.main.setZoom(.78); this.prompt=this.add.text(16,16,'',{fontFamily:'Georgia',fontSize:'18px',color:'#f2e8cf',backgroundColor:'#101419dd',padding:{x:10,y:7}}).setScrollFactor(0).setDepth(100);
    this.add.text(22,70,this.current.name.toUpperCase(),{fontFamily:'Georgia',fontSize:'22px',color:'#d9c18a'}).setScrollFactor(0).setDepth(100);
    gameEvents.emit({type:'subsection',id:this.current.id,name:this.current.name});
  }

  private rect(g:Phaser.GameObjects.Graphics,r:Rect,color:number,alpha=1){g.fillStyle(color,alpha);g.fillRoundedRect(r.x,r.y,r.w,r.h,12)}
  private addBlock(r:Rect){const o=this.add.rectangle(r.x+r.w/2,r.y+r.h/2,r.w,r.h,0x000000,0);this.physics.add.existing(o,true);this.blockers.add(o)}

  private drawGround(){
    const g=this.add.graphics();g.fillStyle(COLORS.ground).fillRect(0,0,this.current.width,this.current.height);
    g.fillStyle(COLORS.path,.95);
    if(this.current.id==='lower-ward'){
      g.fillRoundedRect(575,0,770,this.current.height,28);
      [300,720,1140,1540].forEach(y=>g.fillRoundedRect(350,y,1220,250,24));
      [560,980,1400].forEach(y=>{g.fillStyle(0xb9b09a,1).fillRoundedRect(720,y,480,120,16);for(let sy=y+15;sy<y+120;sy+=18)g.lineStyle(2,0x827e72,.45).lineBetween(735,sy,1185,sy);});
      g.fillStyle(COLORS.path,.95);
    } else {
      g.fillRoundedRect(520,0,880,this.current.height,36);g.fillRoundedRect(0,650,this.current.width,320,36);
    }
    for(let i=0;i<80;i++){const x=Phaser.Math.Between(0,this.current.width),y=Phaser.Math.Between(0,this.current.height);g.fillStyle(0xffffff,.035).fillCircle(x,y,Phaser.Math.Between(2,5))}
    if(this.current.id==='plaza'){g.lineStyle(8,0xb6aa8f,1).strokeCircle(960,820,180);g.fillStyle(0x4f91ab).fillCircle(960,820,150);g.fillStyle(0xd9d2c3).fillCircle(960,820,38)}
  }

  private drawWater(){
    const g=this.add.graphics();this.current.water.forEach(r=>{this.rect(g,r,COLORS.water);for(let y=r.y+18;y<r.y+r.h;y+=34){g.lineStyle(3,COLORS.water2,.7).lineBetween(r.x+8,y,r.x+r.w-8,y)};this.addBlock(r)});
    if(this.current.id==='lower-ward'){
      [390,810,1230,1580].forEach(y=>{
        g.fillStyle(COLORS.path,1).fillRoundedRect(390,y,230,92,20);g.fillRoundedRect(1300,y,230,92,20);
        g.lineStyle(5,0x28313b,1).strokeRoundedRect(400,y+8,210,76,16);g.strokeRoundedRect(1310,y+8,210,76,16);
      });
      g.fillStyle(0xdde5ec,.7);for(let y=1690;y<1880;y+=30){g.fillRect(445,y,75,12);g.fillRect(1400,y,75,12)}
    }
  }

  private drawBuildings(){
    const g=this.add.graphics();
    this.current.services.forEach(s=>{g.fillStyle(COLORS.wall).fillRoundedRect(s.x,s.y,s.w,s.h,14);g.fillStyle(COLORS.roof).fillTriangle(s.x-18,s.y+35,s.x+s.w/2,s.y-88,s.x+s.w+18,s.y+35);g.lineStyle(5,s.tone,1).strokeRoundedRect(s.x+10,s.y+10,s.w-20,s.h-20,10);g.fillStyle(0x1c1e21).fillRect(s.x+s.w/2-44,s.y+s.h-66,88,66);this.add.text(s.x+s.w/2,s.y+s.h/2-10,s.name,{fontFamily:'Georgia',fontSize:'25px',color:'#f0e7d2',align:'center'}).setOrigin(.5).setDepth(3);this.addBlock(s)});
    this.current.blockers.filter(b=>!this.current.services.some(s=>s.x===b.x&&s.y===b.y)).forEach(b=>{g.fillStyle(0x45413c).fillRoundedRect(b.x,b.y,b.w,b.h,12);this.addBlock(b)});
  }

  private drawProps(){
    this.current.trees.forEach(t=>{const g=this.add.graphics();g.fillStyle(0x473929).fillRect(t.x-8,t.y,16,40);g.fillStyle(COLORS.tree).fillCircle(t.x,t.y,t.r);g.fillStyle(COLORS.tree2,.8).fillCircle(t.x-16,t.y-12,t.r*.55);g.setDepth(7)});
    this.current.lamps.forEach(l=>{const g=this.add.graphics();g.lineStyle(7,0x2a2928).lineBetween(l.x,l.y,l.x,l.y-62);g.fillStyle(COLORS.gold).fillCircle(l.x,l.y-70,11);g.setDepth(8)});
  }

  private drawNPCs(){
    this.current.npcs.forEach(n=>{const c=this.add.circle(n.x,n.y,18,0x39475b).setDepth(16);this.physics.add.existing(c,true);c.setData('npc',n);this.blockers.add(c);this.add.text(n.x,n.y-38,n.name,{fontFamily:'Arial',fontSize:'12px',color:'#dfd6c4',backgroundColor:'#11151aaa'}).setOrigin(.5).setDepth(17)});
  }

  private drawExits(){
    this.current.exits.forEach(e=>{const zone=this.add.zone(e.x+e.w/2,e.y+e.h/2,e.w,e.h);this.physics.add.existing(zone,true);zone.setData('exit',e);this.add.text(e.x+e.w/2,e.y+e.h/2,e.label,{fontFamily:'Georgia',fontSize:'18px',color:e.locked?'#9ba4ad':'#f0d594',backgroundColor:'#15191dcc',padding:{x:8,y:5}}).setOrigin(.5).setDepth(9)});
  }

  update(){
    if(!this.player)return;const speed=230;let vx=0,vy=0;if(this.cursors.left.isDown||this.wasd.A.isDown)vx=-speed;if(this.cursors.right.isDown||this.wasd.D.isDown)vx=speed;if(this.cursors.up.isDown||this.wasd.W.isDown)vy=-speed;if(this.cursors.down.isDown||this.wasd.S.isDown)vy=speed;if(vx&&vy){vx*=.707;vy*=.707}this.player.setVelocity(vx,vy);
    this.resolveNearby();this.resolveExit();if(Phaser.Input.Keyboard.JustDown(this.interact))this.activateNearby();
  }

  private resolveNearby(){
    let service:Service|undefined;let npc:{name:string;line:string}|undefined;let best=150;
    for(const s of this.current.services){const x=Phaser.Math.Clamp(this.player.x,s.x,s.x+s.w),y=Phaser.Math.Clamp(this.player.y,s.y,s.y+s.h),d=Phaser.Math.Distance.Between(this.player.x,this.player.y,x,y);if(d<best){best=d;service=s}}
    for(const n of this.current.npcs){const d=Phaser.Math.Distance.Between(this.player.x,this.player.y,n.x,n.y);if(d<105)npc=n}
    this.nearbyService=service;this.nearbyNpc=npc;
    if(this.prompt)this.prompt.setText(service?`[E] ${service.name}`:npc?`[E] Talk to ${npc.name}`:'WASD / Arrows to move');
  }

  private activateNearby(){
    if(this.nearbyService)gameEvents.emit({type:'interaction',action:this.nearbyService.action,label:this.nearbyService.name});
    else if(this.nearbyNpc)gameEvents.emit({type:'toast',message:`${this.nearbyNpc.name}: “${this.nearbyNpc.line}”`});
  }

  private resolveExit(){if(this.transitioning)return;for(const e of this.current.exits){if(e.locked)continue;if(this.player.x>e.x&&this.player.x<e.x+e.w&&this.player.y>e.y&&this.player.y<e.y+e.h){this.transitioning=true;this.cameras.main.fadeOut(180,0,0,0);this.time.delayedCall(190,()=>{this.buildSection(e.to,e.spawnX,e.spawnY);this.cameras.main.fadeIn(180,0,0,0)});break}}
  }
}
