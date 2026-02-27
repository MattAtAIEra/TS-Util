# Design Patterns in the TypeScript Rewrite

> This document shows how the same design patterns from the original jQuery codebase
> are expressed using **modern TypeScript features** — generics, interfaces, ES modules,
> classes, and the type system itself.
>
> Read `good-design-pattern-implementation-before.md` first to understand the originals.

---

## Table of Contents

1. [Module Pattern → ES Modules](#1-module-pattern--es-modules)
2. [Namespace Pattern → Barrel Exports](#2-namespace-pattern--barrel-exports)
3. [Strategy Pattern → Typed Callbacks & Generics](#3-strategy-pattern--typed-callbacks--generics)
4. [Observer Pattern → Typed EventEmitter](#4-observer-pattern--typed-eventemitter)
5. [Facade Pattern → Class Encapsulation](#5-facade-pattern--class-encapsulation)
6. [Template Method Pattern → Async Composition](#6-template-method-pattern--async-composition)
7. [Registry Pattern → Map + Interface](#7-registry-pattern--map--interface)
8. [Decorator Pattern → ConstraintHandler Interface](#8-decorator-pattern--constrainthandler-interface)
9. [Default + Override → Destructuring + Partial\<T\>](#9-default--override--destructuring--partialt)
10. [NEW: Mediator Pattern → EventEmitter as Central Bus](#10-new-mediator-pattern--eventemitter-as-central-bus)
11. [Pattern Comparison Matrix](#11-pattern-comparison-matrix)

---

## 1. Module Pattern → ES Modules

### Before (jQuery IIFE):
```javascript
(function ($) {
  'use strict';
  var AJAX = { ... };    // private
  var VIEW = { ... };    // private
  window.$RS.AJAX = AJAX; // manually exposed
})(jQuery);
```

### After (TypeScript ES Module):
```typescript
// src/core/ajax.ts
export class Ajax {
  async request(params: AjaxRequestParams): Promise<Response | undefined> {
    // ...
  }
}
```

**What TypeScript gives us:**

- **`export` / `import` replaces IIFE + `window.$RS`** — the language handles encapsulation.
  Everything not `export`-ed is private by default. No runtime overhead.
- **Tree-shaking** — bundlers can remove unused modules. With IIFE, you always ship everything.
- **Dependency graph is explicit** — `import { Ajax } from './core/ajax.js'` vs.
  implicit dependency on a global `$RS` that may or may not exist.

---

## 2. Namespace Pattern → Barrel Exports

### Before:
```javascript
window.$RS = {};
window.$RS.AJAX = AJAX;
window.$RS.VIEW = VIEW;
window.$RS.MSG = MSG;
```

### After (`src/index.ts` — barrel export):
```typescript
// Named exports for ES module consumers
export const AJAX = ajax;
export const VIEW = view;
export const MSG = msg;
export const Validation = validator;
export const Formatter = formatter;
export const Events = emitter;

// Global `#` namespace for non-module environments
(window as unknown as Record<string, unknown>)['#'] = ns;
```

**Consumer usage:**
```typescript
// Destructured import — only what you need
import { AJAX, MSG } from 'ts-util-core';

// Or as a namespace
import * as RS from 'ts-util-core';
RS.AJAX.request({ url: '/api' });
```

**What TypeScript gives us:**

- **IDE autocomplete** — type `RS.` and see all available modules with full type info.
- **Compile-time errors** — `RS.AJXA.request()` fails at compile time, not at runtime.
- **Two access modes** — module consumers get tree-shaking; legacy `<script>` tags
  get the global `window['#']` namespace.

---

## 3. Strategy Pattern → Typed Callbacks & Generics

### Before:
```javascript
var setAjaxBeforeLoadingCallback = function(callback) {
  $RS.ajaxBeforeLoadingCallback = callback;  // no type safety — any function accepted
};

var ajaxBeforeLoadingCallback = function() {
  if ($.isFunction($RS.ajaxBeforeLoadingCallback)) {  // runtime type check
    $RS.ajaxBeforeLoadingCallback();
  } else {
    $.blockUI({ ... });  // default
  }
};
```

**Problems:**
- No type safety on the callback signature — you can pass `function(a, b, c)` and it silently ignores extra args.
- `$.isFunction()` runtime check needed because the slot might be `undefined`, a string, or anything.
- Only ONE callback can be registered — last writer wins.

### After:
```typescript
// src/core/event-emitter.ts
export class EventEmitter<TEvents extends { [K in keyof TEvents]: unknown }> {

  on<K extends keyof TEvents>(
    event: K,
    listener: (payload: TEvents[K]) => void, // ← typed at compile time
  ): () => void { ... }

  emit<K extends keyof TEvents>(event: K, payload: TEvents[K]): void { ... }
}
```

```typescript
// The event map defines the contract
interface AppEventMap {
  'ajax:before': { url: string };
  'ajax:after':  { url: string };
  'ajax:error':  { url: string; error: Error };
}

// Consumer code — fully typed
Events.on('ajax:before', ({ url }) => {
  console.log(`Loading ${url}...`);  // ✅ `url` is typed as string
});

Events.on('ajax:before', ({ foo }) => {  // ❌ Compile error: 'foo' does not exist
  ...
});
```

**What TypeScript gives us:**

| Feature | Before (jQuery) | After (TypeScript) |
|---------|----------------|--------------------|
| Callback type safety | None — any function accepted | Full — payload shape enforced at compile time |
| Runtime null check | Required (`$.isFunction()`) | Not needed — `Set` iteration skips naturally |
| Number of listeners | 1 (last writer wins) | Unlimited (Set-based) |
| Unsubscribe | Not supported | `const unsub = on(...); unsub();` |
| Autocomplete | None | Full — event names + payload keys |

**The Generic `<TEvents>` is the key:**
```typescript
class EventEmitter<TEvents extends { [K in keyof TEvents]: unknown }>
//                 ^^^^^^^^
// This generic parameter means:
// - The event NAMES are checked at compile time
// - The PAYLOAD SHAPES are checked at compile time
// - You cannot emit('typo', ...) — it won't compile
// - You cannot on('ajax:before', (x: number) => ...) — wrong payload type
```

---

## 4. Observer Pattern → Typed EventEmitter

### Before:
```javascript
var VIEW = {
  beforeLoads: [],      // untyped array

  addBeforeLoad: function(f) {   // `f` is `any`
    this.beforeLoads.push(f);
  },

  invokeBeforeLoad: function(context) {
    $.each(this.beforeLoads, function(i, f) {
      if ($.isFunction(f)) {     // runtime guard needed
        f(context);
      }
    });
  }
};
```

### After:
```typescript
// src/core/view.ts
export type BeforeLoadHook = (context: HTMLElement) => void;

export class View {
  private beforeLoadHooks: BeforeLoadHook[] = [];

  addBeforeLoad(hook: BeforeLoadHook): () => void {
    this.beforeLoadHooks.push(hook);
    // Return unregister function
    return () => {
      const idx = this.beforeLoadHooks.indexOf(hook);
      if (idx !== -1) this.beforeLoadHooks.splice(idx, 1);
    };
  }

  invokeBeforeLoad(context: HTMLElement): void {
    for (const hook of this.beforeLoadHooks) {
      hook(context);   // No runtime type check needed — TypeScript guarantees it
    }
    this.emitter.emit('view:beforeLoad', { context });
  }
}
```

**Improvements:**

1. **Type alias `BeforeLoadHook`** — documents the expected signature. If you pass
   `(x: number) => void`, it fails at compile time.
2. **No `$.isFunction()` guard** — the type system guarantees only functions are in the array.
3. **Unregister function** — `addBeforeLoad` returns `() => void` for cleanup.
   The original had no way to remove a registered hook.
4. **Dual notification** — hooks run directly AND the event is emitted on the bus,
   so both patterns (direct registration and event-based) are supported.

---

## 5. Facade Pattern → Class Encapsulation

### Before:
```javascript
AJAX.request = function(params) {
  // 1. validate
  if (params.form != undefined) {
    if ($.isFunction($RS.requiredValidation)) {
      if (!$RS.requiredValidation(params.form)) return;
    }
  }
  // 2. show overlay
  if (!params.noblock) ajaxBeforeLoadingCallback();
  // 3. merge defaults
  $.extend(allParams, this.defaultParams, params, { ... });
  // 4. serialize form
  // 5. send
  return $.ajax(allParams);
};
```

### After:
```typescript
export class Ajax {
  private emitter: EventEmitter<AppEventMap>;
  private validateForm: ((form: HTMLElement) => boolean) | null = null;

  constructor(emitter: EventEmitter<AppEventMap>) {
    this.emitter = emitter;
  }

  setValidator(fn: (form: HTMLElement) => boolean): void {
    this.validateForm = fn;
  }

  async request(params: AjaxRequestParams): Promise<Response | undefined> {
    // 1. Validate
    if (params.form && this.validateForm) {
      if (!this.validateForm(params.form)) return undefined;
    }
    // 2. Before-hook
    if (!params.noblock) {
      this.emitter.emit('ajax:before', { url: params.url });
    }
    // 3. Build body from form + data
    // 4. fetch()
    // 5. After-hook + callbacks
  }
}
```

**What TypeScript gives us:**

- **`private` members** — `emitter` and `validateForm` cannot be accessed from outside.
  In the original, everything was closured but the closure was one giant IIFE.
- **`AjaxRequestParams` interface** — the params object is fully typed:
  ```typescript
  interface AjaxRequestParams {
    url: string;                        // required
    data?: Record<string, unknown>;     // optional
    form?: HTMLElement;                 // optional
    noblock?: boolean;                  // optional
    success?: (data: unknown) => void;  // typed callback
  }
  ```
  You cannot pass `{ url: 123 }` or forget the `url` field.
- **`async/await`** — replaces `$.ajax` callback hell with sequential-looking async code.
- **Return type `Promise<Response | undefined>`** — the consumer knows validation failure
  returns `undefined`, not a thrown error.

---

## 6. Template Method Pattern → Async Composition

### Before:
```javascript
requestJSON: function(params) {
  params = $.extend({ dataType: "json" }, params);
  return this.request(params);  // delegates to base
},

sync: function(params) {
  params = $.extend({ async: false }, params);
  return this.request(params);  // delegates to base
}
```

### After:
```typescript
async requestJSON<T = unknown>(
  params: AjaxJsonRequestParams<T>,
): Promise<T | undefined> {
  const response = await this.request({
    ...params,
    success: undefined,
  });
  if (!response) return undefined;

  const data = (await response.json()) as T;
  params.success?.(data);
  return data;
}
```

**What TypeScript gives us:**

- **Generic `<T>`** — the return type is inferred from the call site:
  ```typescript
  // T is inferred as User
  const user = await AJAX.requestJSON<User>({
    url: '/api/user/1',
    success: (data) => { /* data is User, not any */ }
  });
  // user is User | undefined
  ```
- **`...spread` replaces `$.extend()`** — native, typed, no jQuery needed.
- **`await` composition** — `requestJSON` calls `request` and adds a step.
  The "template" (validate → block → fetch → unblock) stays in `request()`.

---

## 7. Registry Pattern → Map + Interface

### Before:
```javascript
var formaters = [];  // untyped array

$RS.addFormater = function(formater) {
  formaters.push(formater);  // any object accepted
};

var beforeLoad = function(context) {
  $("[format]", context).each(function() {
    $.each(formaters, function(k, formater) {
      if ($element.attr("format") == formater.key) {
        formater.formater($element);  // typo in property name goes unnoticed
      }
    });
  });
};
```

### After:
```typescript
export interface Formatter {
  key: string;
  format: (element: HTMLInputElement) => void;  // ← typed method
}

export class FormatterRegistry {
  private formatters = new Map<string, Formatter>();  // ← Map for O(1) lookup

  add(formatter: Formatter): void {
    this.formatters.set(formatter.key, formatter);
  }

  applyAll(context: HTMLElement): void {
    const elements = context.querySelectorAll<HTMLInputElement>('[format]');
    for (const el of elements) {
      const key = el.getAttribute('format');
      if (!key) continue;
      const formatter = this.formatters.get(key);  // O(1) lookup
      formatter?.format(el);
    }
  }
}
```

**Improvements:**

| Aspect | Before | After |
|--------|--------|-------|
| Storage | `Array` (O(n) lookup per element) | `Map<string, Formatter>` (O(1) lookup) |
| Type safety | None — `formater.formater()` typo undetected | `Formatter` interface enforces correct shape |
| Registration | Duplicates accumulate silently | `Map.set()` replaces by key (idempotent) |
| Property name | `formater` (typo) | `format` (correct) |

**The `Formatter` interface is the contract:**
```typescript
// This compiles:
registry.add({
  key: 'phone',
  format: (el) => { el.placeholder = '(___) ___-____'; },
});

// This fails at compile time:
registry.add({
  key: 'phone',
  formater: (el) => { ... },  // ❌ 'formater' does not exist in type 'Formatter'
});
```

---

## 8. Decorator Pattern → ConstraintHandler Interface

### Before:
```javascript
// Constraints defined as scattered event bindings
$(":text[constraint~='date']").live("change", function() { ... });
$(":text[constraint~='number']").live("keypress", function() { ... });
$(":text[constraint~='number']").live("keyup", function() { ... });
$(":input[constraint~='upperCase']").live("keyup", function() { ... });
```

**Problems:**
- Constraint logic is scattered across the file — no clear boundary per constraint.
- Adding a new constraint means adding event bindings in multiple places.
- No way to see all constraints at a glance.

### After:
```typescript
// Each constraint is a self-contained object implementing ConstraintHandler
export interface ConstraintHandler {
  name: string;
  attach(element: HTMLInputElement | HTMLTextAreaElement): void;
}

export const numberConstraint: ConstraintHandler = {
  name: 'number',

  attach(element) {
    element.addEventListener('keydown', ((event: KeyboardEvent) => {
      const allowedKeys = ['Backspace', 'Delete', 'Tab', ...];
      if (allowedKeys.includes(event.key)) return;
      if (/[\d.\-]/.test(event.key)) return;
      event.preventDefault();
    }) as EventListener);

    element.addEventListener('change', () => {
      if (!/^-?[0-9]+(\.[0-9]+)?$/.test(element.value)) {
        element.value = '0';
      }
    });

    if (element.value === '') element.value = '0';
    element.setAttribute('inputmode', 'decimal');
  },
};

// All constraints collected — visible at a glance
export const builtInConstraints: ConstraintHandler[] = [
  dateConstraint,
  numberConstraint,
  timeConstraint,
  upperCaseConstraint,
  onlyEnConstraint,
];
```

**What TypeScript gives us:**

- **Single Responsibility** — each constraint is one object with one `attach()` method.
  All its events, transformations, and defaults live together.
- **Interface contract** — `ConstraintHandler` ensures every constraint has `name` and `attach`.
  You can't forget either without a compile error.
- **Composability preserved** — `constraint="required number upperCase"` still works:
  ```typescript
  // Validator loops through tokens and attaches matching handlers
  const tokens = el.getAttribute('constraint')!.split(/\s+/);
  for (const token of tokens) {
    const handler = this.constraints.get(token);
    handler?.attach(el);
  }
  ```
- **Extensible** — custom constraints:
  ```typescript
  Validation.addConstraint({
    name: 'email',
    attach(el) {
      el.addEventListener('change', () => {
        if (!el.value.includes('@')) el.value = '';
      });
    },
  });
  ```

---

## 9. Default + Override → Destructuring + Partial\<T\>

### Before:
```javascript
params = $.extend({
  url: "",
  data: { keyword: function() { return target.val(); } },
  value: function() {},
  afterItemExists: function() {},
  minLength: 0,
  cleanValueWhenNoItemMatched: true
}, params);
```

### After:
```typescript
export function formToJSON(
  container: HTMLElement,
  options: { ignoreDisabled?: boolean } = {},  // ← defaults via destructuring
): FormDataRecord {
  const { ignoreDisabled = false } = options;
  // ...
}
```

```typescript
// For complex defaults, use the `defaults` utility:
export function defaults<T extends Record<string, unknown>>(
  base: T,
  ...overrides: Partial<T>[]
): T {
  return Object.assign({}, base, ...overrides);
}
```

**What TypeScript gives us:**

- **`?` optional properties** — `{ ignoreDisabled?: boolean }` means "this field
  can be omitted." No runtime check needed.
- **`Partial<T>`** — given a type `T`, creates a version where all properties are optional.
  This is the type-level equivalent of `$.extend(defaults, overrides)`.
- **Destructuring defaults** — `const { ignoreDisabled = false } = options` is built
  into the language. No `$.extend()` needed for simple cases.
- **Compile-time safety** — if you misspell `ignoreDisbled`, it's caught immediately.

---

## 10. NEW: Mediator Pattern → EventEmitter as Central Bus

This pattern **did not exist** in the original. In the jQuery version, modules had
implicit dependencies:

```javascript
// validate-lib.js directly accesses core-lib's $RS.VIEW
$RS.VIEW.addBeforeLoad(beforeLoad);

// core-lib.js directly checks if validate-lib exists
if ($.isFunction($RS.requiredValidation)) { ... }
```

### After — The EventEmitter is the Mediator:
```typescript
// src/index.ts — wiring happens in ONE place

// 1. Create the shared event bus
const emitter = new EventEmitter<AppEventMap>();

// 2. Modules receive the emitter — not each other
const ajax = new Ajax(emitter);
const view = new View(emitter, ajax);
const validator = new Validator(emitter);

// 3. Wire cross-module dependencies
ajax.setValidator((form) => validator.validate(form));
view.addBeforeLoad((context) => validator.initConstraints(context));
view.addBeforeLoad((context) => formatter.applyAll(context));
```

**Why this is better:**

```
BEFORE:                           AFTER:
┌─────────┐                      ┌─────────┐
│ core-lib │◄──────────┐         │  Ajax   │
└────┬─────┘           │         └────┬─────┘
     │ knows about     │              │
     ▼                 │              ▼
┌──────────┐     ┌─────┴────┐    ┌─────────────┐
│ validate │────►│ format   │    │ EventEmitter │◄── Mediator
└──────────┘     └──────────┘    └──────┬──────┘
  direct references              ▲     ▲     ▲
  (coupled)                      │     │     │
                            ┌────┘     │     └────┐
                            │          │          │
                       ┌────┴──┐  ┌────┴───┐  ┌──┴──────┐
                       │ View  │  │Validate│  │Formatter│
                       └───────┘  └────────┘  └─────────┘
                            decoupled via mediator
```

- **No module knows about other modules** — they only know the `EventEmitter`.
- **Adding a new module** requires zero changes to existing modules.
- **Testing** — you can test each module in isolation by providing a mock emitter.

---

## 11. Pattern Comparison Matrix

| Pattern | jQuery Implementation | TypeScript Implementation | Key TS Feature |
|---------|----------------------|--------------------------|----------------|
| **Module** | IIFE `(function($){...})(jQuery)` | `export` / `import` | ES Modules |
| **Namespace** | `window.$RS = {}` | Barrel export + `window['#']` | Re-exports |
| **Strategy** | `setCallback(fn)` + `$.isFunction()` guard | `EventEmitter.on()` with typed payload | Generics `<TEvents>` |
| **Observer** | `beforeLoads.push(fn)` + `$.each` invoke | `EventEmitter` + typed hook arrays | `() => void` return for unsubscribe |
| **Facade** | One big function with `$.extend` merging | `async` class method with typed params | `interface AjaxRequestParams` |
| **Template Method** | `$.extend({dataType:"json"}, params)` | `await this.request({...params})` | `async/await` + spread |
| **Registry** | `Array` + `.push()` + linear scan | `Map<string, T>` + `.get()` | `Map` + `interface Formatter` |
| **Decorator** | Scattered `.live()` event bindings | `ConstraintHandler.attach()` per constraint | `interface ConstraintHandler` |
| **Default + Override** | `$.extend(defaults, options)` | Destructuring `= {}` + `Partial<T>` | Optional properties `?:` |
| **Mediator** | *(not present)* | `EventEmitter` as central bus | Constructor injection |

---

## Key Takeaway

The **same design patterns** apply regardless of the technology era.
What TypeScript adds is the ability to **express the pattern's contracts at compile time**:

- Strategy → the callback signature is enforced by the type system
- Observer → event names and payloads are checked before you run the code
- Registry → the registered object's shape is validated at registration time
- Facade → the options object's structure is documented by the interface itself

> Design patterns are solutions to recurring problems.
> TypeScript doesn't replace them — it makes them **safer** and **self-documenting**.
