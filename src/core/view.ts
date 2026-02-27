// ---------------------------------------------------------------------------
// VIEW module — load HTML fragments via AJAX and initialize them
//
// Design patterns used:
//   - Observer Pattern  : `beforeLoad` hooks run on every loaded fragment
//   - Facade Pattern    : `load()` handles fetch → parse → init → inject
// ---------------------------------------------------------------------------

import type { EventEmitter } from './event-emitter.js';
import type { AppEventMap, ViewLoadParams } from '../types.js';
import type { Ajax } from './ajax.js';
import { parseHTML } from '../utils/dom.js';

export type BeforeLoadHook = (context: HTMLElement) => void;

export class View {
  private emitter: EventEmitter<AppEventMap>;
  private ajax: Ajax;
  private beforeLoadHooks: BeforeLoadHook[] = [];

  constructor(emitter: EventEmitter<AppEventMap>, ajax: Ajax) {
    this.emitter = emitter;
    this.ajax = ajax;
  }

  /**
   * Register a function that runs on every DOM fragment before it is inserted.
   *
   * This is the **Observer pattern** — modules self-register their
   * initialization logic without the core knowing about them.
   *
   * @returns An unregister function.
   *
   * @example
   * ```ts
   * // Validation module registers itself
   * VIEW.addBeforeLoad((context) => {
   *   context.querySelectorAll('[constraint~="date"]').forEach(setupDatepicker);
   * });
   *
   * // Format module registers itself
   * VIEW.addBeforeLoad((context) => {
   *   context.querySelectorAll('[format]').forEach(applyMask);
   * });
   * ```
   */
  addBeforeLoad(hook: BeforeLoadHook): () => void {
    this.beforeLoadHooks.push(hook);
    return () => {
      const idx = this.beforeLoadHooks.indexOf(hook);
      if (idx !== -1) this.beforeLoadHooks.splice(idx, 1);
    };
  }

  /**
   * Run all registered `beforeLoad` hooks on a DOM element.
   * Also emits the `view:beforeLoad` event for event-based listeners.
   */
  invokeBeforeLoad(context: HTMLElement): void {
    for (const hook of this.beforeLoadHooks) {
      hook(context);
    }
    this.emitter.emit('view:beforeLoad', { context });
  }

  /**
   * Fetch HTML from a URL, run all beforeLoad hooks, then inject into `target`.
   *
   * @param target - The container element to inject into.
   * @param params - Request parameters (url, data, form, etc.).
   */
  async load(target: HTMLElement, params: ViewLoadParams): Promise<void> {
    const { success, ...requestParams } = params;

    await this.ajax.request({
      ...requestParams,
      success: async (data) => {
        const response = data as Response;
        const html = await response.text();
        const fragment = parseHTML(html);

        // Wrap in a container so hooks can querySelector on it
        const wrapper = document.createElement('div');
        wrapper.appendChild(fragment);

        this.invokeBeforeLoad(wrapper);
        target.innerHTML = '';
        target.appendChild(wrapper);

        success?.(wrapper);
      },
    });
  }

  /**
   * Initialize the entire page body — should be called once on DOMContentLoaded.
   */
  initPage(): void {
    this.invokeBeforeLoad(document.body);
  }
}
