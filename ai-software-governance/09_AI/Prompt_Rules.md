---
obligation: standard
area: ai-governance
applies_to: all projects
---

# Reglas de Prompts e Interacción con Agentes

## Propósito
Definir cómo se formulan las tareas a los agentes y cómo los agentes deben razonar y responder, para obtener resultados predecibles, trazables y dentro del framework.

## Para quien da la tarea (humano)
Una buena tarea para un agente incluye:

- **Objetivo claro:** qué se quiere lograr (no cómo, salvo que importe).
- **Contexto:** módulo afectado, nota de la bóveda relevante, restricciones.
- **Criterios de aceptación:** cómo sabremos que está bien (tests, comportamiento).
- **Límites:** qué NO tocar, alcance acotado.

### Plantilla de tarea

```markdown
## Tarea
Implementar el reembolso parcial de un pago.

## Contexto
- Módulo: payments (ver docs/04_Modulos/Pagos.md)
- Flujo: docs/05_Procesos/Flujo_Pago.md
- Integra con Stripe (módulo protegido: requiere aprobación si se toca stripe-integration)

## Criterios de aceptación
- POST /payments/{id}/refund con importe parcial.
- Validación: no exceder el importe original ni reembolsar dos veces.
- Tests unitarios + integración; seeds dev/test actualizados.
- Nota del módulo y API.md actualizadas.

## Límites
- No modificar el flujo de creación de pago.
- No tocar autenticación (protegido).
```

## Para el agente (cómo razonar y responder)

1. **Empieza en [`../AI_START_HERE.md`](../AI_START_HERE.md)** y clasifica la tarea.
2. **Lee antes de escribir:** bóveda del módulo + estándares aplicables.
3. **Comprueba `.aicodeprotect.yml`** antes de tocar nada.
4. **Plan explícito antes de actuar** en tareas no triviales: enumera archivos a cambiar, tests a añadir, docs a actualizar. (Ver [`Agent_Workflow.md`](Agent_Workflow.md).)
5. **Pregunta ante la ambigüedad** en lugar de asumir, especialmente si afecta a algo irreversible o protegido.
6. **No inventes contexto.** Si un dato no está, búscalo o pregúntalo; no lo supongas.
7. **Cita tus fuentes** del repo: archivo y línea cuando referencias código.
8. **Resume al terminar:** qué cambiaste, archivos, tests, documentación, y qué quedó pendiente.

## Comunicación
- Respuestas en **español**, claras y al grano.
- Reporta honestamente: si los tests fallan, dilo con la salida; si saltaste un paso, dilo.
- No afirmes que algo está hecho y verificado si no lo está.

## Trazabilidad
- Relaciona el trabajo con la tarea/issue que lo motiva.
- Commits siguiendo Conventional Commits (ver [`../01_Architecture/Naming_Conventions.md`](../01_Architecture/Naming_Conventions.md)).
- Decisiones relevantes → ADR.

## Anti-patrones
- ❌ Tareas vagas ("mejóralo") sin criterios de aceptación.
- ❌ El agente asume requisitos no expresados.
- ❌ Actuar sin plan en cambios grandes.
- ❌ Reportar éxito sin verificar.
- ❌ Inventar nombres de archivos/APIs sin comprobar que existen.

## Relacionado
- [`Agent_Workflow.md`](Agent_Workflow.md), [`Forbidden_Actions.md`](Forbidden_Actions.md), [`Protected_Modules.md`](Protected_Modules.md), [`../AI_START_HERE.md`](../AI_START_HERE.md)
