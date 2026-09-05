---
obligation: standard
area: ai-governance
applies_to: all projects
---

# Subagentes

## Propósito

Definir el catálogo de subagentes que **casi todo proyecto necesita**. Son la forma de que el agente principal sea un **coordinador delgado**: delega en subagentes con **scope estricto**, **contexto aislado** y **modelo económico**, y solo recibe un resumen compacto.

Estos subagentes se describen de forma **agnóstica de herramienta**: cualquier agente (OpenCode, Claude Code, Cursor, Codex…) puede replicarlos en su propio entorno.

---

## Catálogo

| Subagente | Scope (solo esto) | Perfil de modelo | Idioma de respuesta |
|---|---|---|---|
| `doc-mapper` | Escribe/actualiza documentación, mapea código funcional → bóveda y mantiene el **mapa conceptos ↔ código** | **pensante** (capaz) | del usuario |
| `doc-reader` | Lee bóveda/código y responde dudas de contexto, flujos y componentes usando el mapa | **barato** | del usuario |
| `dev-backend` | Backend: lógica, APIs, BD, tests unitarios/integración | capaz | del usuario |
| `dev-frontend` | Frontend: componentes, estado, E2E | capaz | del usuario |
| `tester` | Ejecuta la suite y da veredicto pasa/falla | **barato** | del usuario |
| `activity-manager` | Registra META / TAREA / ESTADO / FECHA_INI / FECHA_FIN | **barato** | del usuario |

> **Enrutamiento de modelos:** el modelo **capaz/pensante se reserva para escribir** (código o documentación). Leer, buscar, probar y registrar son trabajo de modelo **barato**. Así el costo de tokens se concentra donde aporta.

---

## Fichas por subagente

### `doc-mapper` — Documentación, mapeo y mapa conceptos ↔ código
- **Entrada:** código funcional (tests en verde) o cambios entregados por el principal.
- **Salida:** nota de módulo/entidad, API, flujos, ADR cuando aplique, y el **mapa conceptos ↔ código** ([`Obsidian_Vault_Standard.md`](Obsidian_Vault_Standard.md)).
- **Mapa conceptos ↔ código:** `docs/03_Tecnico/Mapa_Conceptos_Codigo.md`. Relaciona cada concepto, componente y flujo con los **archivos, componentes y funcionalidades clave** del código, en el idioma del usuario. Es el puente que permite a `doc-reader` (modelo barato) explicar "si quiero crear un cliente, ¿qué flujo es?" o "¿qué archivos o componentes intervienen y cómo?" **sin releer el código**.
- **Modelo sugerido:** pensante (compone documentación de calidad).
- **No hace:** código de negocio, ni pruebas.
- **Idioma:** el del usuario.

### `doc-reader` — Lectura de documentación y respuestas de flujo
- **Entrada:** pregunta de contexto (¿qué hace el módulo X?, ¿dónde vive Y?) o de **flujo/componente** ("si quiero crear un cliente, ¿qué flujo es?", "¿qué archivos o componentes intervienen y cómo?").
- **Salida:** respuesta concisa con `archivo:línea` como referencia, basada en el **mapa conceptos ↔ código** y la bóveda. Solo si el mapa no lo cubre, lee el código puntual.
- **Modelo sugerido:** barato.
- **No hace:** escribir nada, ni modificar archivos.
- **Idioma:** el del usuario.

### `dev-backend` — Desarrollo backend
- **Entrada:** tarea con criterios de aceptación (y su spec si existe).
- **Salida:** código + tests unitarios/integración en su estado `CODE_COMPLETE`.
- **Modelo sugerido:** capaz.
- **No hace:** frontend, ni ejecutar la suite completa, ni autodeclararse verde.
- **Idioma:** el del usuario.

### `dev-frontend` — Desarrollo frontend
- **Entrada:** tarea de pantalla con criterios de aceptación (y ficha si existe).
- **Salida:** componentes + tests E2E en su estado `CODE_COMPLETE`.
- **Modelo sugerido:** capaz.
- **No hace:** backend, ni ejecutar la suite completa, ni autodeclararse verde.
- **Idioma:** el del usuario.

### `tester` — Ejecución de pruebas
- **Entrada:** tarea en `CODE_COMPLETE`.
- **Salida:** veredicto pasa/falla, con lista de tests fallidos.
- **Modelo sugerido:** barato.
- **No hace:** arreglar código; si algo falla, el `dev` correspondiente corrige según el reporte.
- **Idioma:** el del usuario.

### `activity-manager` — Gestión de actividades
- **Entrada:** eventos (tarea creada, cambia de estado, termina).
- **Salida:** tabla `META | TAREA | ESTADO | FECHA_INI | FECHA_FIN` en `docs/07_Implementacion/` (ver [`Activity_Tracking.md`](Activity_Tracking.md)).
- **Modelo sugerido:** barato.
- **No hace:** asignar trabajo, ni crear tareas por su cuenta, ni diagramar.
- **Idioma:** el del usuario.

---

## Reglas comunes a todos

1. **Contexto aislado:** cada subagente arranca con contexto limpio y devuelve solo un resumen compacto al principal.
2. **Scope estricto:** un subagente no hace el trabajo de otro.
3. **Modo cavernícola de razonamiento:** el pensamiento interno es mínimo (solo conclusiones); la respuesta final es completa y en el idioma del usuario.
4. **Modelo por perfil:** barato para leer/probar/registrar; capaz solo para escribir.
5. **Contrato:** cada subagente declara `scope`, `modelo`, `idioma` y `contexto_aislado` (plantilla: [`../Templates/Subagent_Template.md`](../Templates/Subagent_Template.md)).

---

## Anti-patrones

- ❌ El principal resuelve inline lo que puede delegar (infla su contexto).
- ❌ Un subagente usa modelo capaz para leer o probar (gasto innecesario).
- ❌ Razonamiento interno extenso en subagentes (modo cavernícola).
- ❌ Responder en idioma distinto al que usa el usuario.

## Relacionado

- [`Agent_Workflow.md`](Agent_Workflow.md) — cómo el principal delega.
- [`Activity_Tracking.md`](Activity_Tracking.md) — registro del `activity-manager`.
- [`Project_Start.md`](Project_Start.md) — asistencia inicial.
- [`Forbidden_Actions.md`](Forbidden_Actions.md) — reglas duras.
- [`../Templates/Subagent_Template.md`](../Templates/Subagent_Template.md) — plantilla de subagente.
