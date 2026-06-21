---
obligation: mandatory
area: architecture
applies_to: all projects
---

# Utilidades Globales

## Definición
Código compartido por **múltiples módulos**: helpers, logging, configuración centralizada, constantes transversales, excepciones comunes, clientes base (HTTP, fechas, dinero, etc.).

> Regla mnemotécnica: si solo lo usa **un** módulo, no es global — vive dentro de ese módulo.

## Por qué es `mandatory`
Una utilidad global es un punto de acoplamiento: un cambio puede romper, en silencio, a todos sus consumidores. Por eso su modificación es la categoría más controlada del framework.

## Reglas de modificación (Mandatory)

1. **Análisis de impacto obligatorio.** Cualquier cambio en una utilidad global requiere enumerar todos los módulos consumidores y el efecto del cambio en cada uno.
2. **Tests completos.** No se modifica una utilidad global sin ejecutar **todos** los tests del proyecto (unidad e integración) y verificar que pasan.
3. **Documentación antes y después.** El agente debe leer la nota Obsidian `docs/03_Tecnico/Global_Utilities.md` antes de tocar nada, y actualizarla después.
4. **Nada de borrados silenciosos.** Está prohibido eliminar un método/función pública de una utilidad global sin un **período de deprecación documentado** (ver abajo).
5. **Compatibilidad hacia atrás por defecto.** Cambios que rompan la firma pública requieren aprobación (trátese como módulo protegido).

## Catálogo de utilidades
Cada proyecto mantiene un catálogo en `docs/03_Tecnico/Global_Utilities.md` listando cada utilidad con:
- Propósito y firma pública.
- Módulos que la usan.
- Versión desde la que está disponible.
- Estado: `activa` | `deprecada` (con fecha de retirada).

### Ejemplo de entrada de catálogo

```markdown
### `Money` (src/global-utils/money.ts)
- **Propósito:** representar importes con moneda y evitar errores de coma flotante.
- **Firma:** `Money.of(amount: number, currency: string): Money`
- **Usado por:** payments, billing, reporting
- **Disponible desde:** v0.3.0
- **Estado:** activa
```

## Período de deprecación

Para retirar o cambiar de forma incompatible una utilidad global:

1. Marcar como deprecada en código (`@deprecated`) y en el catálogo, indicando reemplazo y fecha de retirada.
2. Mantener la versión antigua funcionando durante al menos **un ciclo de release** (o lo que defina el proyecto).
3. Migrar a los consumidores uno a uno.
4. Solo entonces, eliminar. Registrar en [`../CHANGELOG.md`](../CHANGELOG.md).

## Creación de nuevas utilidades
Solo se justifica si **al menos dos módulos distintos** la necesitan. Si es específica de un módulo, vive dentro de él. Crear una utilidad global "por si acaso" está prohibido (YAGNI).

## Anti-patrones
- ❌ Convertir en global algo que solo usa un módulo.
- ❌ Cambiar la firma de una utilidad global "rápido" sin análisis de impacto.
- ❌ Meter lógica de negocio de un dominio concreto en utilidades globales.

## Relacionado
- [`Dependency_Rules.md`](Dependency_Rules.md) — las utilidades globales son una capa permitida de dependencia.
- [`../09_AI/Protected_Modules.md`](../09_AI/Protected_Modules.md) — suelen declararse protegidas.
