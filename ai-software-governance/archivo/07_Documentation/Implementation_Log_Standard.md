---
obligation: mandatory
area: documentation
applies_to: all projects
---

# Registro de Implementación (`docs/07_Implementacion/`)

## Propósito
Dar a los agentes una **zona de escritura compartida** donde registran, con precisión temporal, qué se está construyendo y en qué punto está. Es lo que permite que **agentes que no se conocen se releven**: uno deja el trabajo en un sub-estado conocido y otro lo recoge sin haber hablado nunca.

Resuelve tres problemas:
- **Relevo imposible:** sin registro, un agente que llega no sabe qué se intentó ni dónde quedó.
- **Trabajo duplicado o pisado:** dos agentes atacan lo mismo por no ver que ya está en curso.
- **Mapeo sobre código roto:** el mapper documenta código que todavía no pasa pruebas.

---

## La excepción a la regla del único escritor

La bóveda tiene **dos zonas con dueños distintos**:

| Zona | Escribe | Naturaleza |
|---|---|---|
| `docs/01_` … `06_`, `docs/manual/` | **Solo el Experto Obsidian** | Conocimiento curado: qué **es** el sistema |
| **`docs/07_Implementacion/`** | **Todos los agentes** | Registro de ejecución: quién hizo qué y cuándo |

Esta es la **única** excepción a la regla del único escritor ([`Obsidian_Vault_Standard.md`](Obsidian_Vault_Standard.md), [`../09_AI/Forbidden_Actions.md`](../09_AI/Forbidden_Actions.md)). Fuera de `07_Implementacion/` la regla se aplica sin matices.

Dentro de la zona compartida hay una sola excepción a la excepción: **`00_TABLERO.md` lo escribe únicamente el Project Manager** ([`../09_AI/Project_Manager.md`](../09_AI/Project_Manager.md)).

---

## Estructura

```
docs/07_Implementacion/
├── 00_TABLERO.md                    ← estado global + Mermaid (solo el PM)
├── PROTOCOLO.md                     ← contrato de entrada; se explica solo
│
├── M-001_flujo-pagos/
│   ├── META.md                      ← objetivo, alcance, criterios de done
│   ├── 00_INDICE.md                 ← tareas de la meta y su estado
│   ├── T-001_pantalla-apertura.md   ← tarea: estado ahora + bitácora
│   ├── T-002_servicio-cobro.md
│   └── _log/
│       └── LOG_2026-08-07.md        ← todos los eventos del día
│
└── _archivo/                        ← metas cerradas
```

Identificadores: `M-<NNN>` para metas, `T-<NNN>` para tareas — alineados con [`../01_Architecture/Naming_Conventions.md`](../01_Architecture/Naming_Conventions.md).

---

## Sub-estados (vocabulario cerrado)

Una tarea **no** está "hecha o no hecha". Recorre sub-estados, y **el sub-estado determina qué rol entra después**. Nadie asigna trabajo a nadie: cada agente lee el estado y sabe si le toca.

> **NOTA:** La definición canónica completa de todos los sub-estados de tarea, estados de meta, transiciones permitidas y roles por estado está en [`../09_AI/Unified_States_Standard.md`](../09_AI/Unified_States_Standard.md). Este documento resume lo esencial; remite allá para la matriz de transiciones.

| Sub-estado | Significa | Entra ahora |
|---|---|---|
| `PENDING` | Especificada, sin empezar | `dev-backend` o `dev-frontend` |
| `CODING` | En desarrollo | — (ocupada por dev) |
| `CODE_COMPLETE` | Código **y sus pruebas** escritos por el dev | `qa-tester` |
| `TESTING` | Ejecutando la suite | — (ocupada por qa-tester) |
| `TEST_FAILED` | Pruebas en rojo | `debugger` |
| `DEBUG_ANALYSIS` | Debugger investigando | — (ocupada por debugger) |
| `FIX_REQUIRED` | Debugger indicó qué cambiar | `dev-backend` o `dev-frontend` → vuelve a `CODING` |
| `TEST_PASSED` | Pruebas en verde | `mapper-writer` |
| `MAPPED` | Mapper escribió documentación en bóveda | `mapper-reader` (valida coherencia) |
| `COMPLETE` | Cerrada, validada, en mapa | — |

Valores en ASCII y mayúsculas: cualquier agente los parsea sin ambigüedad de idioma.

### El ciclo circular

```
PENDING → CODING → CODE_COMPLETE → TESTING ─┬─ TEST_PASSED → MAPPED → COMPLETE
                        ▲                    │
                        │                    └─ TEST_FAILED → DEBUG_ANALYSIS
                        │                                          │
                        └────────── FIX_REQUIRED ◄─────────────────┘
```

No hay límite de vueltas. El contador `iteracion` las cuenta; el PM alerta a partir de 3.

---

## Separación de responsabilidades entre roles

| Rol | Actúa en | Produce | **No hace** |
|---|---|---|---|
| `dev-backend` / `dev-frontend` | `PENDING`, `FIX_REQUIRED` | Código + sus pruebas | No ejecuta la suite ni se autodeclara verde |
| `qa-tester` | `CODE_COMPLETE` | Veredicto pasa/no pasa | **No arregla nada** |
| `debugger` | `TEST_FAILED` | Diagnóstico y qué cambiar | **No escribe código** |
| `mapper-writer` | `TEST_PASSED` | Documentación del código funcional en bóveda | No mapea código que no pasa pruebas |
| `mapper-reader` | `MAPPED` | Validación de coherencia código ↔ docs | No escribe código; solo reporta |
| `PM` | siempre | `00_TABLERO.md` | No asigna trabajo ni desbloquea |

Esta separación es lo que evita que dos agentes se pisen. Un rol que hace el trabajo de otro rompe el relevo. Ver [`../09_AI/Unified_States_Standard.md`](../09_AI/Unified_States_Standard.md) para la matriz completa de roles por estado.

---

## Las dos identidades del registro

Un agente app (la herramienta) trae **múltiples sub-agentes expertos**. El registro distingue ambos ejes:

- **`agente_app`** — la herramienta/plataforma: `opencode`, `claude-code`, `whale`, `codex`.
- **`rol_experto`** — el sub-agente que hizo el trabajo: `dev`, `test-runner`, `debugger`, `mapper`, `pm`.

Ambas columnas son **obligatorias**. Sin `agente_app` no se sabe qué herramienta produjo el artefacto; sin `rol_experto` no se sabe qué especialidad actuó.

---

## Formato de los archivos

### `T-<NNN>_<nombre>.md` — la tarea

**Frontmatter** — el estado *ahora* (se sobrescribe en cada evento):

```yaml
---
id: T-002
meta: M-001
titulo: Servicio de cobro
tipo: pantalla | servicio | test | manual
spec: SCR-CAJA-002        # ficha de pantalla o caso de uso que especifica la tarea
sub_estado: TEST_FAILED
siguiente_rol: debugger
iteracion: 2
bloqueadores: la validación de monto acepta 0
actualizado: 2026-08-07T16:20:47Z
---
```

**Bitácora** — todo lo que *pasó* (append-only, orden descendente):

```markdown
| ts | agente_app | rol_experto | sub_estado | accion | resultado | siguiente | artefactos |
|---|---|---|---|---|---|---|---|
| 2026-08-07T16:20:47Z | claude-code | test-runner | TEST_FAILED | ejecuta suite pagos | 2/14 rojas | debugger | tests/pagos.spec.ts:88 |
| 2026-08-07T15:52:10Z | opencode | dev | CODE_COMPLETE | servicio + 14 pruebas | 14 escritas | test-runner | src/services/pagos.ts |
| 2026-08-07T14:30:00Z | opencode | dev | CODING | inicio de implementación | — | — | — |
```

El frontmatter se lee en dos segundos para decidir el relevo; la bitácora se lee para saber qué se intentó antes.

### `_log/LOG_<YYYY-MM-DD>.md` — bitácora diaria

Mismas columnas **más `tarea`** al inicio. Es la vista cronológica cruzada de la meta; el PM la usa para el Gantt.

### `00_INDICE.md` — índice de la meta

| tarea | titulo | tipo | sub_estado | iteracion | depende_de | siguiente_rol | actualizado |

### `00_TABLERO.md` — estado global (solo el PM)

| meta | titulo | tareas | sub_estado_critico | iteraciones_max | sin_mapear | ultimo_evento | alerta |

Debajo, los diagramas Mermaid (estado por meta, timeline, iteraciones).

---

## Reglas de escritura (Mandatory)

1. **Append-only en las bitácoras.** Se añaden filas; **nunca** se edita ni borra una fila ajena ni propia. Es lo que hace seguro que varios agentes escriban sin coordinarse.
2. **Timestamp ISO 8601 UTC al segundo.** `2026-08-07T16:20:47Z`. Sin segundos no se puede reconstruir el orden real de eventos concurrentes.
3. **Doble escritura.** Cada evento se registra en **dos** sitios: la bitácora de su tarea y el log diario de la meta. Son vistas distintas del mismo hecho.
4. **El frontmatter se actualiza al terminar**, no al empezar: `sub_estado`, `siguiente_rol`, `bloqueadores`, `actualizado`, y `iteracion` si el ciclo volvió atrás.
5. **Un rol solo actúa en sus sub-estados.** Si el estado no le corresponde, no toca la tarea.
6. **No se mapea código que no pasa pruebas.** El mapper entra en `TEST_PASSED`, nunca antes.
7. **`00_TABLERO.md` solo lo escribe el PM.** Los demás lo leen.

---

## Protocolo del agente que llega

Cuatro lecturas, sin conocer el framework ni a los otros agentes:

1. **`PROTOCOLO.md`** — tabla de enrutamiento: qué rol actúa en cada sub-estado.
2. **`00_INDICE.md`** — ¿hay tarea cuyo `siguiente_rol` coincide con lo que sé hacer?
3. **`T-<NNN>.md`** — frontmatter: estado, bloqueadores y `spec` (la ficha `SCR-*` o `UC-*` con el detalle funcional).
4. **Bitácora** — qué se intentó antes, para no repetir un camino ya fallido.

Ejecuta. Al terminar escribe **tres cosas**: frontmatter actualizado, fila en la bitácora de la tarea, fila en el log diario.

El contexto **funcional** viene de `spec`; el contexto de **proceso** viene del sub-estado y la bitácora. Nada más hace falta.

---

## Relación con el resto de la bóveda

`07_Implementacion/` registra **cómo se construyó**; el resto de la bóveda describe **qué es** el sistema. El Experto Obsidian **lee** esta zona para destilar lo que merece perdurar (decisiones → ADR, flujos nuevos → `05_Procesos/`, módulos → `04_Modulos/`), pero **no la escribe**: el registro pertenece a quien ejecutó.

Cuando una meta se cierra, se mueve a `_archivo/`. Lo que debía perdurar ya vive en la bóveda curada.

---

## Anti-patrones

- ❌ Editar o borrar una fila de bitácora ya escrita (rompe el append-only y la auditoría).
- ❌ Registrar sin `agente_app` o sin `rol_experto` (no se sabe quién hizo qué).
- ❌ Timestamp sin segundos, o en hora local.
- ❌ Que el `dev` se declare `TEST_PASSED` sin que el `test-runner` ejecute.
- ❌ Que el `debugger` escriba el fix en vez de indicarlo.
- ❌ Mapear una tarea que no está en `TEST_PASSED`.
- ❌ Escribir `00_TABLERO.md` sin ser el PM.
- ❌ Tratar `07_Implementacion/` como documentación curada (es registro operativo).

## Relacionado
- [`Obsidian_Vault_Standard.md`](Obsidian_Vault_Standard.md), [`../09_AI/Project_Manager.md`](../09_AI/Project_Manager.md), [`../09_AI/Documentation_Expert.md`](../09_AI/Documentation_Expert.md), [`../09_AI/Agent_Workflow.md`](../09_AI/Agent_Workflow.md), [`../09_AI/Screen_Architect.md`](../09_AI/Screen_Architect.md), [`../Templates/Implementation_Log_Template/`](../Templates/Implementation_Log_Template/)
