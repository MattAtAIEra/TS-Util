<p align="center">
  <img src="https://raw.githubusercontent.com/MattAtAIEra/TS-Util/main/docs/banner.svg" alt="TS-Util — Agent Discipline for Humans and AI" width="100%" />
</p>

<p align="center">
  <strong>One unified framework. Same guardrails. Whether it's your team or your AI Agents writing the code.</strong>
</p>

<p align="center">
  <a href="#1-why-agent-discipline">Why</a>&ensp;&bull;&ensp;
  <a href="#2-how-it-works">How</a>&ensp;&bull;&ensp;
  <a href="#3-advantages">Advantages</a>&ensp;&bull;&ensp;
  <a href="#quick-start">Quick Start</a>&ensp;&bull;&ensp;
  <a href="#live-demo">Live Demo</a>&ensp;&bull;&ensp;
  <a href="#modules">Modules</a>&ensp;&bull;&ensp;
  <a href="#api-reference">API</a>
</p>

---

## 1. Why Agent Discipline?

You don't have a code quality problem. You have a **consistency problem.**

Ten engineers write ten different AJAX calls. Ten AI Agents generate ten different fetch patterns. Some validate forms, some don't. Some show loading overlays, some forget. Some handle errors gracefully, some swallow them silently.

Code review catches some of it. **Architecture catches all of it.**

| The real problem | What actually happens |
|---|---|
| "Every developer does AJAX differently." | Validation gets skipped. Loading spinners are inconsistent. Error handling is a coin flip. |
| "AI Agents generate verbose, repetitive code." | Each Agent expands `fetch` + validation + error handling + loading from scratch, burning context tokens on boilerplate. |
| "New team members break conventions." | They didn't know there *was* a convention — it was tribal knowledge, not enforced infrastructure. |
| "We can't tell if the Agent forgot something." | You'd have to audit every generated function. At scale, that's impossible. |

**The solution is not more code review. The solution is making wrong code impossible to write.**

---

## 2. How It Works

TS-Util wraps AJAX, VIEW, validation, formatting, and messaging into **a single enforced framework**. When anyone — human or AI — calls `AJAX.request()`, the following happens automatically:

```
   AJAX.request({ url, form })
          │
          ▼
   ┌─ 1. Validate form ──────── can't skip
   ├─ 2. Emit ajax:before ───── loading overlay
   ├─ 3. Serialize + POST ───── consistent format
   ├─ 4. Emit ajax:after ────── overlay hides
   └─ 5. Error broadcasting ─── centralized handling
```

```typescript
// This is ALL the code an engineer or AI Agent needs to write:
await AJAX.request({
  url: '/api/orders',
  form: document.getElementById('order-form')!,
  success: () => MSG.info('Saved!', { autoclose: 3000 }),
});

// Everything else — validation, loading state, error events,
// data serialization — is handled by the framework.
```

The same principle applies to `VIEW.load()` — every dynamically loaded HTML fragment automatically goes through constraint binding, input formatting, and custom hook execution. No manual initialization. No "forgetting" to set up validation on new content.

```typescript
// Load HTML fragment — validation + formatting auto-initialize
await VIEW.load(container, { url: '/api/partial-view' });
```

---

## 3. Advantages

### For Engineering Teams

| Before | After |
|--------|-------|
| 10 engineers, 10 AJAX patterns | 1 API: `AJAX.request()` |
| New hire reads 10 scattered patterns | New hire reads 1 example, ships on day one |
| "Did you add the loading overlay?" | Loading overlay is automatic — can't forget |
| "Did you validate the form?" | Validation is automatic — can't skip |
| Code review debates on style | Architecture enforces the style |

- **Eliminates divergence**: Engineers learn one API — no debates over implementation details.
- **Enforces consistency**: Every request passes through the same framework, ensuring loading overlays aren't missed and validation isn't skipped.
- **Reduces onboarding cost**: A new team member reads one `AJAX.request()` example and is ready to go, instead of deciphering ten scattered patterns.

### For AI Agents

| Before | After |
|--------|-------|
| Agent expands 15 lines of fetch + validation + error handling | Agent emits 1 line: `AJAX.request({ url, form })` |
| Context window burned on boilerplate | Tokens preserved for business logic |
| Different Agents produce different patterns | All Agents produce identical framework calls |
| Must audit every Agent's output for missing steps | Framework guarantees completeness — **guardrail by design** |
| Agent "forgets" loading overlay | Impossible — architecture enforces it |

When multiple AI Agents co-produce code, this abstraction layer becomes even more critical:

- **Token efficiency**: An Agent only needs to emit `AJAX.request({ url, form })` — one line — instead of expanding the full `fetch` + validation + error handling + loading logic every time. Context window is AI's most precious resource; saving tokens means preserving quality.
- **Predictable behavior**: Code generated by different Agents flows through the same framework, guaranteeing consistent results. You don't need to audit whether each Agent correctly implemented the loading overlay.
- **Guardrail effect**: The abstraction layer itself acts as a guardrail. An Agent cannot "forget" to validate a form because `AJAX.request()` does it automatically. Discipline is enforced by architecture, not memory.

### The Core Insight

> **Discipline is not "remembering to do the right thing." Discipline is making the right thing the only thing that can happen.**
>
> That's what TS-Util does — for your team today, and for the AI Agents that will write most of your code tomorrow.

📖 Read this in other languages: [繁體中文](https://github.com/MattAtAIEra/TS-Util/blob/main/docs/Readme-translations_zh.md) · [日本語](https://github.com/MattAtAIEra/TS-Util/blob/main/docs/Readme-translations_jp.md) · [한국어](https://github.com/MattAtAIEra/TS-Util/blob/main/docs/Readme-translations_ko.md) · [Español](https://github.com/MattAtAIEra/TS-Util/blob/main/docs/Readme-translations_es.md) · [Deutsch](https://github.com/MattAtAIEra/TS-Util/blob/main/docs/Readme-translations_de.md)

---

## Quick Start

### Install

```bash
npm install ts-util-core
```

### Import what you need

```typescript
import { AJAX, VIEW, MSG, Validation, Formatter, Events } from 'ts-util-core';
```

### Or use the global namespace (legacy `<script>` tags)

```html
<script type="module" src="dist/index.js"></script>
<script>
  const { AJAX, MSG } = window['#'];
</script>
```

### A real-world example

```typescript
import { AJAX, MSG, Events } from 'ts-util-core';

// Listen for lifecycle events
Events.on('ajax:before', ({ url }) => showSpinner(url));
Events.on('ajax:after',  ({ url }) => hideSpinner(url));

// Submit a form with auto-validation
await AJAX.request({
  url: '/api/orders',
  form: document.getElementById('order-form')!,
  success: () => MSG.info('Order saved!', { autoclose: 3000 }),
});
```

That single `AJAX.request()` call will:
1. Validate all `constraint="required"` fields in the form
2. Emit `ajax:before` (your spinner appears)
3. Serialize the form to JSON and POST it
4. Emit `ajax:after` (spinner hides)
5. Call your `success` callback

---

## Live Demo

> **[Open `demo.html`](demo.html)** — an interactive single-page guide with live output consoles for every module.
>
> ```bash
> npx serve .        # then open http://localhost:3000/demo.html
> ```

The demo lets you click through Events, AJAX, Validation, Formatting, MSG dialogs, VIEW injection, and utility functions — with code snippets alongside real-time results.

---

## Architecture

```
                        ┌─────────────────┐
                        │  EventEmitter   │  ← Typed central bus
                        │  (Mediator)     │
                        └──┬──┬──┬──┬─────┘
                  ┌────────┘  │  │  └────────┐
                  ▼           ▼  ▼           ▼
             ┌────────┐  ┌──────┐  ┌───────────┐  ┌───────────┐
             │  AJAX  │  │ VIEW │  │ Validation │  │ Formatter │
             │Facade +│  │Observ│  │ Strategy + │  │ Registry  │
             │Template│  │  er  │  │ Decorator  │  │  Pattern  │
             └────────┘  └──────┘  └───────────┘  └───────────┘
                  │           │          │               │
                  └─────┬─────┘     ┌────┘               │
                        ▼           ▼                    ▼
                    ┌───────┐  ┌──────────┐     ┌──────────────┐
                    │  MSG  │  │  Utils   │     │ HTML attrs   │
                    │Dialogs│  │sprintf,  │     │ constraint=  │
                    └───────┘  │formToJSON│     │ format=      │
                               └──────────┘     └──────────────┘
```

All modules communicate through the typed `EventEmitter` — no module imports another directly. This makes every piece independently testable and replaceable.

---

## Modules

### Events — the central bus

```typescript
// Subscribe with full type safety — event names and payloads are checked
Events.on('ajax:before', ({ url }) => console.log(url));     // url: string
Events.on('ajax:error',  ({ url, error }) => log(error));    // error: Error

// Unsubscribe
const off = Events.on('ajax:after', handler);
off(); // done
```

**Available events:**

| Event | Payload | Fired when |
|-------|---------|------------|
| `ajax:before` | `{ url }` | Request starts (unless `noblock`) |
| `ajax:after` | `{ url }` | Request completes |
| `ajax:error` | `{ url, error }` | Request fails |
| `view:beforeLoad` | `{ context }` | New DOM fragment initializes |
| `validation:invalid` | `{ labelNames, elements }` | Required fields missing |
| `validation:textareaTooLong` | `{ labelNames, maxlengths, elements }` | Textarea exceeds limit |

---

### AJAX — fetch with lifecycle

```typescript
// Simple POST
await AJAX.request({
  url: '/api/save',
  data: { name: 'Alice' },
  success: (res) => console.log('Done'),
});

// POST with auto-validation + form serialization
await AJAX.request({
  url: '/api/save',
  form: document.getElementById('myForm')!,
});

// Typed JSON response
const user = await AJAX.requestJSON<User>({
  url: '/api/user/1',
  success: (data) => { /* data is User, not unknown */ },
});
```

---

### Validation — declarative constraints

Declare in HTML, the library does the rest:

```html
<input constraint="required"             labelName="Name" />
<input constraint="required number"      labelName="Amount" />
<input constraint="required upperCase onlyEn" labelName="Code" />
<input constraint="date"                 labelName="Start Date" />
<input constraint="time"                 labelName="Meeting Time" />
```

**Built-in constraints:** `required` `number` `date` `time` `upperCase` `onlyEn`

**Add your own:**

```typescript
Validation.addConstraint({
  name: 'email',
  attach(el) {
    el.addEventListener('change', () => {
      if (el.value && !el.value.includes('@')) el.value = '';
    });
  },
});
// Now use: <input constraint="required email" labelName="Email" />
```

**Customize error handling:**

```typescript
Validation.setRequiredInvalidCallback((labelNames, elements) => {
  // Replace the default alert with your own UI
  showToast(`Missing: ${labelNames.join(', ')}`);
  elements[0]?.focus();
});
```

---

### Formatting — input masks

Declare in HTML:

```html
<input format="idNumber" />   <!-- A123456789 -->
<input format="date" />       <!-- 2026-02-24 (auto-inserts dashes) -->
<input format="time" />       <!-- 14:30 (auto-inserts colon) -->
```

**Register custom formatters:**

```typescript
Formatter.add({
  key: 'phone',
  format: (el) => {
    el.placeholder = '09XX-XXX-XXX';
    el.addEventListener('input', () => {
      let v = el.value.replace(/\D/g, '');
      if (v.length > 4) v = v.slice(0, 4) + '-' + v.slice(4);
      if (v.length > 8) v = v.slice(0, 8) + '-' + v.slice(8);
      el.value = v.slice(0, 12);
    });
  },
});
```

---

### MSG — vanilla DOM dialogs

```typescript
// Auto-closing notification
MSG.info('Saved!', { title: 'Success', autoclose: 3000 });

// Modal (must click OK)
MSG.modal('Session expired.', { title: 'Warning' });

// Confirmation
MSG.confirm('Delete', 'Are you sure?', () => {
  deleteRecord();
});

// Dismiss programmatically
MSG.dismissModal();
```

---

### VIEW — dynamic content with auto-init

```typescript
// Load an HTML fragment — constraints + formatters auto-initialize
await VIEW.load(document.getElementById('container')!, {
  url: '/api/partial-view',
});

// Or inject manually and trigger hooks
container.innerHTML = htmlString;
VIEW.invokeBeforeLoad(container);

// Register your own hook
VIEW.addBeforeLoad((context) => {
  context.querySelectorAll('.tooltip').forEach(initTooltip);
});
```

---

### Utilities

```typescript
import { sprintf, formToJSON, isDateValid } from 'ts-util-core';

sprintf('Hello %s, you are %d years old', 'Alice', 30);
// → "Hello Alice, you are 30 years old"

sprintf('Price: $%.2f', 9.5);
// → "Price: $9.50"

const data = formToJSON(formElement);
// → { username: "alice", role: "viewer" }

isDateValid('2026-02-24');  // → true
isDateValid('not-a-date');  // → false
```

---

## API Reference

### Singletons (pre-wired, ready to use)

| Export | Type | Description |
|--------|------|-------------|
| `AJAX` | `Ajax` | HTTP client with form validation integration |
| `VIEW` | `View` | Dynamic HTML fragment loader |
| `MSG` | `Message` | DOM dialog system |
| `Validation` | `Validator` | Form validation engine |
| `Formatter` | `FormatterRegistry` | Input mask registry |
| `Events` | `EventEmitter<AppEventMap>` | Typed event bus |

### Utility functions

| Export | Signature | Description |
|--------|-----------|-------------|
| `sprintf` | `(fmt: string, ...args) => string` | printf-style string formatting |
| `formToJSON` | `(container: HTMLElement, options?) => FormDataRecord` | Serialize form inputs to JSON |
| `isDateValid` | `(value: string) => boolean` | Validate date strings |
| `parseHTML` | `(html: string) => HTMLElement` | Parse HTML string to DOM |
| `scrollToElement` | `(el: HTMLElement) => void` | Smooth scroll to element |
| `defaults` | `<T>(base: T, ...overrides: Partial<T>[]) => T` | Merge defaults with overrides |

### Classes (for advanced use / testing)

| Export | Description |
|--------|-------------|
| `EventEmitter<T>` | Create isolated event buses for testing |
| `Ajax` | Instantiate with a custom emitter |
| `View` | Instantiate with a custom emitter + ajax |
| `Message` | Standalone dialog system |
| `Validator` | Standalone validator with custom emitter |
| `FormatterRegistry` | Standalone formatter registry |

---

## Project Structure

```
src/
├── index.ts                  # Barrel export + singleton wiring
├── types.ts                  # Shared type definitions
├── core/
│   ├── event-emitter.ts      # Typed EventEmitter (Mediator)
│   ├── ajax.ts               # HTTP client (Facade + Template Method)
│   ├── view.ts               # Fragment loader (Observer)
│   └── message.ts            # Dialog system (Facade)
├── validation/
│   ├── validator.ts           # Validation engine (Strategy)
│   └── constraints.ts         # Built-in constraints (Decorator)
├── formatting/
│   ├── registry.ts            # Formatter registry (Registry Pattern)
│   └── formatters.ts          # Built-in formatters
└── utils/
    ├── sprintf.ts             # printf-style formatting
    └── dom.ts                 # DOM helpers
```

**12 source files &middot; ~1,600 lines &middot; strict TypeScript &middot; ES2022 target &middot; zero dependencies**

---

## Build

```bash
npm run build          # one-shot compile
npm run dev            # watch mode
```

Output goes to `dist/` with `.js`, `.d.ts`, and source maps.

---

## Design Patterns

This library is a teaching-friendly codebase. Every module implements a named GoF pattern:

| Pattern | Module | What it teaches |
|---------|--------|----------------|
| **Mediator** | `EventEmitter` | Decoupled inter-module communication |
| **Facade** | `AJAX`, `MSG` | Hide multi-step complexity behind one call |
| **Template Method** | `requestJSON()` | Reuse a base algorithm, customize one step |
| **Observer** | `VIEW.addBeforeLoad()` | Plugin registration without coupling |
| **Strategy** | `setRequiredInvalidCallback()` | Replace behavior without modifying source |
| **Registry** | `Formatter` | Extensible key-based lookup |
| **Decorator** | `constraint="..."` attributes | Composable behavior via HTML |

Deep-dive documentation:
- **[Before (jQuery)](https://github.com/MattAtAIEra/TS-Util/blob/main/docs/good-design-pattern-implementation-before.md)** — patterns in the original codebase
- **[After (TypeScript)](https://github.com/MattAtAIEra/TS-Util/blob/main/docs/good-design-pattern-implementation-after.md)** — how TypeScript makes them safer

---

## License

MIT
