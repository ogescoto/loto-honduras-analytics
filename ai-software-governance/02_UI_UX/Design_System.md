---
obligation: standard
area: ui-ux
applies_to: all projects
---

# Design System

## Propósito
Que la interfaz se construya a partir de un conjunto único de tokens y componentes reutilizables, en lugar de estilos ad-hoc repetidos. Esto da consistencia visual y velocidad.

## Principio central
**No se crean estilos sueltos.** Se consumen **design tokens** y **componentes del sistema**. Si algo no existe en el sistema, se propone añadirlo, no se improvisa localmente.

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
- Contempla los estados de [`Design_Principles.md`](Design_Principles.md).

### Reglas de componentes de formulario (Mandatory)

Dos reglas **innegociables** sobre los controles del sistema (su nivel es `Mandatory`,
aunque este documento sea `standard`):

1. **Todo `Select` es searchable.** El componente de selección del sistema (`SelectSearchable`)
   **siempre** incluye filtrado por texto. **No** se usan `<select>` nativos sueltos ni listas
   desplegables sin búsqueda, independientemente del número de opciones. Un select sin búsqueda
   se considera un componente fuera del sistema.

2. **Todo control valida su tipo de dato.** Cada control declara el **tipo de dato** que admite
   y **rechaza** lo que no corresponda: un campo numérico no acepta letras, uno de fecha solo
   fechas válidas, uno de email solo el formato de email, etc. Esta validación de tipo vive en el
   **propio componente del Design System** para que sea transversal a toda la app (no se reescribe
   por pantalla). Es **UX y prevención de errores**; **no sustituye** la validación del servidor
   (ver [`../04_Backend/Validation.md`](../04_Backend/Validation.md)).

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

## Ejemplo de componente (React)

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

## Herramientas
- Para proyectos basados en React/Tailwind, se recomienda **shadcn/ui** como base de componentes + tokens. Documenta la elección en `docs/06_UX_UI/`.
- Catálogo vivo: Storybook (o equivalente) como documentación interactiva de los componentes.

## Reglas para el agente
- Antes de crear un componente, **busca si ya existe** en el sistema.
- Si necesitas un valor visual nuevo, **añade un token**, no un literal.
- Documenta componentes nuevos en el catálogo y en `docs/06_UX_UI/`.

## Anti-patrones
- ❌ Estilos inline con valores mágicos.
- ❌ Reimplementar un botón/modal que ya existe.
- ❌ Duplicar la paleta de colores por todo el código.
- ❌ Modo oscuro con CSS duplicado en vez de tokens.
- ❌ Usar un `<select>` nativo o un desplegable sin búsqueda (debe ser `SelectSearchable`).
- ❌ Un control que acepta cualquier carácter sin filtrar por su tipo de dato.

## Relacionado
- [`Design_Principles.md`](Design_Principles.md), [`Accessibility.md`](Accessibility.md), [`../05_Frontend/Component_Architecture.md`](../05_Frontend/Component_Architecture.md)
