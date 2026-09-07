import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { AzurelakeScene } from './AzurelakeScene';

export function GameCanvas(){
  const host=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    if(!host.current)return;
    const game=new Phaser.Game({
      type:Phaser.AUTO,
      parent:host.current,
      width:1280,
      height:720,
      backgroundColor:'#0a1014',
      physics:{default:'arcade',arcade:{debug:false}},
      scene:[AzurelakeScene],
      scale:{mode:Phaser.Scale.RESIZE,autoCenter:Phaser.Scale.CENTER_BOTH},
      render:{antialias:true,pixelArt:false,roundPixels:false}
    });
    return()=>game.destroy(true);
  },[]);
  return <div ref={host} className="game-canvas"/>;
}
