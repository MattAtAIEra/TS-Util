<p align="center">
  <img src="https://raw.githubusercontent.com/MattAtAIEra/TS-Util/main/docs/banner.svg" alt="TS-Util — Agent Discipline for Humans and AI" width="100%" />
</p>

<p align="center">
  <strong>Eine Pipeline. Dieselben Leitplanken. Egal, ob dein Team tippt oder deine KI-Agenten generieren.</strong>
</p>

<p align="center">
  <a href="https://github.com/MattAtAIEra/TS-Util#readme">English</a>&ensp;&bull;&ensp;
  <a href="Readme-translations_zh.md">繁體中文</a>&ensp;&bull;&ensp;
  <a href="Readme-translations_jp.md">日本語</a>&ensp;&bull;&ensp;
  <a href="Readme-translations_ko.md">한국어</a>&ensp;&bull;&ensp;
  <a href="Readme-translations_es.md">Español</a>
</p>

---

## 1. Warum Agent Discipline?

Dein Problem ist nicht schlechter Code. Dein Problem heißt **Wildwuchs.**

Zehn Ingenieure, zehn verschiedene AJAX-Aufrufe. Zehn KI-Agenten, zehn verschiedene Fetch-Muster. Die einen validieren Formulare, die anderen nicht. Hier ein Lade-Overlay, dort keins. Fehlerbehandlung? Mal elegant, mal komplett verschluckt.

Code-Review fängt einiges ab. **Architektur fängt alles ab.**

| Das eigentliche Problem | Was tatsächlich passiert |
|---|---|
| „Jeder Entwickler macht AJAX anders." | Validierung? Glückssache. Lade-Spinner? Mal ja, mal nein. Fehlerbehandlung? Hoffen wir das Beste. |
| „KI-Agenten generieren aufgeblähten Einweg-Code." | Jeder Agent zimmert `fetch` + Validierung + Fehlerbehandlung + Ladezustand von Grund auf zusammen — und verbrennt dabei wertvolle Kontext-Token für Boilerplate. |
| „Neue Teammitglieder brechen Konventionen." | Sie wussten gar nicht, dass es eine Konvention *gab* — alles nur Flurfunk, nichts davon im Code verankert. |
| „Wir können nicht erkennen, ob der Agent etwas vergessen hat." | Jede einzelne generierte Funktion prüfen? Im Alltag schlicht unmöglich. |

**Die Antwort ist nicht noch mehr Code-Review. Die Antwort: Mach falschen Code schlicht unmöglich.**

---

## 2. So funktioniert es

TS-Util bündelt AJAX, VIEW, Validierung, Formatierung und Messaging in **einer einzigen Pipeline, an der niemand vorbeikommt**. Sobald jemand — Mensch oder KI — `AJAX.request()` aufruft, läuft automatisch ab:

```
   AJAX.request({ url, form })
          │
          ▼
   ┌─ 1. Formular validieren ──── kann nicht übersprungen werden
   ├─ 2. ajax:before auslösen ─── Lade-Overlay
   ├─ 3. Serialisieren + POST ─── konsistentes Format
   ├─ 4. ajax:after auslösen ──── Overlay ausblenden
   └─ 5. Fehler-Broadcasting ──── zentralisierte Behandlung
```

```typescript
// Das ist ALLES, was ein Ingenieur oder KI-Agent schreiben muss:
await AJAX.request({
  url: '/api/orders',
  form: document.getElementById('order-form')!,
  success: () => MSG.info('Gespeichert!', { autoclose: 3000 }),
});

// Alles andere — Validierung, Ladezustand, Fehler-Events,
// Datenserialisierung — wird von der Pipeline behandelt.
```

Für `VIEW.load()` gilt dasselbe Prinzip: Jedes dynamisch geladene HTML-Fragment durchläuft automatisch Constraint-Binding, Input-Formatierung und Hook-Ausführung. Kein manuelles Initialisieren. Kein „Ups, die Validierung für den neuen Content vergessen".

```typescript
// HTML-Fragment laden — Validierung + Formatierung auto-initialisieren
await VIEW.load(container, { url: '/api/partial-view' });
```

---

## 3. Vorteile

### Für Engineering-Teams

| Vorher | Nachher |
|--------|-------|
| 10 Ingenieure, 10 AJAX-Muster | 1 API: `AJAX.request()` — fertig |
| Neue Mitarbeiter lesen 10 verstreute Muster | Ein Beispiel lesen, am ersten Tag liefern |
| „Hast du das Lade-Overlay hinzugefügt?" | Läuft automatisch — Vergessen ausgeschlossen |
| „Hast du das Formular validiert?" | Läuft automatisch — Überspringen ausgeschlossen |
| Code-Review-Debatten über Stil | Die Architektur gibt den Stil vor |

- **Schluss mit Wildwuchs**: Eine API lernen, fertig — keine endlosen Debatten über Implementierungsdetails.
- **Konsistenz ab Werk**: Jede Anfrage läuft durch dieselbe Pipeline. Lade-Overlays vergessen? Validierung überspringen? Geht gar nicht.
- **Schnelleres Onboarding**: Ein `AJAX.request()`-Beispiel reicht, um loszulegen — statt zehn verstreute Muster zu entziffern.

### Für KI-Agenten

| Vorher | Nachher |
|--------|-------|
| Agent bläht 15 Zeilen fetch + Validierung + Fehlerbehandlung auf | Agent gibt 1 Zeile aus: `AJAX.request({ url, form })` |
| Kontextfenster verpulvert für Boilerplate | Token frei für echte Geschäftslogik |
| Verschiedene Agenten, verschiedene Muster | Alle Agenten, identische Pipeline-Aufrufe |
| Jede Agentenausgabe manuell auf fehlende Schritte prüfen | Pipeline garantiert Vollständigkeit — **Leitplanke by Design** |
| Agent „vergisst" das Lade-Overlay | Geht nicht — die Architektur lässt es nicht zu |

Sobald mehrere KI-Agenten zusammen Code erzeugen, wird diese Abstraktionsschicht zum entscheidenden Hebel:

- **Token-Effizienz**: Eine Zeile `AJAX.request({ url, form })` statt jedes Mal `fetch` + Validierung + Fehlerbehandlung + Ladezustand ausrollen. Das Kontextfenster ist die wertvollste Ressource der KI — weniger Token verbrannt heißt mehr Raum für Qualität.
- **Vorhersagbares Verhalten**: Egal welcher Agent den Code schreibt, alles fließt durch dieselbe Pipeline. Du musst nicht mühsam nachprüfen, ob ein Agent das Lade-Overlay vergessen hat.
- **Leitplanken-Effekt**: Die Abstraktionsschicht selbst ist die Leitplanke. Formularvalidierung vergessen? Unmöglich, weil `AJAX.request()` sie automatisch durchführt. Disziplin entsteht durch Architektur, nicht durch guten Willen.

### Die Kernidee

> **Disziplin heißt nicht, sich ans Richtige zu erinnern. Disziplin heißt: Es gibt nur noch den richtigen Weg.**
>
> Genau das leistet TS-Util — für dein Team heute und für die KI-Agenten, die morgen den Großteil deines Codes schreiben.

---

## Schnellstart

### Installieren

```bash
npm install ts-util-core
```

### Importiere, was du brauchst

```typescript
import { AJAX, VIEW, MSG, Validation, Formatter, Events } from 'ts-util-core';
```

### Oder verwende den globalen Namespace (Legacy `<script>` Tags)

```html
<script type="module" src="dist/index.js"></script>
<script>
  const { AJAX, MSG } = window['#'];
</script>
```

### Ein Praxisbeispiel

```typescript
import { AJAX, MSG, Events } from 'ts-util-core';

// Lifecycle-Events beobachten
Events.on('ajax:before', ({ url }) => showSpinner(url));
Events.on('ajax:after',  ({ url }) => hideSpinner(url));

// Formular mit Auto-Validierung absenden
await AJAX.request({
  url: '/api/orders',
  form: document.getElementById('order-form')!,
  success: () => MSG.info('Bestellung gespeichert!', { autoclose: 3000 }),
});
```

Dieser eine `AJAX.request()`-Aufruf erledigt alles:
1. Alle `constraint="required"` Felder im Formular validieren
2. `ajax:before` auslösen (dein Spinner erscheint)
3. Das Formular zu JSON serialisieren und POST senden
4. `ajax:after` auslösen (Spinner verschwindet)
5. Deinen `success` Callback aufrufen

---

## Live-Demo

> **[`demo.html` öffnen](../demo.html)** — ein interaktiver Single-Page-Guide mit Live-Ausgabekonsolen für jedes Modul.
>
> ```bash
> npx serve .        # dann http://localhost:3000/demo.html öffnen
> ```

Klick dich durch Events, AJAX, Validation, Formatting, MSG-Dialoge, VIEW-Injection und Utility-Funktionen — Code-Snippets und Live-Ergebnisse direkt nebeneinander.

---

## Architektur

```
                        ┌─────────────────┐
                        │  EventEmitter   │  ← Typisierter zentraler Bus
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

Sämtliche Module kommunizieren ausschließlich über den typisierten `EventEmitter` — kein Modul importiert ein anderes direkt. Ergebnis: Jedes Teil lässt sich isoliert testen und jederzeit austauschen.

---

## Module

### Events — der zentrale Bus

```typescript
// Mit voller Typsicherheit abonnieren — Eventnamen und Payloads werden geprüft
Events.on('ajax:before', ({ url }) => console.log(url));     // url: string
Events.on('ajax:error',  ({ url, error }) => log(error));    // error: Error

// Abmelden
const off = Events.on('ajax:after', handler);
off(); // fertig
```

**Verfügbare Events:**

| Event | Payload | Wird ausgelöst, wenn |
|-------|---------|------------|
| `ajax:before` | `{ url }` | Anfrage startet (außer `noblock`) |
| `ajax:after` | `{ url }` | Anfrage abgeschlossen |
| `ajax:error` | `{ url, error }` | Anfrage fehlgeschlagen |
| `view:beforeLoad` | `{ context }` | Neues DOM-Fragment initialisiert |
| `validation:invalid` | `{ labelNames, elements }` | Pflichtfelder fehlen |
| `validation:textareaTooLong` | `{ labelNames, maxlengths, elements }` | Textarea überschreitet Limit |

---

### AJAX — fetch mit Lifecycle

```typescript
// Einfacher POST
await AJAX.request({
  url: '/api/save',
  data: { name: 'Alice' },
  success: (res) => console.log('Fertig'),
});

// POST mit Auto-Validierung + Formular-Serialisierung
await AJAX.request({
  url: '/api/save',
  form: document.getElementById('myForm')!,
});

// Typisierte JSON-Antwort
const user = await AJAX.requestJSON<User>({
  url: '/api/user/1',
  success: (data) => { /* data ist User, nicht unknown */ },
});
```

---

### Validation — deklarative Constraints

Einfach im HTML deklarieren — den Rest erledigt die Bibliothek:

```html
<input constraint="required"             labelName="Name" />
<input constraint="required number"      labelName="Betrag" />
<input constraint="required upperCase onlyEn" labelName="Code" />
<input constraint="date"                 labelName="Startdatum" />
<input constraint="time"                 labelName="Besprechungszeit" />
```

**Eingebaute Constraints:** `required` `number` `date` `time` `upperCase` `onlyEn`

**Eigene hinzufügen:**

```typescript
Validation.addConstraint({
  name: 'email',
  attach(el) {
    el.addEventListener('change', () => {
      if (el.value && !el.value.includes('@')) el.value = '';
    });
  },
});
// Jetzt verwenden: <input constraint="required email" labelName="Email" />
```

**Fehlerbehandlung anpassen:**

```typescript
Validation.setRequiredInvalidCallback((labelNames, elements) => {
  // Standard-Alert durch eigene UI ersetzen
  showToast(`Fehlend: ${labelNames.join(', ')}`);
  elements[0]?.focus();
});
```

---

### Formatting — Eingabemasken

In HTML deklarieren:

```html
<input format="idNumber" />   <!-- A123456789 -->
<input format="date" />       <!-- 2026-02-24 (Bindestriche werden automatisch eingefügt) -->
<input format="time" />       <!-- 14:30 (Doppelpunkt wird automatisch eingefügt) -->
```

**Benutzerdefinierte Formatierer registrieren:**

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

### MSG — Vanilla-DOM-Dialoge

```typescript
// Auto-schließende Benachrichtigung
MSG.info('Gespeichert!', { title: 'Erfolg', autoclose: 3000 });

// Modal (muss OK klicken)
MSG.modal('Sitzung abgelaufen.', { title: 'Warnung' });

// Bestätigung
MSG.confirm('Löschen', 'Bist du sicher?', () => {
  deleteRecord();
});

// Programmatisch schließen
MSG.dismissModal();
```

---

### VIEW — dynamischer Inhalt mit Auto-Init

```typescript
// HTML-Fragment laden — Constraints + Formatierer auto-initialisieren
await VIEW.load(document.getElementById('container')!, {
  url: '/api/partial-view',
});

// Oder manuell injizieren und Hooks auslösen
container.innerHTML = htmlString;
VIEW.invokeBeforeLoad(container);

// Eigenen Hook registrieren
VIEW.addBeforeLoad((context) => {
  context.querySelectorAll('.tooltip').forEach(initTooltip);
});
```

---

### Utilities

```typescript
import { sprintf, formToJSON, isDateValid } from 'ts-util-core';

sprintf('Hallo %s, du bist %d Jahre alt', 'Alice', 30);
// → "Hallo Alice, du bist 30 Jahre alt"

sprintf('Preis: $%.2f', 9.5);
// → "Preis: $9.50"

const data = formToJSON(formElement);
// → { username: "alice", role: "viewer" }

isDateValid('2026-02-24');  // → true
isDateValid('not-a-date');  // → false
```

---

## API-Referenz

### Singletons (fertig verdrahtet, direkt loslegen)

| Export | Typ | Beschreibung |
|--------|------|-------------|
| `AJAX` | `Ajax` | HTTP-Client mit Formularvalidierungs-Integration |
| `VIEW` | `View` | Dynamischer HTML-Fragment-Loader |
| `MSG` | `Message` | DOM-Dialogsystem |
| `Validation` | `Validator` | Formularvalidierungs-Engine |
| `Formatter` | `FormatterRegistry` | Eingabemasken-Registry |
| `Events` | `EventEmitter<AppEventMap>` | Typisierter Event-Bus |

### Utility-Funktionen

| Export | Signatur | Beschreibung |
|--------|-----------|-------------|
| `sprintf` | `(fmt: string, ...args) => string` | printf-style Stringformatierung |
| `formToJSON` | `(container: HTMLElement, options?) => FormDataRecord` | Formulareingaben zu JSON serialisieren |
| `isDateValid` | `(value: string) => boolean` | Datumsstrings validieren |
| `parseHTML` | `(html: string) => HTMLElement` | HTML-String zu DOM parsen |
| `scrollToElement` | `(el: HTMLElement) => void` | Sanftes Scrollen zum Element |
| `defaults` | `<T>(base: T, ...overrides: Partial<T>[]) => T` | Standardwerte mit Überschreibungen zusammenführen |

### Klassen (für fortgeschrittene Nutzung / Tests)

| Export | Beschreibung |
|--------|-------------|
| `EventEmitter<T>` | Isolierte Event-Busse für Tests erstellen |
| `Ajax` | Mit benutzerdefiniertem Emitter instanziieren |
| `View` | Mit benutzerdefiniertem Emitter + Ajax instanziieren |
| `Message` | Eigenständiges Dialogsystem |
| `Validator` | Eigenständiger Validator mit benutzerdefiniertem Emitter |
| `FormatterRegistry` | Eigenständige Formatierer-Registry |

---

## Projektstruktur

```
src/
├── index.ts                  # Barrel-Export + Singleton-Verdrahtung
├── types.ts                  # Gemeinsame Typdefinitionen
├── core/
│   ├── event-emitter.ts      # Typisierter EventEmitter (Mediator)
│   ├── ajax.ts               # HTTP-Client (Facade + Template Method)
│   ├── view.ts               # Fragment-Loader (Observer)
│   └── message.ts            # Dialogsystem (Facade)
├── validation/
│   ├── validator.ts           # Validierungs-Engine (Strategy)
│   └── constraints.ts         # Eingebaute Constraints (Decorator)
├── formatting/
│   ├── registry.ts            # Formatierer-Registry (Registry Pattern)
│   └── formatters.ts          # Eingebaute Formatierer
└── utils/
    ├── sprintf.ts             # printf-style Formatierung
    └── dom.ts                 # DOM-Helfer
```

**12 Quelldateien · ~1.600 Zeilen · striktes TypeScript · ES2022-Target · null Abhängigkeiten**

---

## Build

```bash
npm run build          # einmalige Kompilierung
npm run dev            # Watch-Modus
```

Landet in `dist/` — mit `.js`, `.d.ts` und Source Maps.

---

## Design-Patterns

Die Codebasis eignet sich hervorragend zum Lernen. Jedes Modul setzt ein klassisches GoF-Pattern um:

| Pattern | Modul | Was es lehrt |
|---------|--------|----------------|
| **Mediator** | `EventEmitter` | Module reden miteinander, ohne sich zu kennen |
| **Facade** | `AJAX`, `MSG` | Komplexe Abläufe hinter einem einzigen Aufruf verstecken |
| **Template Method** | `requestJSON()` | Basis-Algorithmus wiederverwenden, gezielt einen Schritt anpassen |
| **Observer** | `VIEW.addBeforeLoad()` | Plugins einklinken, ohne feste Abhängigkeiten zu schaffen |
| **Strategy** | `setRequiredInvalidCallback()` | Verhalten austauschen, ohne Quellcode anzufassen |
| **Registry** | `Formatter` | Erweiterbares, schlüsselbasiertes Lookup |
| **Decorator** | `constraint="..."` Attribute | Verhalten per HTML-Attribut kombinieren |

Wer tiefer einsteigen will:
- **[Before (jQuery)](https://github.com/MattAtAIEra/TS-Util/blob/main/docs/good-design-pattern-implementation-before.md)** — die Patterns in der ursprünglichen Codebasis
- **[After (TypeScript)](https://github.com/MattAtAIEra/TS-Util/blob/main/docs/good-design-pattern-implementation-after.md)** — wie TypeScript sie typsicher macht

---

## Lizenz

MIT
