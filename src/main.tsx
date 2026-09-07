import React,{useEffect,useMemo,useState}from'react';
import{createRoot}from'react-dom/client';
import{GameCanvas}from'./game/GameCanvas';
import{WorldDebug}from'./game/WorldDebug';
import{gameEvents,GameEvent}from'./game/EventBus';
import{creatures,items}from'./gameData';
import'./style.css';

type Modal='shop'|'team'|'arena'|'guild'|'heal'|null;
type Save={gold:number;party:string[];owned:string[];inventory:Record<string,number>;wins:number};
const initial:Save={gold:500,party:['divine','nocturne','rift-drake'],owned:['divine','nocturne','rift-drake'],inventory:{'bind-orb':8,'greater-bind':2,potion:5},wins:0};
const creature=(id:string)=>creatures.find(c=>c.id===id)!;

function App(){
 const[state,setState]=useState<Save>(()=>{try{return JSON.parse(localStorage.getItem('dib2-save')||'null')||initial}catch{return initial}});
 const[modal,setModal]=useState<Modal>(null);const[toast,setToast]=useState('Welcome to Azurelake.');const[section,setSection]=useState('Azurelake Spawn Plaza');const[enemyHp,setEnemyHp]=useState(1800);const[round,setRound]=useState(1);
 const party=useMemo(()=>state.party.map(creature),[state.party]);
 useEffect(()=>gameEvents.subscribe((e:GameEvent)=>{if(e.type==='interaction')setModal(e.action);if(e.type==='toast')setToast(e.message);if(e.type==='subsection')setSection(e.name)}),[]);
 useEffect(()=>{localStorage.setItem('dib2-save',JSON.stringify(state))},[state]);
 useEffect(()=>{gameEvents.emit({type:'menu',open:modal!==null})},[modal]);
 const close=()=>setModal(null);
 function heal(){setState(s=>({...s}));setToast('Your active team has been fully restored.');close()}
 function buy(id:string,cost:number){if(state.gold<cost){setToast('Not enough gold.');return}setState(s=>({...s,gold:s.gold-cost,inventory:{...s.inventory,[id]:(s.inventory[id]||0)+1}}));setToast(`Purchased ${items.find(i=>i.id===id)?.name||id}.`)}
 function toggleTeam(id:string){setState(s=>{const on=s.party.includes(id);if(on)return{...s,party:s.party.filter(x=>x!==id)};if(s.party.length>=3)return s;return{...s,party:[...s.party,id]}})}
 function attack(power:number){setEnemyHp(h=>Math.max(0,h-power));if(enemyHp-power<=0)setToast(`Round ${round} won. Claim the arena crest to continue.`)}
 function claimRound(){if(round<3){setRound(r=>r+1);setEnemyHp(1800+round*450);setToast(`Arena round ${round+1} begins.`)}else{setState(s=>({...s,wins:s.wins+1,gold:s.gold+600}));setRound(1);setEnemyHp(1800);setToast('Tournament won! +600 gold and +1 Azurelake win.');close()}}
 return <div className="app-shell">
   <div className="hud top"><div><b>AZURELAKE</b><span>{section}</span></div><div className="wallet">◈ {state.gold} · Wins {state.wins}</div></div>
   <WorldDebug/>
   <GameCanvas/>
   <div className="hud bottom"><span>{toast}</span><span>Move: WASD / Arrows · Interact: E</span></div>
   {modal&&<div className="modalShade" onMouseDown={close}><section className="modal" onMouseDown={e=>e.stopPropagation()}><button className="x" onClick={close}>×</button>
     {modal==='heal'&&<><h1>Healing Sanctuary</h1><p>The sanctuary restores every creature in your active team at no cost while Azurelake is your home city.</p><div className="roster mini">{party.map(c=><article key={c.id}><b>{c.name}</b><span>{c.maxHp} HP</span></article>)}</div><button className="primary" onClick={heal}>RESTORE TEAM</button></>}
     {modal==='shop'&&<><h1>Azurelake Market</h1><p>Capture supplies and field restoration.</p><div className="shopGrid"><button onClick={()=>buy('bind-orb',60)}>Binding Orb <b>60 ◈</b><small>Owned {state.inventory['bind-orb']||0}</small></button><button onClick={()=>buy('greater-bind',180)}>Greater Binding Orb <b>180 ◈</b><small>Owned {state.inventory['greater-bind']||0}</small></button><button onClick={()=>buy('potion',90)}>Restoration Tonic <b>90 ◈</b><small>Owned {state.inventory.potion||0}</small></button></div></>}
     {modal==='team'&&<><h1>Team Hall</h1><p>Choose up to three creatures for your active field team.</p><div className="roster">{state.owned.map(id=>{const c=creature(id);return <article key={id} className={state.party.includes(id)?'activeCard':''}><img src={c.asset}/><div><b>{c.name}</b><span>{c.role} · Lv.{c.level}</span></div><button onClick={()=>toggleTeam(id)}>{state.party.includes(id)?'REMOVE':'SELECT'}</button></article>})}</div></>}
     {modal==='guild'&&<><h1>Azurelake Guild</h1><p><b>Current objective:</b> establish yourself in Azurelake.</p><p>Win the local tournament, recruit at least three creatures, then travel from the harbor when the first regional route opens.</p><div className="guildStats"><span>Owned creatures <b>{state.owned.length}</b></span><span>Arena wins <b>{state.wins}</b></span><span>Gold <b>{state.gold}</b></span></div></>}
     {modal==='arena'&&<><h1>Grand Arena</h1><p>Local Tournament · Round {round}/3</p><div className="arenaEnemy"><strong>Azurelake Challenger</strong><div className="hp"><i style={{width:`${enemyHp/(1800+(round-1)*450)*100}%`}}/></div><span>{enemyHp} HP</span></div><div className="arenaParty">{party.map(c=><article key={c.id}><b>{c.name}</b>{c.abilities.filter(a=>a.tu>0).slice(0,3).map((a,i)=><button key={a.name} disabled={enemyHp===0} onClick={()=>attack(Math.round((c.atk+c.magic)*(.65+i*.18)))}>{a.name}<small>{a.tu} TU</small></button>)}</article>)}</div>{enemyHp===0&&<button className="primary" onClick={claimRound}>{round===3?'CLAIM TOURNAMENT VICTORY':'NEXT ROUND'}</button>}</>}
   </section></div>}
 </div>
}
createRoot(document.getElementById('root')!).render(<App/>);
