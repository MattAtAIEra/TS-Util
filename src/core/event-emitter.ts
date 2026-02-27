// ---------------------------------------------------------------------------
// Typed EventEmitter — the unified hook / callback system
//
// Design patterns used:
//   - Observer Pattern : multiple listeners subscribe to named events
//   - Strategy Pattern : consumers replace default behavior via listeners
//   - Generics         : the event map is fully typed at compile time
// ---------------------------------------------------------------------------

/**
 * A fully typed event emitter.
 *
 * `TEvents` is a map of `{ eventName: payloadType }`.
 * All `on`, `off`, and `emit` calls are type-checked against this map.
 *
 * @example
 * ```ts
 * const emitter = new EventEmitter<{ 'ajax:before': { url: string } }>();
 * emitter.on('ajax:before', ({ url }) => console.log(url));
 * emitter.emit('ajax:before', { url: '/api' });
 * ```
 */
export class EventEmitter<TEvents extends { [K in keyof TEvents]: unknown }> {
  private listeners = new Map<
    keyof TEvents,
    Set<(payload: never) => void>
  >();

  /** Subscribe to an event. Returns an unsubscribe function. */
  on<K extends keyof TEvents>(
    event: K,
    listener: (payload: TEvents[K]) => void,
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    const set = this.listeners.get(event)!;
    set.add(listener as (payload: never) => void);

    // Return unsubscribe function for convenience
    return () => {
      set.delete(listener as (payload: never) => void);
    };
  }

  /** Unsubscribe a specific listener. */
  off<K extends keyof TEvents>(
    event: K,
    listener: (payload: TEvents[K]) => void,
  ): void {
    this.listeners.get(event)?.delete(listener as (payload: never) => void);
  }

  /** Subscribe to an event — listener is automatically removed after one call. */
  once<K extends keyof TEvents>(
    event: K,
    listener: (payload: TEvents[K]) => void,
  ): () => void {
    const wrapper = ((payload: TEvents[K]) => {
      this.off(event, wrapper);
      listener(payload);
    }) as (payload: TEvents[K]) => void;

    return this.on(event, wrapper);
  }

  /** Emit an event, calling all registered listeners with the payload. */
  emit<K extends keyof TEvents>(event: K, payload: TEvents[K]): void {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const listener of set) {
      (listener as (payload: TEvents[K]) => void)(payload);
    }
  }

  /** Remove all listeners for a specific event, or all events if none specified. */
  clear(event?: keyof TEvents): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}
