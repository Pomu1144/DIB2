export type GameEvent =
  | { type: 'interaction'; action: 'heal' | 'shop' | 'team' | 'arena' | 'guild'; label: string }
  | { type: 'subsection'; id: string; name: string }
  | { type: 'toast'; message: string };

type Listener = (event: GameEvent) => void;

class EventBusImpl {
  private listeners = new Set<Listener>();
  emit(event: GameEvent) { this.listeners.forEach(listener => listener(event)); }
  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }
}

export const gameEvents = new EventBusImpl();
