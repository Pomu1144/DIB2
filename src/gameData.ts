export type Creature={id:string;name:string;stage:number;next?:string;level:number;hp:number;maxHp:number;atk:number;def:number;magic:number;speed:number;affinity:string;role:string;abilities:{name:string;tu:number;effect:string}[]};
export const creatures:Creature[]=[
{id:'divine',name:'Divine',stage:1,next:'seraphic',level:12,hp:920,maxHp:920,atk:122,def:135,magic:188,speed:106,affinity:'Radiance',role:'Celestial',abilities:[{name:'Smite',tu:150,effect:'Heavy magical damage to one foe.'},{name:'Divine Protection',tu:0,effect:'Passive: immune to negative status effects.'},{name:'Judgement',tu:300,effect:'Magical damage to all foes.'},{name:'Retribution',tu:120,effect:'Physical damage; doubled against Demonic foes.'},{name:'Purify',tu:200,effect:'Remove all negative effects from allies.'}]},
{id:'seraphic',name:'Seraphic',stage:2,next:'empyrean',level:32,hp:1760,maxHp:1760,atk:205,def:238,magic:340,speed:118,affinity:'Radiance',role:'Seraph',abilities:[{name:'Sacred Lance',tu:150,effect:'Piercing magical strike.'},{name:'Seraphic Grace',tu:0,effect:'Passive: survive one lethal attack.'},{name:'Divine Decree',tu:240,effect:'Damage all foes and remove one boon.'},{name:'Retribution',tu:120,effect:'Punishes Demonic foes.'},{name:'Sanctification',tu:170,effect:'Cleanse allies and grant status immunity.'}]},
{id:'empyrean',name:'Empyrean',stage:3,level:60,hp:3250,maxHp:3250,atk:350,def:410,magic:590,speed:126,affinity:'Radiance',role:'Empyrean',abilities:[{name:'Heavenfall',tu:180,effect:'Massive magical damage; executes weakened foes.'},{name:'Perfect Divinity',tu:0,effect:'Passive: boons cannot be removed.'},{name:'Final Judgement',tu:300,effect:'Damage and strip all enemy boons.'},{name:'Divine Intervention',tu:200,effect:'Cleanse and heal the army.'},{name:'Absolute Authority',tu:250,effect:'Temporarily controls buffs and debuffs battlefield-wide.'}]},
{id:'sun',name:'Sun Sovereign',stage:1,level:45,hp:2800,maxHp:2800,atk:405,def:330,magic:440,speed:92,affinity:'Solar',role:'Sacred Beast',abilities:[{name:'Solar Roar',tu:180,effect:'Solar damage to all foes.'}]},
{id:'moon',name:'Moon Sovereign',stage:1,level:45,hp:2400,maxHp:2400,atk:310,def:350,magic:505,speed:130,affinity:'Lunar',role:'Sacred Beast',abilities:[{name:'Eclipse',tu:190,effect:'Lunar damage and delay enemy turns.'}]}
];
export type Zone={id:string;name:string;biome:string;x:number;y:number;danger:number;neighbors:string[]};
export const zones:Zone[]=[
{id:'dawnreach',name:'Dawnreach Coast',biome:'Coast',x:14,y:70,danger:1,neighbors:['verdant']},
{id:'verdant',name:'Verdant March',biome:'Forest',x:27,y:61,danger:2,neighbors:['dawnreach','ashen','crown']},
{id:'ashen',name:'Ashen Steps',biome:'Volcanic',x:43,y:69,danger:4,neighbors:['verdant','crown','hollow']},
{id:'crown',name:'Crown Basin',biome:'Highlands',x:47,y:48,danger:3,neighbors:['verdant','ashen','moonfen','hollow']},
{id:'moonfen',name:'Moonfen',biome:'Swamp',x:64,y:42,danger:5,neighbors:['crown','starfall']},
{id:'hollow',name:'Titan Hollow',biome:'Ruins',x:61,y:64,danger:6,neighbors:['ashen','crown','starfall']},
{id:'starfall',name:'Starfall Reach',biome:'Celestial',x:79,y:53,danger:8,neighbors:['moonfen','hollow','sanctum']},
{id:'sanctum',name:'Empyrean Sanctum',biome:'Sacred',x:87,y:30,danger:10,neighbors:['starfall']}
];