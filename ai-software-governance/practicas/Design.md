---
obligation: standard
area: ui-ux
applies_to: all projects
---

# Diseño UI/UX (principios y sistema)

> Documento único que integra los **principios de diseño** (marco de decisión) y el
> **design system** (tokens y componentes). Las reglas `Mandatory` están marcadas como tales
> aunque la obligación del documento sea `standard`.

## Propósito

Dar a los agentes y diseñadores un marco común para tomar decisiones de interfaz coherentes: un conjunto único de tokens y componentes reutilizables, sin estilos ad-hoc repetidos. Esto da consistencia visual y velocidad.

## Principios

1. **Claridad ante todo.** La interfaz comunica qué se puede hacer y qué está pasando. Evita ambigüedad.
2. **Consistencia.** Mismos patrones para mismos problemas: un botón primario se ve y se comporta igual en toda la app. Se consumen tokens y componentes del sistema, no estilos sueltos.
3. **Feedback inmediato.** Toda acción del usuario produce una respuesta visible (estado de carga, éxito, error).
4. **Prevención de errores.** Es mejor evitar el error (deshabilitar, confirmar, validar en línea) que solo informarlo.
5. **Jerarquía visual.** Lo importante destaca; lo secundario se subordina. Usa tamaño, color y espacio con intención.
6. **Accesibilidad por defecto.** Ver [`Accessibility.md`](Accessibility.md). No es opcional.
7. **Carga cognitiva mínima.** Reconocer sobre recordar; valores por defecto sensatos; pasos progresivos.
8. **Respeta al usuario.** Sin patrones oscuros (dark patterns), sin engaños, sin interrupciones innecesarias.

## Estados que toda vista debe contemplar

| Estado | Qué mostrar |
|---|---|
| **Carga** | Skeleton/spinner; no salto de layout |
| **Vacío** | Mensaje útil + acción sugerida (no una pantalla en blanco) |
| **Error** | Qué pasó + cómo recuperarse (reintentar) |
| **Éxito** | Confirmación clara |
| **Parcial / offline** | Comunicar degradación, no fallar en silencio |

> Un agente que implemente una vista **debe** considerar estos cinco estados, no solo el "camino feliz".

> **Cómo se declaran:** el agente que implementa una vista declara sus cinco estados —junto al
> inventario exhaustivo de acciones— antes de codificar, y los deja documentados por `doc-mapper`
> (ver [`../gobernanza/Subagents.md`](../gobernanza/Subagents.md)). La **evidencia verificable** de
> que se cumplen las reglas `Mandatory` de las secciones siguientes son los tests E2E del flujo
> (ver [`E2E_Standards.md`](E2E_Standards.md)).

## Reglas de pantalla e interacción (Mandatory)

Estas reglas son **innegociables** (nivel `Mandatory`, aunque este documento sea `standard`).
Aplican a toda pantalla y a todo elemento que dispare un proceso.

### 1. CRUD y reportes en página completa, no en modal
Toda pantalla de **CRUD** (alta/edición/listado) o de **reporte** ocupa su **propia página
completa**. Los **modales** se reservan para confirmaciones y avisos cortos (p.ej. "¿Eliminar
este registro?"), **nunca** para formularios CRUD ni reportes. Razón: los modales rompen el
historial de navegación, el deep-linking, el responsive y la accesibilidad de flujos largos.

### 2. Toda página vive dentro del container de la app (shell)
Cada página se renderiza **dentro del container de la página principal**: un **shell**
persistente con cabecera, menú/navegación y un **área de contenido** donde se montan las
páginas. No se abren páginas fuera del shell, en ventanas/popups sueltos ni en pestañas nuevas
del navegador para flujos internos. El shell se mantiene; solo cambia el área de contenido.

### 3. Anti-doble-click en cualquier acción que procese
Todo botón o elemento clicable que **dispare un proceso** (guardar, enviar, generar, navegar)
se **deshabilita y muestra estado de carga** desde el primer click hasta que la operación
termina (éxito o error). El usuario **no puede** disparar la misma acción dos veces por un
doble click. Es *idempotencia visual*: una intención = una ejecución. El patrón técnico (botón
`loading`/`disabled` + guardia de reentrada) está en
[`Component_Architecture.md`](Component_Architecture.md).

### 4. Overlay de procesamiento en menú y navegación
Al **navegar** o ejecutar una acción **desde el menú**, se muestra un **overlay bloqueante de
procesamiento** que cubre el área e **impide reentradas** (doble click en el menú) hasta que la
navegación/acción se resuelve. Evita lanzar dos veces la misma página o pisar una carga en curso.

## Reglas de componentes de formulario (Mandatory)

Dos reglas **innegociables** sobre los controles del sistema:

1. **Todo `Select` es searchable.** El componente de selección del sistema (`SelectSearchable`)
   **siempre** incluye filtrado por texto. **No** se usan `<select>` nativos sueltos ni listas
   desplegables sin búsqueda, independientemente del número de opciones. Un select sin búsqueda
   se considera un componente fuera del sistema.

2. **Todo control valida su tipo de dato.** Cada control declara el **tipo de dato** que admite
   y **rechaza** lo que no corresponda: un campo numérico no acepta letras, uno de fecha solo
   fechas válidas, uno de email solo el formato de email, etc. Esta validación de tipo vive en el
   **propio componente del Design System** para que sea transversal a toda la app (no se reescribe
   por pantalla). Es **UX y prevención de errores**; **no sustituye** la validación del servidor
   (ver [`Validation.md`](Validation.md)).

## Design Tokens

Valores nombrados que definen el lenguaje visual. Viven en un único lugar (`tokens` / variables CSS / tema).

```css
:root {
  /* Color */
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-danger: #dc2626;
  --color-text: #111827;
  --color-text-muted: #6b7280;
  --color-surface: #ffffff;

  /* Espaciado (escala 4px) */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px;
  --space-4: 16px; --space-6: 24px; --space-8: 32px;

  /* Tipografía */
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.25rem;
  --font-weight-bold: 600;

  /* Radios y sombras */
  --radius-md: 8px;
  --shadow-card: 0 1px 3px rgba(0,0,0,0.1);
}
```

- **Prohibido** usar valores "mágicos" (`color: #3b82f6`, `margin: 13px`). Usa tokens.
- Los modos (claro/oscuro) se implementan reasignando tokens, no duplicando estilos.

## Catálogo de componentes

El sistema mantiene componentes base reutilizables. Mínimo recomendado:

| Componente | Variantes | Estados |
|---|---|---|
| Button | primary, secondary, danger, ghost | default, hover, focus, disabled, loading |
| Input / Field | text, email, password, number, date, textarea | default, focus, error, disabled |
| **Select** (siempre searchable) | single, multi | default, focus, error, disabled, loading |
| Modal / Dialog | — | abierto/cerrado, con trap de foco |
| Toast / Notification | success, error, info, warning | — |
| Table | — | carga, vacío, error |
| Card | — | — |
| Tabs, Tooltip, Badge | — | — |

Cada componente:
- Consume tokens (no estilos hardcodeados).
- Es accesible por defecto (ver [`Accessibility.md`](Accessibility.md)).
- Contempla los estados de la tabla anterior.

```tsx
// Field tipado: el control conoce su tipo y filtra lo que no encaja.
type FieldType = 'text' | 'number' | 'date' | 'email';

type FieldProps = {
  type: FieldType;
  value: string;
  onChange: (next: string) => void;
  error?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'>;

export function Field({ type, value, onChange, error, ...props }: FieldProps) {
  function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value;
    // El control solo deja pasar lo que corresponde a su tipo.
    if (type === 'number' && next !== '' && !/^-?\d*[.,]?\d*$/.test(next)) return;
    onChange(next);
  }
  return (
    <input
      type={type === 'number' ? 'text' : type}   // 'text' + máscara para control total
      inputMode={type === 'number' ? 'decimal' : undefined}
      value={value}
      onChange={handle}
      aria-invalid={!!error}
      {...props}
    />
  );
}
```

```tsx
// Select del sistema: siempre con búsqueda incorporada.
<SelectSearchable
  options={countries}
  value={countryId}
  onChange={setCountryId}
  placeholder="Buscar país…"
/>
```

### Ejemplo de componente (React)

```tsx
type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ variant = 'primary', loading, children, ...props }: ButtonProps) {
  return (
    <button className={`btn btn--${variant}`} aria-busy={loading} disabled={loading || props.disabled} {...props}>
      {loading ? <Spinner aria-hidden /> : children}
    </button>
  );
}
```

## Microcopy
- Mensajes en **español**, claros y orientados a la acción.
- Errores que explican qué hacer, no códigos crudos al usuario.
- Botones con verbos (`Guardar cambios`, no `OK`).

## Responsive y dispositivos
- Diseño adaptable: móvil, tablet, escritorio.
- Áreas táctiles suficientes (mínimo ~44×44 px).
- No depender solo de hover (no existe en táctil).

## Declaración de estados antes de implementar
Antes de implementar una vista, define sus cinco estados y el inventario de acciones; no
implementes solo el "camino feliz". Implementar contra esa declaración, no contra la intuición.

## Herramientas
- Para proyectos basados en React/Tailwind, se recomienda **shadcn/ui** como base de componentes + tokens. Documenta la elección en `docs/06_UX_UI/`.
- Catálogo vivo: Storybook (o equivalente) como documentación interactiva de los componentes.

## Reglas para el agente
- Antes de crear un componente, **busca si ya existe** en el sistema.
- Si necesitas un valor visual nuevo, **añade un token**, no un literal.
- Documenta componentes nuevos en el catálogo y en `docs/06_UX_UI/`.

## Relación con el manual de usuario
Cada flujo de UI relevante debe poder documentarse en el manual de usuario automático (ver [`../gobernanza/User_Manual_Standard.md`](../gobernanza/User_Manual_Standard.md)) mediante tests E2E anotados.

## Anti-patrones
- ❌ Pantallas en blanco sin estado vacío.
- ❌ Acciones sin feedback.
- ❌ Inconsistencia visual entre vistas equivalentes.
- ❌ Dark patterns (suscripciones difíciles de cancelar, casillas pre-marcadas engañosas).
- ❌ Texto de error técnico mostrado al usuario final.
- ❌ Formulario CRUD o reporte dentro de un modal en vez de su propia página.
- ❌ Abrir una página fuera del shell (popup, ventana o pestaña suelta) para un flujo interno.
- ❌ Botón que permite doble envío por no bloquearse durante el proceso.
- ❌ Navegar desde el menú sin overlay, permitiendo dobles clicks que lanzan la acción dos veces.
- ❌ Estilos inline con valores mágicos.
- ❌ Reimplementar un botón/modal que ya existe.
- ❌ Duplicar la paleta de colores por todo el código.
- ❌ Modo oscuro con CSS duplicado en vez de tokens.
- ❌ Usar un `<select>` nativo o un desplegable sin búsqueda (debe ser `SelectSearchable`).
- ❌ Un control que acepta cualquier carácter sin filtrar por su tipo de dato.

## Relacionado
- [`Accessibility.md`](Accessibility.md), [`Component_Architecture.md`](Component_Architecture.md), [`../gobernanza/Subagents.md`](../gobernanza/Subagents.md)
