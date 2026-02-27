// ---------------------------------------------------------------------------
// AJAX module — fetch-based HTTP client with lifecycle hooks
//
// Design patterns used:
//   - Facade Pattern         : one `request()` call orchestrates validate →
//                              block → serialize → fetch → unblock
//   - Template Method Pattern: `requestJSON` / `post` / `postJSON` delegate
//                              to the base `request` with tweaked options
//   - Strategy Pattern       : loading overlay behavior is injected via
//                              the EventEmitter (ajax:before / ajax:after)
// ---------------------------------------------------------------------------

import type { EventEmitter } from './event-emitter.js';
import type { AppEventMap, AjaxRequestParams, AjaxJsonRequestParams } from '../types.js';
import { formToJSON } from '../utils/dom.js';

export class Ajax {
  private emitter: EventEmitter<AppEventMap>;
  private validateForm: ((form: HTMLElement) => boolean) | null = null;

  constructor(emitter: EventEmitter<AppEventMap>) {
    this.emitter = emitter;
  }

  /** Register the form validation function (injected by the Validation module). */
  setValidator(fn: (form: HTMLElement) => boolean): void {
    this.validateForm = fn;
  }

  /**
   * Send an HTTP request (POST by default).
   *
   * Lifecycle:
   * 1. Validate form (if `params.form` provided)
   * 2. Emit `ajax:before`
   * 3. Serialize form data + merge `params.data`
   * 4. `fetch()`
   * 5. Emit `ajax:after` (on success) or `ajax:error` (on failure)
   * 6. Call `params.success` / `params.error` / `params.complete`
   *
   * @returns The raw `Response`, or `undefined` if validation failed.
   */
  async request(params: AjaxRequestParams): Promise<Response | undefined> {
    // 1. Validate
    if (params.form && this.validateForm) {
      if (!this.validateForm(params.form)) return undefined;
    }

    // 2. Before-hook
    if (!params.noblock) {
      this.emitter.emit('ajax:before', { url: params.url });
    }

    // 3. Build body
    const body: Record<string, unknown> = {};

    if (params.form) {
      const formData = formToJSON(params.form, {
        ignoreDisabled: params.ignoreDisabled,
      });
      Object.assign(body, formData);
    }

    if (params.data) {
      Object.assign(body, params.data);
    }

    // 4. Fetch
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Ajax-Call': 'true',
      ...params.headers,
    };

    try {
      const response = await fetch(params.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // 5a. After-hook (success)
      if (!params.noblock) {
        this.emitter.emit('ajax:after', { url: params.url });
      }

      params.success?.(response);
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));

      // 5b. After-hook (error)
      if (!params.noblock) {
        this.emitter.emit('ajax:after', { url: params.url });
      }
      this.emitter.emit('ajax:error', { url: params.url, error });

      params.error?.(error);
      return undefined;
    } finally {
      params.complete?.();
    }
  }

  /**
   * Send a request and parse the response as JSON.
   *
   * Template Method — delegates to `request()`, adds JSON parsing.
   */
  async requestJSON<T = unknown>(
    params: AjaxJsonRequestParams<T>,
  ): Promise<T | undefined> {
    const response = await this.request({
      ...params,
      success: undefined, // we handle success after JSON parse
    });
    if (!response) return undefined;

    const data = (await response.json()) as T;
    params.success?.(data);
    return data;
  }
}
