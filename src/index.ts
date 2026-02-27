// ---------------------------------------------------------------------------
// ts-util-core — barrel export
//
// This is the main entry point. It wires all modules together and exposes
// the unified `#` (TS-Util) namespace.
//
// Usage with ES modules (recommended):
//
//   import { AJAX, VIEW, MSG, Validation, Formatter } from 'ts-util-core';
//
//   // or as a single namespace:
//   import * as RS from 'ts-util-core';
//   RS.AJAX.request({ url: '/api/save', form: myForm });
//
// Usage as a global (for non-module scripts):
//
//   The library auto-registers `window.#` (accessed via `window['#']`)
//   when loaded in a <script> tag without `type="module"`.
//
// Design patterns used:
//   - Facade Pattern  : one import gives access to all features
//   - Mediator Pattern : the EventEmitter is the central coordinator —
//                        modules don't reference each other directly,
//                        they communicate through events
// ---------------------------------------------------------------------------

// Re-export types for consumers
export type {
  ConstraintType,
  FormDataRecord,
  AjaxRequestParams,
  AjaxJsonRequestParams,
  ViewLoadParams,
  MessageOptions,
  Formatter as FormatterDefinition,
  AppEventMap,
  ValidationResult,
  TextareaValidationResult,
} from './types.js';

export type { ConstraintHandler } from './validation/constraints.js';
export type { BeforeLoadHook } from './core/view.js';

// Re-export classes for advanced use
export { EventEmitter } from './core/event-emitter.js';
export { Ajax } from './core/ajax.js';
export { View } from './core/view.js';
export { Message } from './core/message.js';
export { Validator } from './validation/validator.js';
export { FormatterRegistry } from './formatting/registry.js';

// Re-export utilities
export { sprintf } from './utils/sprintf.js';
export { formToJSON, isDateValid, parseHTML, scrollToElement, defaults } from './utils/dom.js';

// ---------------------------------------------------------------------------
// Pre-wired singleton instances — the `#` namespace
// ---------------------------------------------------------------------------

import { EventEmitter } from './core/event-emitter.js';
import { Ajax } from './core/ajax.js';
import { View } from './core/view.js';
import { Message } from './core/message.js';
import { Validator } from './validation/validator.js';
import { FormatterRegistry } from './formatting/registry.js';
import { builtInFormatters } from './formatting/formatters.js';
import type { AppEventMap } from './types.js';

// 1. Create the shared event bus (Mediator)
const emitter = new EventEmitter<AppEventMap>();

// 2. Instantiate modules — they receive the emitter, not each other
const ajax = new Ajax(emitter);
const view = new View(emitter, ajax);
const msg = new Message();
const validator = new Validator(emitter);
const formatter = new FormatterRegistry();

// 3. Wire cross-module dependencies via hooks (Observer Pattern)
//    — The Validator tells the AJAX module how to validate forms
ajax.setValidator((form) => validator.validate(form));

//    — The Validator registers its beforeLoad hook with VIEW
view.addBeforeLoad((context) => validator.initConstraints(context));

//    — The FormatterRegistry registers its beforeLoad hook with VIEW
view.addBeforeLoad((context) => formatter.applyAll(context));

// 4. Register built-in formatters
for (const f of builtInFormatters) {
  formatter.add(f);
}

// 5. Export pre-wired instances as the public API
/** AJAX module — HTTP requests with lifecycle hooks. */
export const AJAX = ajax;

/** VIEW module — load and initialize HTML fragments. */
export const VIEW = view;

/** MSG module — dialogs and notifications. */
export const MSG = msg;

/** Validation module — form validation engine. */
export const Validation = validator;

/** Formatter module — input masking registry. */
export const Formatter = formatter;

/** Event bus — subscribe to library-wide lifecycle events. */
export const Events = emitter;

// ---------------------------------------------------------------------------
// Auto-initialize on DOMContentLoaded (when running in a browser)
// ---------------------------------------------------------------------------

if (typeof document !== 'undefined') {
  const init = () => view.initPage();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}

// ---------------------------------------------------------------------------
// Global registration for non-module environments:  window['#']
// ---------------------------------------------------------------------------

if (typeof window !== 'undefined') {
  const ns = {
    AJAX: ajax,
    VIEW: view,
    MSG: msg,
    Validation: validator,
    Formatter: formatter,
    Events: emitter,
  };

  (window as unknown as Record<string, unknown>)['#'] = ns;
}
