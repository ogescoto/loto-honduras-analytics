---
obligation: standard
area: governance
applies_to: all projects
---

# Asistencia Inicial del Proyecto (`Project_Start`)

## Propósito

Cuando un agente llega a un proyecto **vacío o sin contexto**, en lugar de un formulario rígido, arranca una **conversación guiada e interactiva** que asiste al usuario a:
1. **Orientar lo que se quiere construir** (visión, alcance, metas, primeras tareas).
2. **Preparar el ambiente de desarrollo** (stack, comandos, entornos, módulos protegidos).
3. **Configurar los agentes** (contrato, configuración y subagentes con frontmatter, referenciando los **skills que viven en el proyecto**, si los hay).
4. **Dibujar lo que se quiere** (diagramas Mermaid de la intención, versionados).

El agente propone, el usuario decide; el agente ayuda a precisar, no interroga a ciegas.

## Cuándo se activa

- Proyecto nuevo sin `docs/00_Proyecto/`.
- Proyecto existente sin documentación de contexto (visión/alcance/estado).
- El usuario pide explícitamente "empecemos".

## Cómo se ejecuta (el agente principal, en modo interactivo)

Regla de conversación: **una pregunta a la vez**, con opciones sugeridas, resumen tras cada respuesta y confirmación antes de pasar al siguiente bloque. En cada bloque:

1. Pregunta en el idioma del usuario.
2. Ofrece opciones razonables (no deja la hoja en blanco).
3. Anota lo confirmado; marca lo dudoso como `[SUPUESTO — confirmar]`.
4. Resume y pide OK antes de avanzar.

El flujo recorre los bloques en orden, pero el usuario puede saltarse un bloque (p. ej. "ya tengo el ambiente") si responde "omitir".

### Texto libre (modo avanzado)

Las opciones son **una ayuda, no una camisa de fuerza**. Un usuario avanzado puede responder **en texto libre** en cualquier punto, y esa respuesta **tiene prioridad** sobre las opciones:

1. Si el usuario responde con texto libre, se toma **tal cual**, sin forzarlo a elegir una opción.
2. El texto libre se procesa igual que una opción: se anota, se resuelven dudas y se confirma antes de avanzar.
3. Se permite **texto libre parcial**: responder con texto en una pregunta y elegir opciones en la siguiente, sin pedir permiso.
4. Si el texto libre introduce un supuesto no evidente, se marca `[SUPUESTO — confirmar]` y se lista al final.

Ejemplos de entradas de texto libre válidas: "el primer entregable es un dashboard que liste clientes y sus pagos", "no, el stack es FastAPI + React, olvídate de Django", "visión: los comercios pequeños cobran con móvil".

### Bloque 1 — Visión (¿qué y para quién?)
- ¿Qué problema resuelve?
- ¿Para quién?
- ¿Qué **no** debe ser? (fuera de alcance desde el inicio)
- ¿Cómo se sabrá que funciona? (criterio de éxito)

### Bloque 2 — Alcance (¿qué entra en esta versión?)
- ¿Qué entra? ¿Qué queda **explícitamente fuera**?
- ¿Restricciones de stack, tiempo o integraciones?
- ¿Cuál es el primer entregable usable?

### Bloque 3 — Metas (¿en qué pasos?)
- ¿Qué objetivos separables hay? ¿Cuál primero? ¿Dependen entre sí?
- Cada meta se registra como `M-<NNN>` con título, criterios de done y fechas (INI/FIN).

### Bloque 4 — Tareas del primer paso (¿por dónde empezar?)
- Descompón la primera meta en tareas `T-<NNN>` (tipo: pantalla / servicio / test / manual).
- Cada tarea: descripción corta + criterios de aceptación + fechas.
- Asigna el subagente que la ejecutará (ver [`Subagents.md`](Subagents.md)).

### Bloque 5 — Ambiente de desarrollo (¿con qué y dónde?)
- **Modo de incorporación del framework** (recomendado: submódulo Git anclado a un tag; ver [`Framework_Access_Standard.md`](Framework_Access_Standard.md)).
- **Stack y versiones de runtime** (`.nvmrc`/`.tool-versions`), gestor de paquetes.
- **Comandos canónicos** (`install`, `dev`, `migrate`, `seed-*`, `test`, `lint`, `build`) — ver [`../practicas/Environments.md`](../practicas/Environments.md).
- **Entornos** (local/test/staging/production), base de datos y servicios externos.
- **Módulos protegidos iniciales** (`.aicodeprotect.yml`) — ver [`Protected_Modules.md`](Protected_Modules.md).
- **Secretos y `.gitignore`** (`.env` fuera de Git) — ver [`../practicas/Secrets_Management.md`](../practicas/Secrets_Management.md).

Salida de este bloque: la configuración de ambiente confirmada (el agente la deja escrita como `[SUPUESTO — confirmar]` hasta que se implementa el arranque del proyecto).

### Bloque 6 — Agentes y skills (¿quiénes trabajan y con qué?)
- **Qué herramientas** trabajarán en el proyecto (`.claude/`, `.opencode/`, `.codex/`, `.whale/`, Cursor…). Una por herramienta real.
- **Qué subagentes del catálogo** puede ejecutar cada una (no todas ejecutan los 6). Catálogo: [`Subagents.md`](Subagents.md).
- **Skills del proyecto (opcional):** el usuario declara qué skills **existen ya en el proyecto** (su carpeta `skills/`, comandos, scripts). **El framework no aporta skills**: solo se registran los que el proyecto tiene. Cada skill se anota con su **ruta local** y qué agente/subagente lo invoca.
- Con lo confirmado, el agente **crea los archivos reales**:
  - `.<herramienta>/AGENT_CONTEXT.md` — frontmatter `agente_app`, `subagentes`, `idioma_respuesta` (ver [`../Templates/Agent_Contract_Template.md`](../Templates/Agent_Contract_Template.md) y [`Agent_Contract_Standard.md`](Agent_Contract_Standard.md)).
  - `.<herramienta>/AGENT_CONFIG.md` — frontmatter con `agente_app`, `version`, `proyecto`, `subagentes`, `idioma_respuesta`, `modo_cavernicola`, `modo_descubrimiento` y `skills` (opcional) (ver [`../Templates/AGENT_CONFIG_Template.md`](../Templates/AGENT_CONFIG_Template.md)).
  - Fichas de subagente en la configuración de cada herramienta (ver [`../Templates/Subagent_Template.md`](../Templates/Subagent_Template.md)).
- Cada archivo se muestra **antes de escribirse** y se crea con OK del usuario.

### Bloque 7 — Diagramas de lo que se quiere
- Con visión y metas confirmadas, el agente propone **diagramas Mermaid** que representan la intención:
  - **Contexto (C4 nivel 1):** usuarios y sistemas externos alrededor del producto.
  - **Flujo del sistema deseado:** los pasos de negocio de extremo a extremo.
  - **Arquitectura inicial (opcional):** componentes propuestos al nivel que el usuario quiera.
- Cada diagrama se muestra en el chat y el usuario lo corrige antes de guardarse.
- Se versionan en `docs/00_Proyecto/DIAGRAMAS.md` junto a `VISION.md`/`ALCANCE.md` (ver [`Project_Context_Standard.md`](Project_Context_Standard.md)).

> Los diagramas **documentan la intención acordada**, no un diseño impuesto. Si luego la realidad se aleja, `CONTEXTO_GLOBAL.md` (no el diagrama) es la verdad viva.

## Salida del arranque

1. `docs/00_Proyecto/VISION.md` — qué es y qué no es.
2. `docs/00_Proyecto/ALCANCE.md` — entra / no entra / restricciones.
3. `docs/00_Proyecto/CONTEXTO_GLOBAL.md` — stack, módulos, estado vivo.
4. `docs/00_Proyecto/DIAGRAMAS.md` — Mermaid de la intención (contexto, flujo, arquitectura inicial).
5. `.<herramienta>/AGENT_CONTEXT.md` por herramienta — identidad y capacidades (frontmatter).
6. `.<herramienta>/AGENT_CONFIG.md` por herramienta — configuración local, modelos por perfil y `skills` del proyecto si los hay (frontmatter).
7. Fichas de subagente replicadas en la configuración de cada herramienta.
8. Registro en `docs/07_Implementacion/`: tabla `META | TAREA | ESTADO | FECHA_INI | FECHA_FIN` (ver [`Activity_Tracking.md`](Activity_Tracking.md)).
9. Confirmación del usuario antes de empezar la primera tarea.

> La escritura de `docs/00_Proyecto/` y de los archivos de agentes la hace el agente principal durante el arranque (es la excepción inicial) o el `doc-mapper` si está configurado.

## Reglas

1. **No se inventa la intención.** Lo no confirmado va como `[SUPUESTO — confirmar]` y se lista al final.
2. **No se codifica** hasta que el usuario aprueba el árbol visión → alcance → metas → primera tarea.
3. **Iterar antes que completar:** si el usuario duda, se propone; no se fuerza la respuesta.
4. **Idioma:** siempre el del usuario.
5. **Skills solo del proyecto, no del framework.** El framework no declara skills; si el proyecto no tiene ninguno, la sección `skills` del frontmatter simplemente **no se incluye** o va vacía. No inventar skills que el proyecto no tiene.
6. **Archivos de agentes con frontmatter canónico** (`agente_app`, `subagentes`, `idioma_respuesta`; `AGENT_CONFIG` añade `modelos` por perfil y, si aplica, `skills`). No cambiar los nombres de los campos.
7. **Fidelidad a la realidad:** solo se declaran subagentes y skills que la herramienta **puede ejecutar de verdad**.
8. **Diagramas confirmados antes de guardar:** un diagrama guardado sin revisión del usuario es un supuesto no validado.
9. **Texto libre con prioridad:** las opciones son una ayuda; el texto libre del usuario se acepta tal cual y tiene prioridad sobre las opciones (ver [Texto libre](#texto-libre-modo-avanzado)).

## Anti-patrones

- ❌ Tirar un formulario de 20 preguntas de golpe.
- ❌ Asumir requisitos no confirmados.
- ❌ Empezar a codificar sin el primer plan aprobado.
- ❌ Pedir aprobación en cada micro-paso (bloquea el trabajo en segundo plano).
- ❌ Inventar skills del proyecto o hardcodear rutas de skills que no existen.
- ❌ Declarar subagentes que la herramienta no tiene configurados.
- ❌ Guardar diagramas sin confirmar con el usuario.
- ❌ Obligar a elegir una opción cuando el usuario ya respondió en texto libre.

## Relacionado

- [`Project_Context_Standard.md`](Project_Context_Standard.md) — qué contienen `VISION.md` / `ALCANCE.md` / `CONTEXTO_GLOBAL.md`.
- [`Agent_Workflow.md`](Agent_Workflow.md) — el ciclo después del arranque.
- [`Activity_Tracking.md`](Activity_Tracking.md) — registro de META/TAREA/ESTADO/FECHAS.
- [`Agent_Contract_Standard.md`](Agent_Contract_Standard.md) — `.<agente>/AGENT_CONTEXT.md`.
- [`Framework_Access_Standard.md`](Framework_Access_Standard.md) — cómo se incorpora y localiza el framework.
- [`../Templates/Project_Context_Template/`](../Templates/Project_Context_Template/) — plantillas de la bóveda inicial.
- [`../Templates/Agent_Contract_Template.md`](../Templates/Agent_Contract_Template.md), [`../Templates/AGENT_CONFIG_Template.md`](../Templates/AGENT_CONFIG_Template.md), [`../Templates/Subagent_Template.md`](../Templates/Subagent_Template.md) — archivos de agentes con frontmatter.
