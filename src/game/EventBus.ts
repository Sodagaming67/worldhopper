/**
 * Minimal self-contained typed event emitter — same public API as
 * Phaser.Events.EventEmitter but has NO runtime dependency on Phaser,
 * so it imports cleanly in Vitest/jsdom unit tests.
 *
 * Scenes still use it in the browser where the full Phaser runtime is present.
 */
import type { GameEvents } from './events';

type Listener<P> = (payload: P) => void;
type ListenerMap = { [K in keyof GameEvents]?: Array<Listener<GameEvents[K]>> };

class TypedBus {
  private readonly _listeners: ListenerMap = {};

  emit<K extends keyof GameEvents>(event: K, payload: GameEvents[K]): boolean {
    const fns = this._listeners[event] as Array<Listener<GameEvents[K]>> | undefined;
    if (!fns || fns.length === 0) return false;
    fns.forEach((fn) => fn(payload));
    return true;
  }

  on<K extends keyof GameEvents>(event: K, fn: Listener<GameEvents[K]>): this {
    const bucket = this._listeners[event] as Array<Listener<GameEvents[K]>> | undefined;
    if (bucket) {
      bucket.push(fn);
    } else {
      (this._listeners as Record<K, Array<Listener<GameEvents[K]>>>)[event] = [fn];
    }
    return this;
  }

  off<K extends keyof GameEvents>(event: K, fn: Listener<GameEvents[K]>): this {
    const fns = this._listeners[event] as Array<Listener<GameEvents[K]>> | undefined;
    if (fns) {
      const idx = fns.indexOf(fn);
      if (idx !== -1) fns.splice(idx, 1);
    }
    return this;
  }
}

export const EventBus = new TypedBus();
