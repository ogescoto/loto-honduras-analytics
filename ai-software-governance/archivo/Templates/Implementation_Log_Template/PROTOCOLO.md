# PROTOCOLO — Cómo trabajar en esta carpeta

> Este archivo se explica solo. No necesitas conocer el resto del proyecto ni a los demás
> agentes para operar aquí. Léelo entero antes de tocar nada.

Esta carpeta (`docs/07_Implementacion/`) es la **zona de escritura compartida**: todos los
agentes escriben aquí. El resto de la bóveda (`docs/01_` … `06_`, `docs/manual/`) **no se toca**
— la escribe solo el Experto de Documentación.

Excepción dentro de la zona: **`00_TABLERO.md` lo escribe únicamente el Project Manager.**

---

## 1. Qué debes hacer según el estado de la tarea

Cada tarea tiene un `sub_estado` en su frontmatter. **El sub-estado decide qué rol entra**;
nadie asigna trabajo a nadie. Busca tareas cuyo estado te corresponda:

| sub_estado | Entra | Qué se espera que produzcas | Lo dejas en | Si sale mal |
|---|---|---|---|---|
| `PENDING` | `dev` | Código **y sus pruebas** | `CODE_COMPLETE` | `PENDING` con bloqueador |
| `CODING` | — | Alguien está trabajando. No entres. | — | — |
| `CODE_COMPLETE` | `test-runner` | Ejecutar la suite y dar veredicto | `TEST_PASSED` | `TEST_FAILED` |
| `TESTING` | — | Alguien está ejecutando. No entres. | — | — |
| `TEST_FAILED` | `debugger` | Diagnóstico y qué hay que cambiar | `FIX_REQUIRED` | `TEST_FAILED` con bloqueador |
| `DEBUG_ANALYSIS` | — | Alguien está analizando. No entres. | — | — |
| `FIX_REQUIRED` | `dev` | Aplicar el cambio indicado | `CODE_COMPLETE` | `FIX_REQUIRED` con bloqueador |
| `TEST_PASSED` | `mapper` | Mapear el código funcional | `MAPPED` | `TEST_PASSED` con bloqueador |
| `MAPPED` | — | Lista para cerrar | `COMPLETE` | — |
| `COMPLETE` | — | Cerrada | — | — |

> **Cuando TODAS las tareas de la meta están en `MAPPED`/`COMPLETE`**, entra el `validator`:
> pruebas ácidas y edge cases sobre la **meta completa**, no tarea a tarea. Si encuentra
> defectos, devuelve las tareas afectadas a `FIX_REQUIRED` y el ciclo vuelve a empezar. Si
> pasa, el `pm` pide **aprobación al usuario** — una meta no se cierra sola. Ver
> `09_AI/Agent_Roles_And_Lifecycle.md`.

**Al entrar a trabajar**, pon el sub-estado "ocupado" que corresponda (`CODING`, `TESTING`,
`DEBUG_ANALYSIS`) para que nadie más entre. Al terminar, ponlo en el resultante.

---

## 2. Límites de cada rol

| Rol | Hace | **No hace** |
|---|---|---|
| `dev` | Escribe código y sus pruebas | No ejecuta la suite ni se declara verde |
| `test-runner` | Ejecuta y dice pasa / no pasa | **No arregla nada** |
| `debugger` | Diagnostica e indica qué cambiar | **No escribe código** |
| `mapper` | Mapea código que **ya pasa** pruebas | No mapea código en rojo |
| `validator` | Pruebas ácidas sobre la **meta completa** | **No corrige**: reporta y devuelve tareas a `FIX_REQUIRED` |
| `pm` | Regenera `00_TABLERO.md` | No asigna trabajo ni desbloquea |
| `initiator` | Entrevista al usuario y descompone en metas y tareas | No codifica; no inventa la intención |

Un rol que hace el trabajo de otro rompe el relevo. Respeta tu límite.

---

## 3. Secuencia al llegar

1. Lee este archivo.
2. Abre `<META>/00_INDICE.md` — ¿hay tarea cuyo `siguiente_rol` sea el tuyo?
3. Abre esa tarea `T-<NNN>_*.md`:
   - **Frontmatter** → estado, bloqueadores y `spec` (la ficha `SCR-*` o `UC-*` con el detalle
     funcional de qué hay que construir).
   - **Bitácora** → qué se intentó antes. No repitas un camino ya fallido.
4. Ejecuta tu parte.
5. Registra (ver abajo).

El contexto **funcional** viene de `spec`. El contexto de **proceso** viene del sub-estado y la
bitácora. No necesitas nada más.

---

## 4. Cómo registrar (obligatorio, tres escrituras)

### a) Actualiza el frontmatter de la tarea

```yaml
sub_estado: TEST_FAILED
siguiente_rol: debugger
iteracion: 2                      # +1 solo si el ciclo volvió atrás
bloqueadores: la validación de monto acepta 0
actualizado: 2026-08-07T16:20:47Z
```

### b) Añade una fila a la bitácora de la tarea

Arriba del todo (orden descendente). **Nunca edites ni borres filas existentes.**

```markdown
| ts | agente_app | rol_experto | sub_estado | accion | resultado | siguiente | artefactos |
|---|---|---|---|---|---|---|---|
| 2026-08-07T16:20:47Z | claude-code | test-runner | TEST_FAILED | ejecuta suite pagos | 2/14 rojas | debugger | tests/pagos.spec.ts:88 |
```

### c) Añade la misma fila a `<META>/_log/LOG_<YYYY-MM-DD>.md`

Con una columna extra `tarea` al inicio. Si el archivo del día no existe, créalo.

---

## 5. Las dos identidades (ambas obligatorias)

- **`agente_app`** — la herramienta desde la que operas: `opencode`, `claude-code`, `whale`,
  `codex`…
- **`rol_experto`** — el sub-agente que hizo el trabajo: `dev`, `test-runner`, `debugger`,
  `mapper`, `pm`.

Una app trae varios expertos. Sin las dos columnas no se sabe **qué herramienta** produjo el
artefacto ni **qué especialidad** actuó.

---

## 6. Reglas duras

1. **Append-only.** Se añaden filas; nunca se edita ni borra una existente, propia o ajena.
2. **Timestamp ISO 8601 UTC al segundo:** `2026-08-07T16:20:47Z`. Sin segundos no se puede
   reconstruir el orden de eventos concurrentes.
3. **Doble escritura:** bitácora de la tarea **y** log diario. Siempre las dos.
4. **Solo tu sub-estado.** Si el estado no te corresponde, no toques la tarea.
5. **No se mapea código en rojo.** El mapper entra en `TEST_PASSED`, nunca antes.
6. **`00_TABLERO.md` solo lo escribe el PM.**
7. **Fuera de esta carpeta no escribes.** El resto de `docs/` es del Experto de Documentación.

---

## 7. Si te bloqueas

Deja la tarea en su sub-estado actual, rellena `bloqueadores` con qué te impide avanzar y
registra la fila igualmente. **No la dejes en un estado "ocupado"** (`CODING`, `TESTING`,
`DEBUG_ANALYSIS`) — el PM lo marcará como estancamiento y nadie podrá entrar.

---

> Norma completa: `ai-software-governance/07_Documentation/Implementation_Log_Standard.md`
