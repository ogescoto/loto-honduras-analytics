---
obligation: standard
area: ai-governance
applies_to: all projects
---

# Flujo de Trabajo del Agente

## Propósito
Definir el ciclo de trabajo estándar que un agente sigue para cualquier tarea de código, de principio a fin. Es la coreografía que une todas las políticas.

## El ciclo completo

```
┌──────────────────────────────────────────────────────────────┐
│ 1. ENTENDER     leer AI_START_HERE, clasificar tarea          │
│ 2. CONTEXTO     CONSULTAR al Experto Obsidian + .aicodeprotect │
│ 3. PLANIFICAR   plan explícito: archivos, tests, docs, seeds   │
│ 4. (¿PROTEGIDO?) si toca protegido → detener y pedir aprobación│
│ 5. LÍNEA BASE   ejecutar tests existentes (deben pasar)        │
│ 6. IMPLEMENTAR  código según estándares de la capa            │
│ 7. SEEDS        crear/actualizar seeds dev y test              │
│ 8. PROBAR       unitarios + integración (+ E2E si aplica)      │
│ 9. DOCUMENTAR   ENTREGAR los cambios al Experto Obsidian       │
│ 10. CHECKLIST   completar la checklist correspondiente         │
│ 11. REPORTAR    resumen honesto al humano                      │
└──────────────────────────────────────────────────────────────┘

> **Principio de ahorro de contexto:** no leas toda la bóveda ni la escribas tú. En la fase 2
> **preguntas** al Experto Obsidian (`/obsidian`) y en la fase 9 le **entregas** los cambios.
> Tu contexto se gasta en consultar al experto + leer las reglas/estándares para implementar.
> Ver [`Documentation_Expert.md`](Documentation_Expert.md).
```

## Detalle por fase

### 1–2. Entender y contexto
- Empieza en [`../AI_START_HERE.md`](../AI_START_HERE.md). Clasifica: creación / modificación / documentación.
- **Consulta al Experto Obsidian** (`/obsidian <pregunta>`): qué existe, dónde está y qué entender para tu tarea. No leas toda la bóveda tú mismo.
- Lee `.aicodeprotect.yml`. **Antes** de cualquier cambio.

### 3. Planificar
Para tareas no triviales, produce un plan explícito:
- Archivos a crear/modificar.
- Tests a añadir.
- Seeds a tocar.
- Documentación a actualizar.
- Riesgos y dependencias.

Si la tarea es ambigua o irreversible, **pregunta antes de planificar el detalle**.

### 4. Comprobación de protección
Si algún archivo del plan cae bajo un path protegido (`ask_approval: true`):
- **Detente.** Activa el protocolo de [`Protected_Modules.md`](Protected_Modules.md).
- No continúes hasta tener `APPROVED`.

### 5. Línea base
- Ejecuta la suite existente. Si ya está roja, **repórtalo**; no construyas sobre rojo.

### 6. Implementar
- Respeta los estándares de la capa: [`../04_Backend/`](../04_Backend/), [`../05_Frontend/`](../05_Frontend/), [`../03_Database/`](../03_Database/), [`../02_UI_UX/`](../02_UI_UX/).
- Respeta naming y dependencias ([`../01_Architecture/`](../01_Architecture/)).
- Cambios pequeños y cohesivos.

### 7. Seeds
- Toda entidad/caso de uso nuevo → seeds `dev_` y `test_` (ver [`../03_Database/Seeds_Strategy.md`](../03_Database/Seeds_Strategy.md)).

### 8. Probar
- Unitarios para la lógica nueva; integración para casos de uso; E2E para flujos críticos.
- Cobertura por encima del umbral ([`../06_Testing/Coverage_Requirements.md`](../06_Testing/Coverage_Requirements.md)).
- **No se termina con tests en rojo.**

### 9. Documentar
- **Entrega los cambios al Experto Obsidian:** `/obsidian update <archivos modificados> -- <resumen>`. Él actualiza la bóveda (nota del módulo, API, flujos, ADR, manual). **No escribas tú en `docs/`.**
- Para flujos de usuario, añade `@manual-step` en los E2E y entrégalos también al experto ([`../07_Documentation/User_Manual_Standard.md`](../07_Documentation/User_Manual_Standard.md)).
- Revisa el reporte del experto: confirma que documentó lo necesario y aporta lo que falte.

### 10. Checklist
- Completa la checklist aplicable de [`../Checklists/`](../Checklists/).

### 11. Reportar
Resume al humano:
- Qué cambiaste y por qué.
- Archivos tocados.
- Tests añadidos y su resultado.
- Documentación actualizada.
- Pendientes / decisiones que requieren su atención.

## Cuándo detenerse y preguntar
- Tarea ambigua o con criterios poco claros.
- Necesidad de tocar un módulo protegido.
- Acción destructiva o irreversible.
- Conflicto entre dos políticas que no puedes resolver por obligatoriedad/especificidad.
- Falta de información que no puedes obtener del repo.

## Anti-patrones
- ❌ Saltarse la consulta al experto y "tirar código".
- ❌ **Escribir directamente en `docs/`** en vez de entregar los cambios al experto.
- ❌ Implementar sin plan en cambios grandes.
- ❌ Olvidar seeds o no entregar los cambios para documentar.
- ❌ Reportar éxito sin verificar tests.
- ❌ Continuar tras detectar un módulo protegido.

## Relacionado
- [`../AI_START_HERE.md`](../AI_START_HERE.md), [`Documentation_Expert.md`](Documentation_Expert.md), [`Prompt_Rules.md`](Prompt_Rules.md), [`Protected_Modules.md`](Protected_Modules.md), [`Forbidden_Actions.md`](Forbidden_Actions.md), [`../Checklists/`](../Checklists/)
