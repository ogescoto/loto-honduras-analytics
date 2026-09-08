# Índice Maestro del Framework

> Mapa navegable de **todo** el repositorio: cada archivo con una línea de qué es y su enlace.
> Si buscas algo y no sabes dónde está, **empieza aquí**.
>
> - ¿Eres **humano** y adoptas el framework? → [`README.md`](README.md)
> - ¿Eres un **agente** que va a trabajar? → [`AI_START_HERE.md`](AI_START_HERE.md)
> - ¿Buscas el **catálogo de subagentes**? → [`gobernanza/Subagents.md`](gobernanza/Subagents.md)
>
> Mantenimiento: este índice se actualiza al añadir, mover o eliminar archivos del framework.

---

## Raíz

| Archivo | Qué es |
|---|---|
| [`README.md`](README.md) | Presentación: qué es, filosofía, los 6 subagentes, cómo usarlo. |
| [`AI_START_HERE.md`](AI_START_HERE.md) | Punto de entrada **obligatorio para agentes**, autocontenido. |
| [`GOVERNANCE.md`](GOVERNANCE.md) | Filosofía, principios, obligatoriedad y evolución (ADR). |
| [`GLOSSARY.md`](GLOSSARY.md) | Lenguaje ubicuo. |
| [`CHANGELOG.md`](CHANGELOG.md) | Historial de cambios (SemVer). |
| [`MIGRATION.md`](MIGRATION.md) | Guía de migración a v1.0.0 (MAJOR). |
| [`INDEX.md`](INDEX.md) | Este índice maestro. |

## gobernanza/ — Gobernanza

| Archivo | Nivel | Qué es |
|---|---|---|
| [`gobernanza/Project_Start.md`](gobernanza/Project_Start.md) | standard | **Asistencia inicial interactiva**: orienta lo que se quiere (visión → alcance → metas), prepara el ambiente y configura los agentes con frontmatter + skills del proyecto; produce diagramas Mermaid. Soporta **texto libre** (modo avanzado) junto a las opciones. |
| [`gobernanza/Policy_Index.md`](gobernanza/Policy_Index.md) | mandatory | Índice canónico de políticas por área y obligatoriedad. |
| [`gobernanza/Framework_Access_Standard.md`](gobernanza/Framework_Access_Standard.md) | mandatory | Cómo el agente localiza el framework (`.governance-root`) y ancla la versión. |
| [`gobernanza/Project_Context_Standard.md`](gobernanza/Project_Context_Standard.md) | mandatory | `AGENTS.md` como punto de entrada y `docs/00_Proyecto/`. |
| [`gobernanza/Exceptions_Process.md`](gobernanza/Exceptions_Process.md) | standard | Cómo desviarse de una política de forma aprobada y registrada. |
| [`gobernanza/Activity_Tracking.md`](gobernanza/Activity_Tracking.md) | standard | **Registro ligero**: tabla `META | TAREA | ESTADO | FECHA_INI | FECHA_FIN`. |
| [`gobernanza/Obsidian_Vault_Standard.md`](gobernanza/Obsidian_Vault_Standard.md) | mandatory | La bóveda como fuente de verdad + **mapa conceptos ↔ código** (`03_Tecnico/`). |
| [`gobernanza/User_Manual_Standard.md`](gobernanza/User_Manual_Standard.md) | standard | Manual de usuario desde E2E anotados. |
| [`gobernanza/ADR.md`](gobernanza/ADR.md) | standard | Registro de decisiones de arquitectura. |
| [`gobernanza/Subagents.md`](gobernanza/Subagents.md) | standard | **Catálogo de 6 subagentes**: scope, modelo por perfil, idioma, contexto aislado. `doc-mapper` mantiene el mapa conceptos ↔ código; `doc-reader` responde flujos desde él. |
| [`gobernanza/Agent_Workflow.md`](gobernanza/Agent_Workflow.md) | standard | Ciclo de 8 pasos del coordinador delgado + cómo se formulan tareas y responde el agente. |
| [`gobernanza/Forbidden_Actions.md`](gobernanza/Forbidden_Actions.md) | mandatory | **Las 6 reglas duras**. |
| [`gobernanza/Protected_Modules.md`](gobernanza/Protected_Modules.md) | mandatory | Zonas de código que la IA no toca sin aprobación (`.aicodeprotect.yml`). |
| [`gobernanza/Agent_Contract_Standard.md`](gobernanza/Agent_Contract_Standard.md) | standard | Contrato `.<agente>/AGENT_CONTEXT.md`: identidad y capacidades. |

## practicas/ — Prácticas por capa

| Archivo | Nivel | Qué es |
|---|---|---|
| [`practicas/Module_Organization.md`](practicas/Module_Organization.md) | standard | Estructura interna de un módulo y su `MODULE.yaml`. |
| [`practicas/Global_Utilities.md`](practicas/Global_Utilities.md) | mandatory | Código compartido entre módulos (impacto, deprecación). |
| [`practicas/Naming_Conventions.md`](practicas/Naming_Conventions.md) | standard | Cómo nombrar clases, funciones, archivos, ramas, commits, tablas y columnas. |
| [`practicas/Dependency_Rules.md`](practicas/Dependency_Rules.md) | mandatory | Dirección de dependencias, sin ciclos. |
| [`practicas/Design.md`](practicas/Design.md) | guideline | Principios de diseño, tokens y componentes reutilizables; los 5 estados de toda vista. |
| [`practicas/Accessibility.md`](practicas/Accessibility.md) | standard | Accesibilidad WCAG 2.1 AA. |
| [`practicas/Seeds_Strategy.md`](practicas/Seeds_Strategy.md) | mandatory | Seeds de producción / desarrollo / test. |
| [`practicas/Migrations.md`](practicas/Migrations.md) | standard | Migraciones versionadas y reversibles. |
| [`practicas/Data_Modeling.md`](practicas/Data_Modeling.md) | guideline | Guía de modelado. |
| [`practicas/API_Design.md`](practicas/API_Design.md) | standard | Diseño REST. |
| [`practicas/Error_Handling.md`](practicas/Error_Handling.md) | mandatory | Taxonomía de errores y formato estándar. |
| [`practicas/Validation.md`](practicas/Validation.md) | mandatory | Validación de forma y de negocio. |
| [`practicas/Security.md`](practicas/Security.md) | mandatory | Mínimos de seguridad. |
| [`practicas/Component_Architecture.md`](practicas/Component_Architecture.md) | standard | Componentes pequeños; separar lógica de vista. |
| [`practicas/State_Management.md`](practicas/State_Management.md) | guideline | Clasificar el estado y elegir herramienta. |
| [`practicas/Performance.md`](practicas/Performance.md) | standard | Core Web Vitals y performance. |
| [`practicas/Testing_Strategy.md`](practicas/Testing_Strategy.md) | mandatory | Pirámide de tests y cuáles son obligatorios. |
| [`practicas/E2E_Standards.md`](practicas/E2E_Standards.md) | standard | Pruebas E2E y anotaciones `@manual-step`. |
| [`practicas/Coverage_Requirements.md`](practicas/Coverage_Requirements.md) | standard | Umbrales de cobertura. |
| [`practicas/Environments.md`](practicas/Environments.md) | mandatory | Entornos y comandos canónicos reproducibles. |
| [`practicas/CI_CD.md`](practicas/CI_CD.md) | standard | Pipeline y gates de calidad. |
| [`practicas/Git_GitHub_Standards.md`](practicas/Git_GitHub_Standards.md) | standard | Flujo Git/GitHub: trunk-based, PRs, releases. |
| [`practicas/Deployment.md`](practicas/Deployment.md) | standard | Despliegue reversible y gradual. |
| [`practicas/Secrets_Management.md`](practicas/Secrets_Management.md) | mandatory | Cero secretos en el repo. |

## Templates — Plantillas

| Archivo | Qué es |
|---|---|
| [`Templates/Subagent_Template.md`](Templates/Subagent_Template.md) | **Ficha de subagente**: scope, modelo, idioma, contexto aislado. |
| [`Templates/AGENT_CONFIG_Template.md`](Templates/AGENT_CONFIG_Template.md) | Configuración local del agente (subagentes + modelos por perfil). |
| [`Templates/Agent_Contract_Template.md`](Templates/Agent_Contract_Template.md) | `.<agente>/AGENT_CONTEXT.md`: identidad, subagentes, límites. |
| [`Templates/AGENTS_Template.md`](Templates/AGENTS_Template.md) | Punto de entrada único del proyecto. |
| [`Templates/CLAUDE_Template.md`](Templates/CLAUDE_Template.md) | `CLAUDE.md` como puntero a `AGENTS.md`. |
| [`Templates/Module_Template.md`](Templates/Module_Template.md) | Plantilla de módulo y `MODULE.yaml`. |
| [`Templates/Entity_Template.md`](Templates/Entity_Template.md) | Plantilla de entidad de dominio. |
| [`Templates/Obsidian_Note_Template.md`](Templates/Obsidian_Note_Template.md) | Nota de módulo/entidad para la bóveda (con código relacionado). |
| [`Templates/Mapa_Conceptos_Template.md`](Templates/Mapa_Conceptos_Template.md) | Mapa conceptos ↔ código: conceptos/componentes/flujos → archivos reales. |
| [`Templates/Seed_Template.sql`](Templates/Seed_Template.sql) | Plantilla de seeds de desarrollo y test. |
| [`Templates/ADR_Template.md`](Templates/ADR_Template.md) | Registro de decisión de arquitectura. |
| [`Templates/User_Manual_Template.md`](Templates/User_Manual_Template.md) | Estructura base del manual. |
| [`Templates/Pull_Request_Template.md`](Templates/Pull_Request_Template.md) | Plantilla de PR con Definition of Done. |
| [`Templates/Project_Context_Template/`](Templates/Project_Context_Template/) | `VISION.md`, `ALCANCE.md`, `CONTEXTO_GLOBAL.md`. |
| [`Templates/github/`](Templates/github/) | CI, CODEOWNERS, dependabot, branch protection, issues. |
| [`Templates/mcp/`](Templates/mcp/) | Config MCP de código y bóveda. |

## Checklists — Listas de verificación

| Archivo | Qué es |
|---|---|
| [`Checklists/New_Project.md`](Checklists/New_Project.md) | Incorporar el framework a un proyecto. |
| [`Checklists/New_Module.md`](Checklists/New_Module.md) | Crear un módulo. |
| [`Checklists/New_Entity.md`](Checklists/New_Entity.md) | Crear una entidad (con seeds). |
| [`Checklists/Modify_Existing.md`](Checklists/Modify_Existing.md) | Modificar código existente con seguridad. |
| [`Checklists/Release.md`](Checklists/Release.md) | Antes de etiquetar una versión. |
| [`Checklists/PR_Review.md`](Checklists/PR_Review.md) | Revisión de un pull request. |

## Examples — Ejemplos reales

| Archivo | Qué es |
|---|---|
| [`Examples/subagents_example.md`](Examples/subagents_example.md) | **Configuración de subagentes con modelos distintos** (barato/capaz/pensante). |
| [`Examples/.aicodeprotect.yml`](Examples/.aicodeprotect.yml) | Ejemplo de módulos protegidos. |
| [`Examples/MODULE.yaml`](Examples/MODULE.yaml) | Ejemplo de manifiesto de módulo. |
| [`Examples/env.example`](Examples/env.example) | Ejemplo de `.env.example`. |
| [`Examples/Vault_Structure_Example.md`](Examples/Vault_Structure_Example.md) | Ejemplo de bóveda `docs/`. |

## archivo/ — Documentación retirada (consulta, no activa)

| Archivo | Qué era |
|---|---|
| [`archivo/09_AI/`](archivo/09_AI/) | Estados unificados, roles y ciclo de vida, onboarding, arquitectos (usecases/screens), PM, experto Obsidian, preloaded roles, configuración, MCP. |
| [`archivo/07_Documentation/`](archivo/07_Documentation/) | Registro de implementación pesado (sub-estados + bitácora doble + tablero). |
| [`archivo/Templates/`](archivo/Templates/) | Skills `/init-project`, `/usecases`, `/screens`, `/obsidian`, `/board`, plantillas del log, `INIT` y `ONBOARDING`. |
| [`archivo/`](archivo/) | También: `MANUAL.md` (guía práctica del modelo retirado) y `ESTADOS_ANALYSIS.md` (análisis del sistema de estados). |

> Se conserva por si algún equipo necesita el modelo de "relevo entre agentes desconocidos". El framework activo usa el modelo ligero de subagentes.

---

## Cómo está organizado (resumen)

```
gobernanza/     →  qué cumplir y por qué (acceso, contexto, excepciones, ADR, subagentes)
practicas/      →  mejores prácticas por capa (orientan, no mandan)
Templates       →  con qué empezar
Checklists      →  cómo cerrar cada tarea
Examples        →  cómo se ve en real
archivo/        →  lo retirado, conservado por si acaso
```
