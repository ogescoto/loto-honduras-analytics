---
obligation: standard
area: documentation
applies_to: all projects
---

# Registro de Decisiones de Arquitectura (ADR)

## Propósito
Capturar las decisiones de arquitectura **importantes** con su contexto y consecuencias, para que el "por qué" no se pierda. Un ADR responde: ¿qué decidimos, por qué, qué alternativas descartamos y qué implica?

## Cuándo escribir un ADR
- Elección de un patrón arquitectónico o tecnología estructural.
- Cambio a una política `mandatory`/`standard` del framework o del proyecto.
- Excepción aprobada a una norma `standard`.
- Decisión con impacto transversal o difícil de revertir.

> Si la decisión es trivial o local, no necesita ADR. Si alguien preguntará "¿por qué se hizo así?" dentro de seis meses, sí.

## Ubicación
- Decisiones del **proyecto**: `docs/02_Arquitectura/adr/NNNN-titulo.md`.
- Decisiones del **framework de gobernanza**: este archivo + entrada en [`../CHANGELOG.md`](../CHANGELOG.md).

## Numeración y estado
- Numeración secuencial: `0001`, `0002`…
- Estados: `Propuesto` → `Aceptado` → (`Reemplazado por ADR-N` | `Obsoleto`).
- Un ADR aceptado **no se borra ni se reescribe**; si cambia, se crea uno nuevo que lo reemplaza.

## Plantilla
Ver [`../Templates/ADR_Template.md`](../Templates/ADR_Template.md). Formato resumido:

```markdown
# ADR-0003: Usar Stripe Checkout en lugar de elementos propios

- **Estado:** Aceptado
- **Fecha:** 2026-06-18
- **Decisores:** Tech Lead, equipo backend

## Contexto
Necesitamos cobrar pagos con tarjeta cumpliendo PCI-DSS sin asumir el coste
de certificación de manejar datos de tarjeta directamente.

## Decisión
Usaremos Stripe Checkout (página alojada por Stripe) en vez de Stripe Elements
embebidos.

## Alternativas consideradas
- Stripe Elements: más control de UI, pero mayor alcance PCI.
- Pasarela propia: descartada por coste y riesgo.

## Consecuencias
- (+) Reducción del alcance PCI y del riesgo.
- (+) Implementación más rápida.
- (−) Menos control sobre la UI del checkout.
- Afecta a: módulo `payments`, flujo `05_Procesos/Flujo_Pago`.
```

## Registro de ADRs (índice del framework)

| ADR | Título | Estado | Fecha |
|---|---|---|---|
| 0001 | Adopción del framework de gobernanza | Aceptado | 2026-06-18 |
| _(añadir nuevos aquí)_ | | | |

## Relación con el proceso de excepciones
Las excepciones a reglas `standard` se documentan como ADR (ver [`../00_Governance/Exceptions_Process.md`](../00_Governance/Exceptions_Process.md)).

## Anti-patrones
- ❌ Tomar decisiones estructurales sin registrarlas.
- ❌ Reescribir un ADR aceptado en vez de superseder.
- ❌ ADRs sin sección de consecuencias (lo más valioso).
- ❌ Usar ADR para decisiones triviales (ruido).

## Relacionado
- [`Obsidian_Vault_Standard.md`](Obsidian_Vault_Standard.md), [`../GOVERNANCE.md`](../GOVERNANCE.md), [`../00_Governance/Exceptions_Process.md`](../00_Governance/Exceptions_Process.md)
