---
obligation: standard
area: ui-ux
applies_to: all projects
---

# Accesibilidad (a11y)

## Propósito
Garantizar que la aplicación sea usable por personas con distintas capacidades. La accesibilidad es un requisito de calidad y, a menudo, legal.

## Objetivo de conformidad
**WCAG 2.1 nivel AA** como mínimo, salvo que el proyecto especifique otro nivel en su documentación.

## Reglas (Standard)

### Semántica
- Usa HTML semántico (`<button>`, `<nav>`, `<main>`, `<header>`, `<label>`). No `divs` clicables.
- Un solo `<h1>` por página; jerarquía de encabezados sin saltos.
- Landmarks para navegación por lector de pantalla.

### Teclado
- **Todo es operable con teclado.** Nada depende exclusivamente del ratón.
- Orden de tabulación lógico.
- Foco **visible** (no eliminar el outline sin reemplazo).
- Atajos no interfieren con los del lector de pantalla.

### Texto alternativo y etiquetas
- `alt` descriptivo en imágenes informativas; `alt=""` en decorativas.
- Todo input tiene `<label>` asociado.
- Iconos-botón tienen `aria-label`.

### Color y contraste
- Contraste mínimo **4.5:1** para texto normal, **3:1** para texto grande.
- **El color no es el único medio** de transmitir información (añade icono/texto a estados).

### ARIA (con cuidado)
- Prefiere HTML nativo sobre ARIA.
- Usa ARIA solo cuando el nativo no basta (componentes complejos: tabs, modales, comboboxes).
- Modales: trap de foco, `aria-modal`, cierre con `Esc`, devolver el foco al abrir/cerrar.

### Formularios
- Errores asociados al campo (`aria-describedby`), anunciados a lectores de pantalla.
- Estados de validación no solo por color.

### Movimiento
- Respeta `prefers-reduced-motion`.
- Sin contenido que parpadee de forma peligrosa.

## Ejemplo correcto

```html
<button type="submit" aria-label="Guardar cambios">
  <svg aria-hidden="true">...</svg>
  Guardar
</button>

<label for="email">Correo electrónico</label>
<input id="email" type="email" aria-describedby="email-error" />
<p id="email-error" role="alert">Introduce un correo válido.</p>
```

## Verificación
- Lint de accesibilidad (`eslint-plugin-jsx-a11y` o equivalente).
- Auditoría automatizada (axe, Lighthouse) en CI como gate.
- Pruebas manuales: navegación solo con teclado y con lector de pantalla en flujos clave.
- Los tests E2E de flujos críticos incluyen aserciones de accesibilidad básicas.

## Anti-patrones
- ❌ `<div onClick>` en vez de `<button>`.
- ❌ Quitar el `:focus` visible.
- ❌ Imágenes informativas sin `alt`.
- ❌ Comunicar estado solo por color.
- ❌ Modales sin trap de foco ni cierre con teclado.

## Relacionado
- [`Design_Principles.md`](Design_Principles.md), [`Design_System.md`](Design_System.md), [`../06_Testing/E2E_Standards.md`](../06_Testing/E2E_Standards.md)
