# Design Patterns in the Original jQuery Codebase

> This document captures the design patterns found in the **original TS-Util** library
> (written in jQuery/JavaScript). Its purpose is to help developers recognize these patterns
> and understand **why** they exist — before seeing how they translate into modern TypeScript.

---

## Table of Contents

1. [Module Pattern (IIFE)](#1-module-pattern-iife)
2. [Namespace Pattern](#2-namespace-pattern)
3. [Strategy Pattern — Replaceable Callbacks](#3-strategy-pattern--replaceable-callbacks)
4. [Observer Pattern — Plugin Registration Chain](#4-observer-pattern--plugin-registration-chain)
5. [Facade Pattern — AJAX Module](#5-facade-pattern--ajax-module)
6. [Template Method Pattern — AJAX Request Variants](#6-template-method-pattern--ajax-request-variants)
7. [Registry Pattern — Formatter System](#7-registry-pattern--formatter-system)
8. [Decorator Pattern — Form Validation Attributes](#8-decorator-pattern--form-validation-attributes)
9. [Default + Override Pattern](#9-default--override-pattern)

---

## 1. Module Pattern (IIFE)

**What it is:** Every source file wraps its code in an Immediately Invoked Function Expression.

**Where it appears:** All four library files.

```javascript
// ts-util-core-lib.js
(function ($) {
  'use strict';

  var AJAX = { ... };
  var VIEW = { ... };

  // Only expose what consumers need
  window.$_ = {};
  window.$_.AJAX = AJAX;
  window.$_.VIEW = VIEW;

})(jQuery);
```

**Why it matters:**

- **Encapsulation** — Internal variables (`AJAX`, `VIEW`, helper functions) are private.
  They cannot be accidentally overwritten by other scripts on the page.
- **Controlled public API** — Only what's explicitly assigned to `window.$_` is accessible.
- **Dependency injection** — jQuery is passed in as `$`, making the dependency explicit
  and allowing potential replacement.

**The problem it solves:**
In a pre-module era (no `import`/`export`), JavaScript had only global scope.
Without IIFE wrapping, every `var` declaration would pollute `window`, creating
naming collisions across scripts.

---

## 2. Namespace Pattern

**What it is:** A single global object (`$_`) acts as the root container for all public APIs.

**Where it appears:** `ts-util-core-lib.js:765-782`

```javascript
window.$_ = {};
window.$_.AJAX = AJAX;
window.$_.VIEW = VIEW;
window.$_.sprintf = sprintf;
window.$_.MSG = MSG;
window.$_.setAjaxBeforeLoadingCallback = setAjaxBeforeLoadingCallback;
window.$_.setAjaxAfterLoadingCallback = setAjaxAfterLoadingCallback;
```

**Why it matters:**

- **One global** instead of dozens — reduces collision risk.
- **Discoverable API** — developers type `$_.` and see all available features.
- **Organized** — sub-namespaces (`$_.AJAX`, `$_.VIEW`, `$_.MSG`) group related functions.

**Trade-off:**
All modules must coordinate on this single namespace. If two modules both try to define
`$_.AJAX`, the last one wins silently.

---

## 3. Strategy Pattern — Replaceable Callbacks

**What it is:** The library defines **when** something happens (e.g., "before AJAX call"),
but lets consumers define **what** happens by injecting their own function.

**Where it appears:** `ts-util-core-lib.js:571-605`

```javascript
// SETTER — consumer provides their strategy
var setAjaxBeforeLoadingCallback = function(callback) {
  $_.ajaxBeforeLoadingCallback = callback;
};

// EXECUTOR — library calls the strategy at the right time
var ajaxBeforeLoadingCallback = function() {
  if ($.isFunction($_.ajaxBeforeLoadingCallback)) {
    $_.ajaxBeforeLoadingCallback();        // <-- Consumer's code runs here
  } else {
    // DEFAULT strategy: show blockUI overlay
    $.blockUI({ ... });
  }
};
```

**Also appears in validation:** `ts-util-validate-lib.js:233-255`

```javascript
var setRequiredInvalidCallback = function(callback) {
  self.requiredInvalidCallback = callback;
};

var requiredInvalidCallback = function(labelNames, invalidElements) {
  if ($.isFunction(self.requiredInvalidCallback)) {
    self.requiredInvalidCallback(labelNames, invalidElements);
  } else {
    // DEFAULT: window.alert + scroll to field
    window.alert(text + " is required !");
  }
};
```

**Why it matters:**

- **Open/Closed Principle** — The library is open for extension (provide your own loading UI)
  but closed for modification (you don't touch library source code).
- **Decoupling** — The AJAX module doesn't know or care about your specific loading spinner.
  It only knows it should call *some* function before sending a request.
- **Sensible defaults** — If consumers don't configure anything, the default behavior
  (blockUI overlay, `window.alert`) still works. Zero-config for simple use cases.

**Diagram:**

```
Consumer Code                     Library Code
─────────────                     ────────────
$_.setAjaxBeforeLoadingCallback(
  showMyCustomSpinner             ──→ stored as strategy
);

                                  AJAX.request() called
                                      │
                                      ├─ ajaxBeforeLoadingCallback()
                                      │     └─ showMyCustomSpinner()  ← YOUR code
                                      │
                                      ├─ ... HTTP request ...
                                      │
                                      └─ ajaxAfterLoadingCallback()
                                            └─ hideMyCustomSpinner() ← YOUR code
```

---

## 4. Observer Pattern — Plugin Registration Chain

**What it is:** Multiple modules independently register initialization functions.
When new DOM content arrives, ALL registered functions are called.

**Where it appears:**

```
ts-util-core-lib.js     → VIEW.addBeforeLoad(coreBeforeLoad)
ts-util-validate-lib.js → $_.VIEW.addBeforeLoad(validateBeforeLoad)
ts-util-format-lib.js   → $_.VIEW.addBeforeLoad(formatBeforeLoad)
```

**Implementation:** `ts-util-core-lib.js:144-163`

```javascript
var VIEW = {
  beforeLoads: [],          // <-- The subscriber list

  addBeforeLoad: function(f) {
    this.beforeLoads.push(f);   // Subscribe
  },

  invokeBeforeLoad: function(context) {
    $.each(this.beforeLoads, function(i, f) {
      if ($.isFunction(f)) {
        f(context);             // Notify all subscribers
      }
    });
  },

  load: function(target, params) {
    // ... fetch HTML via AJAX ...
    success: function(data) {
      var rs = $(data);
      self.invokeBeforeLoad(rs);  // <-- Trigger point
      target.html(rs);
    }
  }
};
```

**What each subscriber does:**

| Module        | Registered Function       | Purpose                                                 |
|---------------|---------------------------|---------------------------------------------------------|
| core-lib      | `coreBeforeLoad`          | (empty — placeholder for future core initialization)    |
| validate-lib  | `validateBeforeLoad`      | Set `ime-mode`, attach datepickers, default number = 0  |
| format-lib    | `formatBeforeLoad`        | Apply input masks to elements with `format` attribute   |

**Why it matters:**

- **Decoupled modules** — The core doesn't import or know about validation or formatting.
  Each module registers itself.
- **Extensible** — Adding a new module (e.g., a tooltip plugin) requires only one line:
  `$_.VIEW.addBeforeLoad(myTooltipInit)`. No existing code changes.
- **Dynamic content support** — When `VIEW.load()` fetches HTML via AJAX,
  the new content gets the same initialization as the original page.
  Without this pattern, dynamically loaded content would be "dead" (no datepickers,
  no input masks, no validation setup).

**Sequence:**

```
Page Load (or VIEW.load response)
    │
    ▼
VIEW.invokeBeforeLoad(domContext)
    │
    ├──→ coreBeforeLoad(context)       // Module 1
    ├──→ validateBeforeLoad(context)   // Module 2: sets up datepickers, ime-mode
    └──→ formatBeforeLoad(context)     // Module 3: applies input masks
```

---

## 5. Facade Pattern — AJAX Module

**What it is:** A simplified interface that hides the complexity of jQuery's `$.ajax`,
form serialization, validation, and loading overlays behind a single `request()` call.

**Where it appears:** `ts-util-core-lib.js:46-137`

```javascript
AJAX.request = function(params) {
  // 1. Validate the form (if provided)
  if (params.form != undefined) {
    if (!$_.requiredValidation(params.form)) {
      return;  // Stop if validation fails
    }
  }

  // 2. Show loading overlay
  if (!params.noblock) {
    ajaxBeforeLoadingCallback();
  }

  // 3. Merge defaults with user params
  $.extend(allParams, this.defaultParams, params, {
    complete: function() {
      ajaxAfterLoadingCallback();  // 4. Hide loading overlay
    }
  });

  // 5. Serialize form to JSON
  if (params.form) {
    var formParams = formToJSON(params.form);
    $.extend(allParams.data, formParams);
  }

  // 6. Send the request
  return $.ajax(allParams);
};
```

**What the consumer sees:**

```javascript
$_.AJAX.request({
  url: "api/save",
  form: $("#myForm"),
  success: function(data) { ... }
});
```

**What happens behind the facade:**

1. Form validation runs
2. Loading overlay appears
3. Form data is serialized to JSON
4. Default headers are set (`Ajax-Call: true`)
5. HTTP request fires
6. Loading overlay disappears on completion

**Why it matters:**

Without the facade, the consumer would need to manually orchestrate all 6 steps every time.
The facade reduces a 20-line procedure to a 4-line call.

---

## 6. Template Method Pattern — AJAX Request Variants

**What it is:** A base method (`request`) defines the algorithm skeleton.
Variant methods (`requestJSON`, `sync`, `syncJSON`) customize specific steps
by calling the base with modified parameters.

**Where it appears:** `ts-util-core-lib.js:106-136`

```javascript
request: function(params) {
  // ... full implementation (validate, block, serialize, send) ...
},

requestJSON: function(params) {
  params = $.extend({ dataType: "json" }, params);
  return this.request(params);     // <-- delegates to base
},

sync: function(params) {
  params = $.extend({ async: false }, params);
  return this.request(params);     // <-- delegates to base
},

syncJSON: function(params) {
  params = $.extend({ dataType: "json", async: false }, params);
  return this.request(params);     // <-- delegates to base
}
```

**Why it matters:**

- **DRY (Don't Repeat Yourself)** — The validation, loading overlay, and serialization
  logic is written once in `request()`. Variants only specify their differences.
- **Consistent behavior** — All four methods share the same lifecycle.
  A bug fix in `request()` automatically applies to all variants.

---

## 7. Registry Pattern — Formatter System

**What it is:** A central registry where formatter implementations are stored by key.
Elements declare which formatter they need via an HTML attribute.
At runtime, the registry matches elements to their formatters.

**Where it appears:**

Registry: `ts-util-format-lib.js`

```javascript
var formaters = [];   // <-- The registry

$_.addFormater = function(formater) {
  formaters.push(formater);  // Register
};

var beforeLoad = function(context) {
  $("[format]", context).each(function() {     // Find all elements with format attr
    var $element = $(this);
    $.each(formaters, function(k, formater) {
      if ($element.attr("format") == formater.key) {
        formater.formater($element);           // Apply matching formatter
      }
    });
  });
};
```

Registration: `ts-util-formater-register.js`

```javascript
$_.addFormater({
  key: "idNumber",
  formater: function($element) { $element.mask("A999999999"); }
});

$_.addFormater({
  key: "date",
  formater: function($element) { $element.mask("9999-99?-99"); }
});

$_.addFormater({
  key: "time",
  formater: function($element) { $element.mask("99:99"); }
});
```

Usage in HTML:

```html
<input type="text" format="idNumber" value="B224433441"/>
<input type="text" format="date" value="19811213"/>
<input type="text" format="time" value="1503"/>
```

**Why it matters:**

- **Open for extension** — Adding a new formatter requires zero changes to existing code.
  Just call `$_.addFormater({ key: "phone", formater: ... })`.
- **Declarative HTML** — The HTML says *what* format it needs, not *how* to achieve it.
  This separates concerns between markup and behavior.
- **Late binding** — Formatters are resolved at runtime, so they work even on
  dynamically loaded content (via the Observer pattern integration with `VIEW.addBeforeLoad`).

---

## 8. Decorator Pattern — Form Validation Attributes

**What it is:** HTML elements are "decorated" with constraint attributes that add behavior
without modifying the element itself.

**Where it appears:** `ts-util-validate-lib.js:24-111`

```html
<!-- Declare constraints via attributes — combinable with spaces -->
<input type="text" constraint="required number"  labelName="Amount" />
<input type="text" constraint="required date"    labelName="Start Date" />
<input type="text" constraint="required upperCase onlyEn" labelName="Code" />
```

```javascript
// Each constraint adds behavior via delegated events
$(":text[constraint~='date']").live("change", function() {
  if (!$_.isDateValid($(this).val())) {
    $(this).val("");    // <-- behavior added by 'date' constraint
  }
});

$(":text[constraint~='number']").live("keypress", function(event) {
  var chr = String.fromCharCode(...);
  return /[\d\.-]/.test(chr);   // <-- behavior added by 'number' constraint
});

$(":input[constraint~='upperCase']").live("keyup", function() {
  self.val(myValue.toUpperCase());   // <-- behavior added by 'upperCase' constraint
});
```

**Why it matters:**

- **Composable** — `constraint="required number"` applies BOTH required validation
  AND numeric-only input. Constraints are independent and stackable.
- **Declarative** — Developers add behavior by writing HTML attributes, not JavaScript.
- **Delegated events** — Uses `.live()` (event delegation) so it works on elements
  that don't exist yet at page load time.

---

## 9. Default + Override Pattern

**What it is:** Every configurable function ships with sensible defaults.
Consumers only override what they need. Unspecified options fall back to defaults.

**Where it appears:** Throughout the codebase via `$.extend()`.

```javascript
// AJAX defaults
var allParams = { data: {} };
$.extend(allParams, this.defaultParams, params, {
  complete: function() { ... }
});

// Autocomplete defaults
var params = $.extend(true, {
  url: "",
  data: { keyword: function() { return target.val(); } },
  value: function() {},
  afterItemExists: function() {},
  afterItemNoExists: function() {},
  minLength: 0,
  cleanValueWhenNoItemMatched: true
}, params);

// Spinner defaults
var opts = {
  lines: 15, length: 30, width: 9, radius: 42,
  scale: 0.25, corners: 1, color: '#fff', ...
};
$.extend(opts, options);
```

**Why it matters:**

- **Progressive complexity** — Simple use cases need only 2-3 options.
  Power users can override every detail.
- **Non-breaking evolution** — New defaults can be added without breaking existing consumers
  who don't specify them.
- **Self-documenting** — The defaults object serves as documentation for all available options.

---

## Summary Table

| Pattern              | Where                    | Problem Solved                              |
|----------------------|--------------------------|---------------------------------------------|
| Module (IIFE)        | All files                | Encapsulation without ES modules            |
| Namespace            | `window.$_`             | Single organized global entry point         |
| Strategy             | AJAX callbacks, validation callbacks | Replace behavior without modifying library |
| Observer             | `VIEW.addBeforeLoad()`   | Decoupled module initialization             |
| Facade               | `AJAX.request()`         | Hide multi-step complexity behind one call  |
| Template Method      | `requestJSON`, `sync`    | DRY — variants reuse base implementation    |
| Registry             | Formatter system         | Extensible key-based lookup                 |
| Decorator            | `constraint` attribute   | Composable behavior via HTML attributes     |
| Default + Override   | `$.extend(defaults, ...)` | Progressive complexity, zero-config start  |

> **Next:** See `good-design-pattern-implementation-after.md` for how these same patterns
> are expressed using modern TypeScript features — generics, interfaces, ES modules,
> and the type system itself.
