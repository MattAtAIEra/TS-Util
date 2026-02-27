<p align="center">
  <img src="https://raw.githubusercontent.com/MattAtAIEra/TS-Util/main/docs/banner.svg" alt="TS-Util — Agent Discipline for Humans and AI" width="100%" />
</p>

<p align="center">
  <strong>Un pipeline. Mismas barreras de seguridad. Ya sea tu equipo o tus Agentes de IA escribiendo el código.</strong>
</p>

<p align="center">
  <a href="https://github.com/MattAtAIEra/TS-Util#readme">English</a>&ensp;&bull;&ensp;
  <a href="Readme-translations_zh.md">繁體中文</a>&ensp;&bull;&ensp;
  <a href="Readme-translations_jp.md">日本語</a>&ensp;&bull;&ensp;
  <a href="Readme-translations_ko.md">한국어</a>&ensp;&bull;&ensp;
  <a href="Readme-translations_de.md">Deutsch</a>
</p>

---

## 1. ¿Por qué Agent Discipline?

No tienes un problema de calidad de código. Tienes un **problema de consistencia.**

Diez ingenieros escriben diez llamadas AJAX diferentes. Diez Agentes de IA generan diez patrones fetch diferentes. Algunos validan formularios, algunos no. Algunos muestran overlays de carga, algunos lo olvidan. Algunos manejan errores con gracia, algunos los tragan en silencio.

La revisión de código atrapa algo de esto. **La arquitectura lo atrapa todo.**

| El verdadero problema | Lo que realmente sucede |
|---|---|
| "Cada desarrollador hace AJAX de forma diferente." | La validación se omite. Los spinners de carga son inconsistentes. El manejo de errores es un volado. |
| "Los Agentes de IA generan código verboso y repetitivo." | Cada Agente expande `fetch` + validación + manejo de errores + carga desde cero, quemando tokens de contexto en boilerplate. |
| "Los nuevos miembros rompen las convenciones." | No sabían que *había* una convención — era conocimiento tribal, no infraestructura impuesta. |
| "No podemos saber si el Agente olvidó algo." | Habría que auditar cada función generada. A escala, eso es imposible. |

**La solución no es más revisión de código. La solución es hacer imposible escribir código incorrecto.**

---

## 2. Cómo funciona

TS-Util envuelve AJAX, VIEW, validación, formateo y mensajería en **un único pipeline forzado**. Cuando cualquiera — humano o IA — llama a `AJAX.request()`, lo siguiente sucede automáticamente:

```
   AJAX.request({ url, form })
          │
          ▼
   ┌─ 1. Validar formulario ──── no se puede omitir
   ├─ 2. Emitir ajax:before ──── overlay de carga
   ├─ 3. Serializar + POST ───── formato consistente
   ├─ 4. Emitir ajax:after ────── overlay se oculta
   └─ 5. Difusión de errores ─── manejo centralizado
```

```typescript
// Esto es TODO el código que un ingeniero o Agente de IA necesita escribir:
await AJAX.request({
  url: '/api/orders',
  form: document.getElementById('order-form')!,
  success: () => MSG.info('¡Guardado!', { autoclose: 3000 }),
});

// Todo lo demás — validación, estado de carga, eventos de error,
// serialización de datos — lo maneja el pipeline.
```

El mismo principio aplica a `VIEW.load()` — cada fragmento HTML cargado dinámicamente pasa automáticamente por vinculación de restricciones, formateo de entradas y ejecución de hooks personalizados. Sin inicialización manual. Sin "olvidar" configurar la validación en contenido nuevo.

```typescript
// Cargar fragmento HTML — validación + formateo se auto-inicializan
await VIEW.load(container, { url: '/api/partial-view' });
```

---

## 3. Ventajas

### Para equipos de ingeniería

| Antes | Después |
|--------|-------|
| 10 ingenieros, 10 patrones AJAX | 1 API: `AJAX.request()` |
| El nuevo lee 10 patrones dispersos | El nuevo lee 1 ejemplo, despliega el primer día |
| "¿Agregaste el overlay de carga?" | El overlay de carga es automático — no se puede olvidar |
| "¿Validaste el formulario?" | La validación es automática — no se puede omitir |
| Debates de estilo en code review | La arquitectura impone el estilo |

- **Elimina la divergencia**: Los ingenieros aprenden una sola API — sin debates sobre detalles de implementación.
- **Impone consistencia**: Todas las peticiones pasan por el mismo pipeline, asegurando que no se omitan overlays de carga ni se salten validaciones.
- **Reduce el costo de incorporación**: Un nuevo miembro lee un ejemplo de `AJAX.request()` y está listo, en lugar de descifrar diez patrones dispersos.

### Para Agentes de IA

| Antes | Después |
|--------|-------|
| Agente expande 15 líneas de fetch + validación + manejo de errores | Agente emite 1 línea: `AJAX.request({ url, form })` |
| Ventana de contexto quemada en boilerplate | Tokens preservados para lógica de negocio |
| Diferentes Agentes producen diferentes patrones | Todos los Agentes producen llamadas idénticas al pipeline |
| Hay que auditar cada salida del Agente por pasos faltantes | El pipeline garantiza completitud — **barrera de seguridad por diseño** |
| Agente "olvida" el overlay de carga | Imposible — la arquitectura lo impone |

Cuando múltiples Agentes de IA co-producen código, esta capa de abstracción se vuelve aún más crítica:

- **Eficiencia en tokens**: Un Agente solo necesita emitir `AJAX.request({ url, form })` — una línea — en lugar de expandir cada vez la lógica completa de `fetch` + validación + manejo de errores + carga. La ventana de contexto es el recurso más valioso de la IA; ahorrar tokens significa preservar calidad.
- **Comportamiento predecible**: El código generado por diferentes Agentes fluye a través del mismo pipeline, garantizando resultados consistentes. No necesitas auditar si cada Agente implementó correctamente el overlay de carga.
- **Efecto de barrera de seguridad**: La capa de abstracción actúa como una barrera. Un Agente no puede "olvidar" validar un formulario porque `AJAX.request()` lo hace automáticamente. La disciplina se impone por arquitectura, no por memoria.

### La idea central

> **La disciplina no es "recordar hacer lo correcto." La disciplina es hacer que lo correcto sea lo único que puede suceder.**
>
> Eso es lo que hace TS-Util — para tu equipo hoy, y para los Agentes de IA que escribirán la mayoría de tu código mañana.

---

## Inicio rápido

### Instalar

```bash
npm install ts-util-core
```

### Importar lo que necesitas

```typescript
import { AJAX, VIEW, MSG, Validation, Formatter, Events } from 'ts-util-core';
```

### O usar el espacio de nombres global (etiquetas `<script>` legacy)

```html
<script type="module" src="dist/index.js"></script>
<script>
  const { AJAX, MSG } = window['#'];
</script>
```

### Un ejemplo real

```typescript
import { AJAX, MSG, Events } from 'ts-util-core';

// Escuchar eventos del ciclo de vida
Events.on('ajax:before', ({ url }) => showSpinner(url));
Events.on('ajax:after',  ({ url }) => hideSpinner(url));

// Enviar un formulario con auto-validación
await AJAX.request({
  url: '/api/orders',
  form: document.getElementById('order-form')!,
  success: () => MSG.info('¡Pedido guardado!', { autoclose: 3000 }),
});
```

Esa única llamada a `AJAX.request()` hará:
1. Validar todos los campos `constraint="required"` del formulario
2. Emitir `ajax:before` (tu spinner aparece)
3. Serializar el formulario a JSON y hacer POST
4. Emitir `ajax:after` (el spinner se oculta)
5. Llamar tu callback `success`

---

## Demo en vivo

> **[Abrir `demo.html`](../demo.html)** — una guía interactiva de una sola página con consolas de salida en vivo para cada módulo.
>
> ```bash
> npx serve .        # luego abrir http://localhost:3000/demo.html
> ```

La demo te permite hacer clic a través de Events, AJAX, Validation, Formatting, diálogos MSG, inyección VIEW, y funciones utilitarias — con fragmentos de código junto a resultados en tiempo real.

---

## Arquitectura

```
                        ┌─────────────────┐
                        │  EventEmitter   │  ← Bus central tipado
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

Todos los módulos se comunican a través del `EventEmitter` tipado — ningún módulo importa a otro directamente. Esto hace que cada pieza sea independientemente testeable y reemplazable.

---

## Módulos

### Events — el bus central

```typescript
// Suscribirse con seguridad de tipos completa — nombres de eventos y payloads son verificados
Events.on('ajax:before', ({ url }) => console.log(url));     // url: string
Events.on('ajax:error',  ({ url, error }) => log(error));    // error: Error

// Desuscribirse
const off = Events.on('ajax:after', handler);
off(); // listo
```

**Eventos disponibles:**

| Evento | Payload | Se dispara cuando |
|-------|---------|------------|
| `ajax:before` | `{ url }` | Comienza la petición (excepto `noblock`) |
| `ajax:after` | `{ url }` | Petición completada |
| `ajax:error` | `{ url, error }` | Petición fallida |
| `view:beforeLoad` | `{ context }` | Nuevo fragmento DOM se inicializa |
| `validation:invalid` | `{ labelNames, elements }` | Campos requeridos faltantes |
| `validation:textareaTooLong` | `{ labelNames, maxlengths, elements }` | Textarea excede el límite |

---

### AJAX — fetch con ciclo de vida

```typescript
// POST simple
await AJAX.request({
  url: '/api/save',
  data: { name: 'Alice' },
  success: (res) => console.log('Listo'),
});

// POST con auto-validación + serialización de formulario
await AJAX.request({
  url: '/api/save',
  form: document.getElementById('myForm')!,
});

// Respuesta JSON tipada
const user = await AJAX.requestJSON<User>({
  url: '/api/user/1',
  success: (data) => { /* data es User, no unknown */ },
});
```

---

### Validation — restricciones declarativas

Declara en HTML, la librería hace el resto:

```html
<input constraint="required"             labelName="Nombre" />
<input constraint="required number"      labelName="Monto" />
<input constraint="required upperCase onlyEn" labelName="Código" />
<input constraint="date"                 labelName="Fecha de inicio" />
<input constraint="time"                 labelName="Hora de reunión" />
```

**Restricciones integradas:** `required` `number` `date` `time` `upperCase` `onlyEn`

**Agrega las tuyas:**

```typescript
Validation.addConstraint({
  name: 'email',
  attach(el) {
    el.addEventListener('change', () => {
      if (el.value && !el.value.includes('@')) el.value = '';
    });
  },
});
// Ahora usa: <input constraint="required email" labelName="Email" />
```

**Personaliza el manejo de errores:**

```typescript
Validation.setRequiredInvalidCallback((labelNames, elements) => {
  // Reemplaza el alert predeterminado con tu propia UI
  showToast(`Faltantes: ${labelNames.join(', ')}`);
  elements[0]?.focus();
});
```

---

### Formatting — máscaras de entrada

Declara en HTML:

```html
<input format="idNumber" />   <!-- A123456789 -->
<input format="date" />       <!-- 2026-02-24 (auto-inserta guiones) -->
<input format="time" />       <!-- 14:30 (auto-inserta dos puntos) -->
```

**Registra formateadores personalizados:**

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

### MSG — diálogos DOM vanilla

```typescript
// Notificación con cierre automático
MSG.info('¡Guardado!', { title: 'Éxito', autoclose: 3000 });

// Modal (debe hacer clic en OK)
MSG.modal('Sesión expirada.', { title: 'Advertencia' });

// Confirmación
MSG.confirm('Eliminar', '¿Estás seguro?', () => {
  deleteRecord();
});

// Cerrar programáticamente
MSG.dismissModal();
```

---

### VIEW — contenido dinámico con auto-inicialización

```typescript
// Cargar un fragmento HTML — restricciones + formateadores se auto-inicializan
await VIEW.load(document.getElementById('container')!, {
  url: '/api/partial-view',
});

// O inyectar manualmente y disparar hooks
container.innerHTML = htmlString;
VIEW.invokeBeforeLoad(container);

// Registra tu propio hook
VIEW.addBeforeLoad((context) => {
  context.querySelectorAll('.tooltip').forEach(initTooltip);
});
```

---

### Utilidades

```typescript
import { sprintf, formToJSON, isDateValid } from 'ts-util-core';

sprintf('Hola %s, tienes %d años', 'Alice', 30);
// → "Hola Alice, tienes 30 años"

sprintf('Precio: $%.2f', 9.5);
// → "Precio: $9.50"

const data = formToJSON(formElement);
// → { username: "alice", role: "viewer" }

isDateValid('2026-02-24');  // → true
isDateValid('not-a-date');  // → false
```

---

## Referencia API

### Singletons (pre-configurados, listos para usar)

| Exportación | Tipo | Descripción |
|--------|------|-------------|
| `AJAX` | `Ajax` | Cliente HTTP con integración de validación de formularios |
| `VIEW` | `View` | Cargador dinámico de fragmentos HTML |
| `MSG` | `Message` | Sistema de diálogos DOM |
| `Validation` | `Validator` | Motor de validación de formularios |
| `Formatter` | `FormatterRegistry` | Registro de máscaras de entrada |
| `Events` | `EventEmitter<AppEventMap>` | Bus de eventos tipado |

### Funciones utilitarias

| Exportación | Firma | Descripción |
|--------|-----------|-------------|
| `sprintf` | `(fmt: string, ...args) => string` | Formateo de cadenas estilo printf |
| `formToJSON` | `(container: HTMLElement, options?) => FormDataRecord` | Serializar entradas de formulario a JSON |
| `isDateValid` | `(value: string) => boolean` | Validar cadenas de fecha |
| `parseHTML` | `(html: string) => HTMLElement` | Parsear cadena HTML a DOM |
| `scrollToElement` | `(el: HTMLElement) => void` | Desplazamiento suave al elemento |
| `defaults` | `<T>(base: T, ...overrides: Partial<T>[]) => T` | Fusionar valores predeterminados con sobreescrituras |

### Clases (uso avanzado / testing)

| Exportación | Descripción |
|--------|-------------|
| `EventEmitter<T>` | Crear buses de eventos aislados para testing |
| `Ajax` | Instanciar con un emitter personalizado |
| `View` | Instanciar con un emitter + ajax personalizado |
| `Message` | Sistema de diálogos independiente |
| `Validator` | Validador independiente con emitter personalizado |
| `FormatterRegistry` | Registro de formateadores independiente |

---

## Estructura del proyecto

```
src/
├── index.ts                  # Exportación barrel + cableado de singletons
├── types.ts                  # Definiciones de tipos compartidos
├── core/
│   ├── event-emitter.ts      # EventEmitter tipado (Mediator)
│   ├── ajax.ts               # Cliente HTTP (Facade + Template Method)
│   ├── view.ts               # Cargador de fragmentos (Observer)
│   └── message.ts            # Sistema de diálogos (Facade)
├── validation/
│   ├── validator.ts           # Motor de validación (Strategy)
│   └── constraints.ts         # Restricciones integradas (Decorator)
├── formatting/
│   ├── registry.ts            # Registro de formateadores (Registry Pattern)
│   └── formatters.ts          # Formateadores integrados
└── utils/
    ├── sprintf.ts             # Formateo estilo printf
    └── dom.ts                 # Helpers DOM
```

**12 archivos fuente · ~1,600 líneas · TypeScript estricto · target ES2022 · cero dependencias**

---

## Build

```bash
npm run build          # compilación única
npm run dev            # modo watch
```

La salida va a `dist/` con `.js`, `.d.ts` y source maps.

---

## Patrones de diseño

Esta librería es un código educativo. Cada módulo implementa un patrón GoF nombrado:

| Patrón | Módulo | Qué enseña |
|---------|--------|----------------|
| **Mediator** | `EventEmitter` | Comunicación desacoplada entre módulos |
| **Facade** | `AJAX`, `MSG` | Ocultar complejidad multi-paso detrás de una llamada |
| **Template Method** | `requestJSON()` | Reutilizar un algoritmo base, personalizar un paso |
| **Observer** | `VIEW.addBeforeLoad()` | Registro de plugins sin acoplamiento |
| **Strategy** | `setRequiredInvalidCallback()` | Reemplazar comportamiento sin modificar el fuente |
| **Registry** | `Formatter` | Búsqueda extensible basada en claves |
| **Decorator** | atributos `constraint="..."` | Comportamiento composable vía HTML |

Documentación detallada:
- **[Before (jQuery)](https://github.com/MattAtAIEra/TS-Util/blob/main/docs/good-design-pattern-implementation-before.md)** — patrones en el código original
- **[After (TypeScript)](https://github.com/MattAtAIEra/TS-Util/blob/main/docs/good-design-pattern-implementation-after.md)** — cómo TypeScript los hace más seguros

---

## Licencia

MIT
