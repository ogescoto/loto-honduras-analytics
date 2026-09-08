---
id: T-<NNN>
meta: M-<NNN>
titulo: <nombre de negocio de la tarea>
tipo: pantalla | servicio | test | manual
spec: <SCR-MODULO-NNN | UC-MODULO-NNN>
sub_estado: PENDING
siguiente_rol: dev
iteracion: 0
bloqueadores: ninguno
actualizado: <YYYY-MM-DDTHH:MM:SSZ>
---

# T-<NNN> — <Título de la tarea>

**Objetivo:** <qué hay que construir, una o dos líneas>

**Especificación:** ver `spec` en el frontmatter — ahí está el detalle funcional
(ficha de pantalla `SCR-*` o caso de uso `UC-*`).

**Criterios de aceptación:**
- <criterio 1>
- <criterio 2>

**Depende de:** <T-NNN, T-NNN> o "ninguna"

---

## Bitácora

*Append-only, orden descendente (lo último arriba). Nunca edites ni borres filas.*

| ts | agente_app | rol_experto | sub_estado | accion | resultado | siguiente | artefactos |
|---|---|---|---|---|---|---|---|
| <YYYY-MM-DDTHH:MM:SSZ> | <opencode\|claude-code\|whale\|codex> | <dev\|test-runner\|debugger\|mapper> | <SUB_ESTADO> | <qué hizo, una línea> | <dato concreto> | <rol que entra> | <archivos:línea, commit> |

---

## Notas de iteración

*Opcional. Contexto que el siguiente agente debe saber y que no cabe en una fila.*

### Iteración <N>
- <qué se intentó, qué se descartó y por qué>
