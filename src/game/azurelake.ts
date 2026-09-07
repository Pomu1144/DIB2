export type ServiceAction = 'heal' | 'shop' | 'team' | 'arena' | 'guild';
export type Rect = { x:number; y:number; w:number; h:number };
export type Service = Rect & { id:string; name:string; action:ServiceAction; tone:number };
export type Exit = Rect & { to:string; spawnX:number; spawnY:number; label:string };
export type Subsection = {
  id:string; name:string; width:number; height:number; water:Rect[]; blockers:Rect[]; services:Service[]; exits:Exit[];
  trees:{x:number;y:number;r:number}[]; lamps:{x:number;y:number}[]; npcs:{x:number;y:number;name:string;line:string}[];
};

const commonTrees=[{x:180,y:170,r:45},{x:280,y:230,r:38},{x:1740,y:190,r:50},{x:1660,y:270,r:36},{x:240,y:1420,r:48},{x:1730,y:1360,r:44}];

export const azurelake:Record<string,Subsection>={
  plaza:{id:'plaza',name:'Azurelake Spawn Plaza',width:1920,height:1536,
    water:[{x:1320,y:820,w:600,h:620}],blockers:[{x:760,y:470,w:400,h:280},{x:80,y:520,w:440,h:300},{x:80,y:930,w:420,h:300},{x:980,y:930,w:330,h:300}],
    services:[
      {id:'heal',name:'Healing Sanctuary',action:'heal',x:760,y:470,w:400,h:280,tone:0x8bd8ff},
      {id:'shop',name:'Market Hall',action:'shop',x:80,y:520,w:440,h:300,tone:0xd59b58},
      {id:'team',name:'Team Hall',action:'team',x:80,y:930,w:420,h:300,tone:0x8fa5ff},
      {id:'guild',name:'Guild Hall',action:'guild',x:980,y:930,w:330,h:300,tone:0xc7a36a}
    ],
    exits:[{x:1810,y:570,w:110,h:280,to:'arena',spawnX:120,spawnY:760,label:'Arena Quarter →'},{x:790,y:1430,w:340,h:106,to:'harbor',spawnX:960,spawnY:120,label:'Harbor ↓'}],
    trees:commonTrees,lamps:[{x:610,y:720},{x:1310,y:720},{x:610,y:1080},{x:1310,y:1080}],
    npcs:[{x:650,y:880,name:'Guide Lysa',line:'Welcome to Azurelake. The sanctuary, market and team hall are all nearby.'},{x:1470,y:700,name:'Dockhand',line:'The harbor is south. Ferries unlock after your first arena placement.'}]},
  arena:{id:'arena',name:'Arena Quarter',width:1920,height:1536,
    water:[],blockers:[{x:640,y:180,w:640,h:520},{x:200,y:980,w:360,h:280},{x:1360,y:970,w:360,h:280}],
    services:[{id:'arena',name:'Grand Arena',action:'arena',x:640,y:180,w:640,h:520,tone:0xb95b50}],
    exits:[{x:0,y:580,w:110,h:300,to:'plaza',spawnX:1770,spawnY:730,label:'← Spawn Plaza'}],
    trees:[{x:220,y:250,r:52},{x:1680,y:260,r:48},{x:180,y:1310,r:42},{x:1700,y:1320,r:42}],lamps:[{x:540,y:760},{x:1380,y:760},{x:680,y:880},{x:1240,y:880}],
    npcs:[{x:960,y:820,name:'Arena Registrar',line:'Local brackets run continuously. Win three rounds to earn an Azure Crest.'},{x:520,y:1030,name:'Trainer',line:'Speed matters here. High Time Unit skills can leave you exposed.'}]},
  harbor:{id:'harbor',name:'Azurelake Harbor',width:1920,height:1536,
    water:[{x:0,y:860,w:1920,h:676}],blockers:[{x:120,y:180,w:420,h:300},{x:1380,y:190,w:390,h:300},{x:760,y:760,w:400,h:150}],
    services:[{id:'shop',name:'Harbor Supply',action:'shop',x:120,y:180,w:420,h:300,tone:0x9b7b59}],
    exits:[{x:790,y:0,w:340,h:100,to:'plaza',spawnX:960,spawnY:1380,label:'↑ Spawn Plaza'}],
    trees:[{x:650,y:270,r:38},{x:1260,y:300,r:42}],lamps:[{x:650,y:690},{x:1260,y:690},{x:740,y:820},{x:1180,y:820}],
    npcs:[{x:980,y:640,name:'Harbormaster',line:'Routes beyond Azurelake open as your guild rank rises.'},{x:1450,y:620,name:'Sailor',line:'They say something enormous moves beneath the eastern water.'}]}
};
