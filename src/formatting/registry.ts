// ---------------------------------------------------------------------------
// Formatter Registry — register and apply input formatters by key
//
// Design patterns used:
//   - Registry Pattern : formatters stored by key, resolved at runtime
//   - Observer Pattern : integrates with VIEW.addBeforeLoad for auto-init
//   - Open/Closed      : add new formatters without modifying existing code
// ---------------------------------------------------------------------------

import type { Formatter } from '../types.js';

/**
 * Manages input formatters keyed by name.
 *
 * Elements declare their desired format via the `format` HTML attribute.
 * The registry matches elements to their formatter at initialization time.
 *
 * @example
 * ```ts
 * registry.add({ key: 'phone', format: (el) => applyPhoneMask(el) });
 *
 * // In HTML:
 * // <input type="text" format="phone" />
 * ```
 */
export class FormatterRegistry {
  private formatters = new Map<string, Formatter>();

  /**
   * Register a formatter. If a formatter with the same key exists, it is replaced.
   */
  add(formatter: Formatter): void {
    this.formatters.set(formatter.key, formatter);
  }

  /**
   * Apply registered formatters to all elements with a `format` attribute
   * within the given context.
   *
   * This is the **beforeLoad hook** — registered with `VIEW.addBeforeLoad`
   * so dynamically loaded content also gets formatted.
   */
  applyAll(context: HTMLElement): void {
    const elements = context.querySelectorAll<HTMLInputElement>('[format]');

    for (const el of elements) {
      const key = el.getAttribute('format');
      if (!key) continue;
      const formatter = this.formatters.get(key);
      formatter?.format(el);
    }
  }
}
