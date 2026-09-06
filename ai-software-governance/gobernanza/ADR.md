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

## Relación con el versionado (ADR ⇒ MAJOR)

Un ADR que **altera o retira** una regla existente implica un incremento **MAJOR** del framework; añadir una política nueva sin tocar las existentes es **MINOR**. Ver [`Framework_Access_Standard.md`](Framework_Access_Standard.md).

Así, la versión comunica por sí sola si un proyecto puede actualizar sin revisar nada o si debe leer la migración antes.

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
| [0002](#adr-0002-separar-la-especificación-de-pantallas-del-caso-de-uso) | Separar la especificación de pantallas del caso de uso | Reemplazado por ADR-0005 | 2026-08-07 |
| [0003](#adr-0003-zona-de-escritura-compartida-dentro-de-la-bóveda) | Zona de escritura compartida dentro de la bóveda | Reemplazado por ADR-0005 | 2026-08-07 |
| [0004](#adr-0004-arranque-normalizado-y-ciclo-de-vida-con-aprobación-del-usuario) | Arranque normalizado y ciclo de vida con aprobación del usuario | Reemplazado por ADR-0005 | 2026-08-07 |
| [0005](#adr-0005-reformulación-a-buenas-prácticas-y-subagentes-ligeros) | Reformulación a buenas prácticas y subagentes ligeros | Aceptado | 2026-08-15 |

---

## ADR-0002: Separar la especificación de pantallas del caso de uso

- **Estado:** Reemplazado por ADR-0005 (la maquinaria de roles se retira a `archivo/`)
- **Fecha:** 2026-08-07
- **Decisores:** Tech Lead
- **Relacionado:** `archivo/09_AI/Screen_Architect.md`, `archivo/09_AI/UseCase_Architect.md`, `practicas/Design.md`

### Contexto

El framework tenía un hueco entre dos documentos que nunca se tocaban:

- `archivo/09_AI/UseCase_Architect.md` describe el negocio y es deliberadamente **agnóstico de tecnología** (su guardrail de "independencia tecnológica" prohíbe nombrar métodos, tablas o controles). No dice qué pantallas existen.
- `Design.md` fija **cómo debe comportarse** una pantalla (shell, anti-doble-click, cinco estados), pero no ofrece ningún formato para **declararlo**.

Consecuencia: un agente podía planificar un proyecto entero sin declarar nunca qué pantallas existen ni qué hace cada control. Las reglas `Mandatory` de UI quedaban sin evidencia verificable — se cumplían o no, y nadie podía comprobarlo antes de implementar.

### Decisión

Crearemos un **rol separado**, el Arquitecto de Pantallas (`archivo/09_AI/Screen_Architect.md`, skill `/screens`), que consume la matriz de casos de uso y produce fichas `SCR-<MODULO>-<NNN>` con siete secciones obligatorias, entre ellas un **inventario exhaustivo de acciones con una fila por control** y los **cinco estados declarados uno a uno**.

Se ubica en `archivo/09_AI/` —no en `practicas/`— porque es un **rol de agente con formato de salida canónico**, el mismo patrón que `archivo/09_AI/UseCase_Architect.md`. `practicas/` contiene reglas de diseño, no roles.

### Alternativas consideradas

- **Extender `/usecases` con una quinta sección de pantallas.** Menos archivos y un solo skill. Descartada: rompe la "independencia tecnológica" que es un guardrail explícito del rol, y engorda los casos de uso mezclando negocio con interfaz.
- **Una política en `practicas/Screen_Specification.md` sin rol ni skill.** Más ligera. Descartada: ningún agente la ejecutaría automáticamente; dependería de que alguien la leyera y la aplicara a mano, que es justo lo que falla hoy.

### Consecuencias

- (+) Las reglas `Mandatory` de UI pasan a tener **evidencia verificable**: la ficha `SCR-*` demuestra que se cumplen antes de escribir código.
- (+) Cada fila del inventario de acciones deriva un escenario E2E — el contrato de cobertura de UI queda explícito.
- (+) El caso de uso conserva intacta su independencia tecnológica.
- (−) Un artefacto más que mantener por pantalla, y un paso más antes de implementar.
- (−) Riesgo de fichas obsoletas si la UI cambia sin actualizarlas. Mitigación: el flujo obliga a implementar *contra la ficha*, y la Modalidad B permite regenerarla por ingeniería inversa.
- **Impacto en:** `Agent_Workflow.md` (fases 3, 6, 8), `UseCase_Architect.md`, `Design.md`, `AI_START_HERE.md`.
- **Reversibilidad:** alta. El rol es aditivo; retirarlo no rompe nada existente.

---

## ADR-0003: Zona de escritura compartida dentro de la bóveda

- **Estado:** Reemplazado por ADR-0005 (el registro de implementación se sustituye por el registro de actividad ligero)
- **Fecha:** 2026-08-07
- **Decisores:** Tech Lead
- **Relacionado:** `archivo/07_Documentation/Implementation_Log_Standard.md`, `archivo/09_AI/Project_Manager.md`, `gobernanza/Forbidden_Actions.md`, `gobernanza/Obsidian_Vault_Standard.md`

### Contexto

El modelo de trabajo real es **multi-agente y asincrónico**: distintas herramientas (OpenCode, Codex, Whale, Claude Code) intervienen sobre la misma meta **sin conocerse entre sí**, cada una con sus propios sub-agentes especializados. Necesitan relevarse: uno deja el trabajo en un punto y otro lo recoge.

Eso exige un registro compartido donde todos escriban. Pero el framework tiene una regla `mandatory` que lo impide: la bóveda (`docs/`) la escribe **solo el Experto Obsidian**. Y esa regla es un pilar — mantiene la coherencia de la fuente de verdad.

Además, exigir que cada agente "entregue al Experto" no es viable con agentes desconocidos: no comparten proceso ni saben invocarlo.

### Decisión

Crearemos `docs/07_Implementacion/` como **zona de escritura compartida**: la **única excepción** a la regla del único escritor. Todos los agentes escriben ahí; el resto de la bóveda sigue siendo exclusiva del Experto.

El mecanismo del relevo es el **`sub_estado`** de cada tarea, de vocabulario cerrado: el estado decide qué rol entra después. Nadie asigna trabajo a nadie. Las bitácoras son **append-only** con timestamp al segundo y **dos identidades obligatorias** (`agente_app` y `rol_experto`), porque una herramienta trae varios expertos.

La excepción se declara en `Forbidden_Actions.md`, `Obsidian_Vault_Standard.md` y **`AI_START_HERE.md`** — este último porque es el único archivo que un agente desconocido lee con seguridad.

### Alternativas consideradas

- **`.agentwork/` fuera de `docs/`, hermana de la bóveda.** No tocaba ninguna regla `mandatory` y separaba estado operativo de conocimiento curado. Descartada: fragmenta la documentación del proyecto en dos árboles, obliga a los agentes a conocer una segunda convención, y el registro de implementación **sí es documentación del proyecto** — pertenece a la bóveda, no a un directorio de trabajo.
- **Que los agentes entreguen al Experto y él escriba el log.** Preservaba la regla intacta. Descartada: inviable con agentes desconocidos que no comparten proceso; y convierte al Experto en cuello de botella de un flujo que debe ser asincrónico.
- **Buzón `.inbox/` que el Experto consume.** Mismo problema, con latencia añadida: el relevo dejaría de ser inmediato.

### Consecuencias

- (+) Agentes que no se conocen pueden relevarse leyendo un solo archivo autocontenido (`PROTOCOLO.md`).
- (+) Trazabilidad total: quién (herramienta **y** especialidad), cuándo (al segundo), qué resultado.
- (+) El ciclo circular dev → test → debug → dev queda explícito y contable (`iteracion`).
- (+) El `mapper` solo documenta código que ya pasa pruebas — se elimina el mapeo sobre código roto.
- (−) **La regla `mandatory` del único escritor deja de ser absoluta.** Es el coste real de esta decisión. Mitigación: la excepción es **una sola carpeta**, está declarada en los tres archivos que un agente lee, y dentro de ella `00_TABLERO.md` mantiene su propio escritor único (el PM).
- (−) Riesgo de que la zona se use como documentación curada. Mitigación: anti-patrón explícito; el Experto **destila** lo que debe perdurar hacia `01_`–`06_` y la meta se archiva.
- (−) Un rol más (Project Manager) y dos skills más que instalar por proyecto.
- **Impacto en:** `Forbidden_Actions.md` (regla + 8 prohibiciones nuevas), `Obsidian_Vault_Standard.md` (dos zonas con dueños distintos), `AI_START_HERE.md`, `Agent_Workflow.md` (fases 1b y 11), `Documentation_Expert.md` (destilador).
- **Reversibilidad:** media. Retirar la zona exige reescribir la regla en tres archivos y decidir qué pasa con los registros históricos. La decisión es estructural, no local.

---

## ADR-0004: Arranque normalizado y ciclo de vida con aprobación del usuario

- **Estado:** Reemplazado por ADR-0005 (el arranque pasa a la asistencia inicial interactiva)
- **Fecha:** 2026-08-07
- **Decisores:** Tech Lead
- **Relacionado:** `archivo/09_AI/Agent_Onboarding_Standard.md`, `archivo/09_AI/Agent_Roles_And_Lifecycle.md`, `archivo/Templates/INIT_Template.md`, `archivo/Templates/Init_Skill_Template/`

### Contexto

Con los roles, el registro compartido y el descubrimiento dinámico ya definidos, quedaban dos huecos que impedían usar el framework de principio a fin:

1. **Nadie normalizaba el arranque.** Cada herramienta improvisaba: unas leían media bóveda y agotaban su contexto antes de empezar, otras entraban a codificar sin saber qué estaba fuera de alcance.
2. **Nada convertía la intención del usuario en trabajo ejecutable.** Existían `docs/00_Proyecto/` y el registro de tareas, pero ningún rol ni procedimiento llevaba de *"quiero construir X"* a metas y tareas. El framework describía cómo ejecutar un plan que nadie sabía producir.

Había además una ambigüedad heredada: los estados de meta (`VALIDADA`, `CERRADA`) se usaban sin vocabulario cerrado, a diferencia de los sub-estados de tarea.

### Decisión

Normalizaremos el arranque con **`INIT.md`** —cinco pasos ejecutables: identificarse, localizar el estándar, cargar el conocimiento obligatorio, mapear el proyecto y actuar— y añadiremos el rol **`initiator`** con su skill **`/init-project`**, que entrevista al usuario y produce el árbol visión → metas → tareas.

El ciclo de vida completo queda escrito en `Agent_Roles_And_Lifecycle.md`, con dos garantías duras:

- **No se escribe código hasta que el usuario aprueba el árbol completo**, validando e iterando en cada nivel.
- **Una meta no se cierra sola.** Ni el `pm` ni el `validator` pueden declararla lograda: solo el usuario, contra los criterios que él mismo aprobó al inicio.

Se cierra además el vocabulario de estados de meta: `PLANIFICANDO` → `ACTIVA` → `EN_VALIDACION` → `VALIDADA` → `CERRADA`, con retorno a `ACTIVA` si el `validator` falla o el usuario rechaza.

### Alternativas consideradas

- **Dejar el arranque a criterio de cada herramienta.** Menos artefactos. Descartada: es justo lo que producía el problema — sin procedimiento común, el coste de contexto y la calidad del arranque dependían de qué agente llegara.
- **Un solo archivo de arranque, sin `/init-project`.** El agente improvisaría la entrevista. Descartada: capturar intención es un procedimiento con entregables concretos y criterios de completitud (el "qué NO es", el "fuera de alcance"); sin skill se omiten justo esas secciones, que son las que evitan construir de más.
- **Cierre automático de metas cuando el registro lo permita.** Más ágil. Descartada: nadie verificaría contra la intención original, y el framework existe precisamente para que lo construido corresponda a lo pedido.
- **`ONBOARDING.md` como único arranque.** Ya existía, pero es explicativo. Se mantiene como referencia opcional; `INIT.md` lo sustituye como ejecutable porque un agente necesita pasos, no razones.

### Consecuencias

- (+) El arranque es **idéntico** para cualquier herramienta: mismo coste de contexto, misma calidad de partida.
- (+) La intención del usuario queda capturada con **criterios de completitud verificables** (el "qué NO es" y el "fuera de alcance" son obligatorios).
- (+) El árbol visión → metas → tareas se valida por niveles: un malentendido se detecta antes de codificar, no después.
- (+) Los estados de meta dejan de ser ambiguos y el `pm` puede alertar de "aprobación pendiente".
- (−) **Más fricción antes de ver código funcionando.** Tres puntos de aprobación en la Fase 0. Es deliberado: el coste de construir lo que nadie pidió es mayor.
- (−) Un artefacto más en la raíz (`INIT.md`) y un skill más que instalar y sincronizar.
- (−) El `initiator` es un punto único de fallo al arranque: si captura mal la intención, todo lo demás hereda el error. Mitigación: los tres puntos de validación con el usuario y la marca `[SUPUESTO — confirmar]`.
- **Impacto en:** `Agent_Onboarding_Standard.md`, `Project_Manager.md` (dos alertas nuevas), `PROTOCOLO.md`, `META_Template.md`, `TABLERO_Template.md`, `Agent_Contract_Template.md`, `AGENTS_Template.md`, `Checklists/New_Project.md`.
- **Reversibilidad:** alta. Todo es aditivo; ninguna regla existente se retira ni se altera. Por eso es **MINOR**, no MAJOR.

## ADR-0005: Reformulación a buenas prácticas y subagentes ligeros

- **Estado:** Aceptado
- **Fecha:** 2026-08-15
- **Decisores:** Humano
- **Relacionado:** `gobernanza/Subagents.md`, `gobernanza/Agent_Workflow.md`, `gobernanza/Forbidden_Actions.md`, `gobernanza/Activity_Tracking.md`, `gobernanza/Project_Start.md`

### Contexto

Tras ADR-0002/0003/0004, el framework acumulaba maquinaria pesada: roles con ciclo de vida y sub-estados, estados unificados, registro de implementación con dos identidades por fila, arquitectos de casos de uso y de pantallas con fichas `SCR-*`, un PM, un Experto Obsidian y el MCP de bóveda. En uso real se percibió **inaplicable**: acotaba demasiado a los agentes, no daba información suficiente, complicaba el trabajo en segundo plano y no acompañaba al usuario en el arranque del proyecto.

### Decisión

Reformulamos el framework como **buenas prácticas, gobernanza mínima**:

1. **Coordinador delgado + 6 subagentes** (`gobernanza/Subagents.md`): `doc-mapper` (documentación, modelo pensante), `doc-reader` (lectura, barato), `dev-backend` y `dev-frontend` (capaces), `tester` (barato) y `activity-manager` (registro, barato). Cada subagente con **contexto aislado** y **modelo distinto** para ahorro de tokens.
2. **Reglas duras reducidas a 6** (`gobernanza/Forbidden_Actions.md`) y **3 puntos de aprobación** (`gobernanza/Agent_Workflow.md`). Todo lo demás es criterio del agente.
3. **Registro de actividad ligero** (`gobernanza/Activity_Tracking.md`): una tabla `META | TAREA | ESTADO | FECHA_INI | FECHA_FIN`, append-only, que sustituye al registro de implementación con sub-estados.
4. **Asistencia inicial interactiva** (`gobernanza/Project_Start.md`): el agente principal entrevista al usuario y produce `VISION`/`ALCANCE`/`CONTEXTO_GLOBAL` + la primera `ACTIVIDAD.md`.
5. La documentación pesada se retira a `archivo/` como **referencia**; la bóveda la escribe `doc-mapper`, no un skill `/obsidian`.
6. Los subagentes se describen de forma **agnóstica** en el repo (plantillas `Templates/Subagent_Template.md`, `Templates/AGENT_CONFIG_Template.md`) para que cada herramienta los replique en su propio entorno.

### Alternativas consideradas

- **Conservar la maquinaria y solo afinarla.** Descartada: el problema era estructural (sobre-acotación y coste de contexto), no de detalle.
- **Eliminar toda gobernanza.** Descartada: el usuario quiere mejores prácticas y trazabilidad mínima, no ausencia de reglas.
- **Configurar opencode/Claude directamente en este repo.** Descartada: este repositorio es el framework, no el entorno; la configuración real del entorno se decide después.

### Consecuencias

- (+) Framework aplicable de inmediato por cualquier herramienta; el agente acompaña al usuario desde el arranque.
- (+) Menor coste de contexto: modelos baratos para lectura/pruebas, pensante solo para documentación.
- (+) Trazabilidad suficiente con una tabla ligera, sin vocabulario de sub-estados.
- (−) **MAJOR**: retira políticas `mandatory`/`standard` existentes (único escritor absoluto, ciclo de vida de roles, registro de implementación). Por eso es MAJOR, no MINOR.
- (−) Se pierde el mapeo formal de casos de uso/pantallas; la especificación pasa a vivir en la documentación curada de la bóveda.
- **Impacto en:** `AI_START_HERE.md`, `gobernanza/` (Subagents, Agent_Workflow, Forbidden_Actions, Agent_Contract_Standard), `gobernanza/` (Policy_Index, Project_Context_Standard, Project_Start), `gobernanza/` (Activity_Tracking, Obsidian_Vault_Standard, User_Manual_Standard, ADR), `Templates/`, `README.md`, `INDEX.md`.
- **Reversibilidad:** media-alta. La maquinaria retirada vive en `archivo/` y puede restaurarse si se decide lo contrario.

## Relación con el proceso de excepciones
Las excepciones a reglas `standard` se documentan como ADR (ver [`Exceptions_Process.md`](Exceptions_Process.md)).

## Anti-patrones
- ❌ Tomar decisiones estructurales sin registrarlas.
- ❌ Reescribir un ADR aceptado en vez de superseder.
- ❌ ADRs sin sección de consecuencias (lo más valioso).
- ❌ Usar ADR para decisiones triviales (ruido).

## Relacionado
- [`Obsidian_Vault_Standard.md`](Obsidian_Vault_Standard.md), [`../GOVERNANCE.md`](../GOVERNANCE.md), [`Exceptions_Process.md`](Exceptions_Process.md)
