# Changelog del Framework

Todas las modificaciones notables del framework de gobernanza se registran aquí.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es/1.1.0/) y el versionado sigue [SemVer](https://semver.org/lang/es/):

- **MAJOR**: cambio incompatible en una política `mandatory`/`standard` (rompe proyectos existentes).
- **MINOR**: nueva política o documento compatible.
- **PATCH**: correcciones, aclaraciones, ejemplos.

Cada entrada relevante debe enlazar al ADR que la motivó (ver [`gobernanza/ADR.md`](gobernanza/ADR.md)).

> **Regla ADR ⇒ MAJOR:** todo cambio que exija un ADR **y altere o retire una regla existente** es MAJOR. Añadir una política nueva sin tocar las existentes es MINOR. Así el proceso de decisión queda atado al versionado: si rompió, la versión lo dice. Ver [`gobernanza/Framework_Access_Standard.md`](gobernanza/Framework_Access_Standard.md).
>
> Cada release publica un **tag** (`v1.0.0`); los proyectos se anclan a un tag, nunca a `main`. Un MAJOR debe acompañarse de `MIGRATION.md`.

---

## [1.0.0] - 2026-08-15

### Changed (MAJOR)
- **Reformulación del framework como "buenas prácticas con gobernanza mínima".** Objetivo: obtener las mejores prácticas **sin acotar demasiado** a los agentes. Cambios estructurales:
  - **6 subagentes de scope definido** reemplazan la maquinaria de 10 roles: `doc-mapper` (documentación + mapeo, modelo **pensante**), `doc-reader` (lectura, **barato**), `dev-backend` y `dev-frontend` (código, capaz), `tester` (**barato**), `activity-manager` (META/TAREA/ESTADO/FECHA_INI/FECHA_FIN, **barato**). Nuevo `gobernanza/Subagents.md`; los 6 tienen **contexto aislado** (no consumen el contexto del agente principal) y **modelo por perfil** (barato para leer/probar/registrar; capaz solo para escribir).
  - **Modo cavernícola + idioma del usuario:** razonamiento interno mínimo (solo conclusiones) y respuesta siempre en el idioma en que se pregunta. Aplica a todos los agentes y subagentes.
  - **Solo 6 reglas duras** (`gobernanza/Forbidden_Actions.md` reescrito): secretos, acciones destructivas, tests en rojo, módulos protegidos, no inventar tareas, documentar lo cambiado. El resto queda como orientación.
  - **Solo 3 puntos de aprobación humana:** plan inicial, acción irreversible/destructiva, módulo protegido. En segundo plano, el agente avanza con criterio marcando `[SUPUESTO — confirmar]`.
  - **Asistencia inicial interactiva** (`gobernanza/Project_Start.md`): arranque guiado visión → alcance → metas → tareas, una pregunta a la vez con opciones, en el idioma del usuario. Sustituye a `INIT.md`/`ONBOARDING.md`.
  - **Registro ligero** (`gobernanza/Activity_Tracking.md`): tabla `META | TAREA | ESTADO | FECHA_INI | FECHA_FIN`, sin bitácora doble ni tablero Mermaid. Sustituye al registro de implementación.
  - **Plantillas actualizadas:** `Templates/Agent_Contract_Template.md`, `Templates/AGENT_CONFIG_Template.md` (campos `subagentes`, `idioma_respuesta`, `modelos` por perfil, `modo_cavernicola`) y nueva `Templates/Subagent_Template.md`. Ejemplo en `Examples/subagents_example.md`.
  - **Documentación pesada retirada a `archivo/`** (consulta, no activa): `Unified_States_Standard`, `Agent_Roles_And_Lifecycle`, `Agent_Onboarding_Standard`, `UseCase_Architect`, `Screen_Architect`, `Documentation_Expert`, `Project_Manager`, `Codebase_And_Vault_MCP`, `Preloaded_Agent_Roles`, `Agent_Configuration_Pattern`, `Implementation_Log_Standard` y los skill templates `/init-project`, `/usecases`, `/screens`, `/obsidian`, `/board`.
  - `AI_START_HERE.md` reescrito autocontenido; `README.md` e `INDEX.md` actualizados.
  - Motivado por [ADR-0005](gobernanza/ADR.md#adr-0005-reformulación-a-buenas-prácticas-y-subagentes-ligeros).
  - **Migración:** ver [`MIGRATION.md`](MIGRATION.md).

### Added
- **`doc-reader` responde "flujos" sin releer código** gracias al **mapa conceptos ↔ código** (`docs/03_Tecnico/Mapa_Conceptos_Codigo.md`, plantilla nueva `Templates/Mapa_Conceptos_Template.md`). El `doc-mapper` lo escribe y mantiene relacionando conceptos, componentes y flujos con archivos reales (`archivo:línea`). Así preguntas como "si quiero crear un cliente, ¿qué flujo es?" o "¿qué archivos o componentes intervienen al guardar imágenes?" se responden con modelo **barato**. Actualizados `gobernanza/Obsidian_Vault_Standard.md`, `gobernanza/Subagents.md`, `Templates/Obsidian_Note_Template.md`, `Examples/Vault_Structure_Example.md`, `Examples/subagents_example.md`, `AI_START_HERE.md`, `README.md`, `INDEX.md` y `Checklists/New_Project.md`.
- **`Project_Start.md`: texto libre (modo avanzado) en la entrevista interactiva.** Las opciones son una ayuda, no una camisa de fuerza: el usuario avanzado responde en texto libre en cualquier bloque y esa respuesta tiene prioridad (parcial o total). Comportamiento compatible (aditivo, sin tocar reglas existentes).
- **Acceso, contexto, contrato y configuración por agente**: cuatro piezas que resuelven cómo se **localiza**, se **versiona** y se **arranca** un proyecto gobernado.
  - `gobernanza/Framework_Access_Standard.md` (`mandatory`) + marcador `.governance-root` en la raíz: **la ruta del framework deja de estar hardcodeada**. Se declara una vez en `governance_path` (frontmatter de `AGENTS.md`) y, si falta, se descubre buscando hacia arriba una carpeta con `.governance-root`. Soporta submódulo, copia, framework hermano compartido y paquete npm sin cambiar una regla. Fija el **submódulo Git anclado a un tag** como modo recomendado y la regla **ADR ⇒ MAJOR**: un ADR que altera o retira una regla existente implica versión mayor; añadir una política nueva es MINOR.
  - `gobernanza/Project_Context_Standard.md` (`mandatory`): **`AGENTS.md` como punto de entrada** único y agnóstico de herramienta; `CLAUDE.md`, `.cursorrules` y `copilot-instructions.md` pasan a ser punteros de una línea (una fuente, cero divergencia). Crea `docs/00_Proyecto/` — **la intención del proyecto** — con tres archivos de ritmos distintos: `VISION.md` (por qué existe y qué **no** es), `ALCANCE.md` (qué entra y qué queda **explícitamente** fuera) y `CONTEXTO_GLOBAL.md` (estado vivo). Se rellenan **entrevistando al usuario**, no inventando.
  - `gobernanza/Agent_Contract_Standard.md` (`standard`): `.<agente>/AGENT_CONTEXT.md`, un archivo por herramienta que declara su `agente_app`, sus `subagentes` y su `idioma_respuesta`. Es lo que hace **operativa** la trazabilidad del registro: sin contrato, cada agente se nombra a su manera.
  - Configuración local `.<herramienta>/AGENT_CONFIG.md` (modelos por perfil barato/capaz/pensante y subagentes ejecutables) desde `Templates/AGENT_CONFIG_Template.md`. Los subagentes del catálogo se **replican por copia** en cada herramienta (no se enlazan); se re-copian al migrar el framework.
  - Plantillas: `Templates/AGENTS_Template.md`, `Templates/Agent_Contract_Template.md`, `Templates/Subagent_Template.md`, `Templates/Project_Context_Template/`.
- **Estándares de Git/GitHub**: nuevo `practicas/Git_GitHub_Standards.md` (branching trunk-based/GitHub Flow, Conventional Commits, PRs, merge squash + historia lineal, protección de ramas, CODEOWNERS atado a módulos protegidos, releases SemVer, higiene/seguridad y reglas de Git para agentes IA) + plantillas reales en `Templates/github/` (`workflows/ci.yml`, `CODEOWNERS`, `dependabot.yml`, `branch-protection.md`, issue templates, `README.md`). Integrado en `Naming_Conventions.md`, `CI_CD.md`, `Policy_Index.md`, `Checklists/New_Project.md` y `Checklists/Release.md`.
- `INDEX.md`: índice maestro navegable de **todo** el repositorio (cada archivo con descripción y enlace). Custodiado por `doc-mapper`. `README.md` ampliado con sección "Cómo usar todo esto" y puntero al índice.
- `Templates/CLAUDE_Template.md`: plantilla del `CLAUDE.md` que vive en la raíz de cada proyecto y redirige al framework. Enlazada desde `Checklists/New_Project.md` y `AI_START_HERE.md`.
- **`Project_Start.md` extendido a entorno + agentes + diagramas**: la asistencia inicial interactiva ahora además de orientar visión/alcance/metas/tareas prepara el **ambiente de desarrollo** (Bloque 5), configura los **agentes con frontmatter** (Bloque 6: `AGENT_CONTEXT.md`/`AGENT_CONFIG.md`, con `skills` **solo si existen en el proyecto**, nunca del framework) y genera **diagramas Mermaid de la intención** (Bloque 7) en `docs/00_Proyecto/DIAGRAMAS.md`. `AGENT_CONFIG_Template.md` gana el campo opcional `skills`; `Agent_Contract_Template.md` declara los skills invocables. Comportamiento compatible (aditivo, sin tocar reglas existentes).

### Changed
- **`Templates/CLAUDE_Template.md`: de punto de entrada a puntero.** Hardcodeaba `.governance/ai-software-governance/…` cuatro veces — una ruta que solo funcionaba con esa disposición exacta y fallaba con submódulo directo, copia en otra ubicación o framework compartido. Ahora `CLAUDE.md` es una línea que redirige a `AGENTS.md`, y la ruta se declara/descubre.
- `gobernanza/Obsidian_Vault_Standard.md`: `00_Proyecto/` entra en la estructura obligatoria del vault (zona curada), vault dinámico, `.obsidian/` en la estructura y **`doc-mapper` como escritor único** de la zona curada (`docs/07_Implementacion/` es la excepción compartida).
- `AI_START_HERE.md`: nuevo **orden de lectura de 5 pasos** y qué hacer si no se encuentra el framework (detenerse y preguntar, nunca improvisar).
- `gobernanza/ADR.md` y `CHANGELOG.md`: se explicita la relación **ADR ⇒ MAJOR** y el anclaje por tag.
- **Reglas de UI/UX e interacción (Mandatory inline)** repartidas en documentos existentes: `Select` siempre searchable y validación por tipo en cada control (`practicas/Design.md`); CRUD/reporte en página completa —no modal—, toda página dentro del shell, anti-doble-click y overlay de procesamiento en menú (`practicas/Design.md`); pantalla invocable que retorna datos al llamante y anti-doble-click técnico (`practicas/Component_Architecture.md`); revalidar el estado de servidor al retornar de una pantalla invocada (`practicas/State_Management.md`). Nota de refuerzo en `practicas/Validation.md` (la validación de UI no sustituye a la del servidor) y aclaración en `gobernanza/Policy_Index.md`.
- `Tools/README.md`, `practicas/CI_CD.md`: los scripts `.py` pasan a **opcional/legado**; el flujo principal de documentación es Markdown vía `doc-mapper`.

---

## [0.1.0] - 2026-06-18

### Added
- Estructura inicial completa del framework (áreas 00–09, Templates, Checklists, Examples, Tools).
- Documentos pilares: `AI_START_HERE.md`, `GOVERNANCE.md`, estrategia de seeds, módulos protegidos, estándar de bóveda Obsidian, manual de usuario.
- Plantillas: módulo, entidad, seed, nota Obsidian, ADR, manual de usuario, MODULE.yaml.
- Checklists: nuevo proyecto, nuevo módulo, nueva entidad, modificación, release, revisión de PR.
- Ejemplos: `.aicodeprotect.yml`, `MODULE.yaml`, seeds dev/test, estructura de bóveda.
- Scripts de referencia en `Tools/` (verificación de enlaces, generación de manual).

### Notas
- Versión fundacional. Aún sin uso en producción; las firmas de scripts en `Tools/` son de referencia y deben adaptarse al stack de cada proyecto.
