import { useEffect, useState } from 'react';
import { gameEvents, GameEvent } from './EventBus';

export function WorldDebug() {
  const [state, setState] = useState<Extract<GameEvent, { type: 'debug' }> | null>(null);
  useEffect(() => gameEvents.subscribe(event => { if (event.type === 'debug') setState(event); }), []);
  if (!state?.enabled) return null;
  return <aside className="world-debug" aria-label="World debug">
    <strong>WORLD DEBUG · F3 to close</strong>
    <output>{state.section} · X {state.x} · Y {state.y}</output>
    <span>Assets {state.loaded}/{state.total} · Colliders {state.blockers}</span>
    <small>Red: solid · Green: exit · Gold: interaction / anchor</small>
    <div>{['plaza', 'arena', 'harbor'].map(section => <button key={section} onClick={() => gameEvents.emit({ type: 'debug-travel', section })}>Reset {section}</button>)}</div>
  </aside>;
}
