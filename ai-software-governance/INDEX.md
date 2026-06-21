# Índice Maestro del Framework

> Mapa navegable de **todo** el repositorio: cada archivo con una línea de qué es y su enlace.
> Si buscas algo y no sabes dónde está, **empieza aquí**.
>
> - ¿Eres **humano** y adoptas el framework? → [`README.md`](README.md)
> - ¿Eres un **agente** que va a trabajar? → [`AI_START_HERE.md`](AI_START_HERE.md)
> - ¿Buscas solo las **políticas** y su obligatoriedad? → [`00_Governance/Policy_Index.md`](00_Governance/Policy_Index.md)
>
> Mantenimiento: este índice lo **custodia el Experto Obsidian** (`/obsidian`). Al añadir,
> mover o eliminar un archivo del framework, debe actualizarse aquí (ver
> [`09_AI/Documentation_Expert.md`](09_AI/Documentation_Expert.md)).

---

## Raíz

| Archivo | Qué es |
|---|---|
| [`README.md`](README.md) | Presentación para humanos: qué es, estructura, cómo incorporarlo, cómo usarlo. |
| [`AI_START_HERE.md`](AI_START_HERE.md) | Punto de entrada **obligatorio para agentes**: rutas de lectura por tarea y reglas de oro. |
| [`GOVERNANCE.md`](GOVERNANCE.md) | Filosofía, principios, roles y proceso de evolución (ADR) del framework. |
| [`GLOSSARY.md`](GLOSSARY.md) | Lenguaje ubicuo: términos con significado preciso en todo el framework. |
| [`CHANGELOG.md`](CHANGELOG.md) | Historial de cambios del framework (SemVer). |
| [`INDEX.md`](INDEX.md) | Este índice maestro. |

## 00_Governance — Gobernanza

| Archivo | Nivel | Qué es |
|---|---|---|
| [`00_Governance/Policy_Index.md`](00_Governance/Policy_Index.md) | mandatory | Índice canónico de **políticas** por área y obligatoriedad. |
| [`00_Governance/Exceptions_Process.md`](00_Governance/Exceptions_Process.md) | standard | Cómo desviarse de una política de forma aprobada y registrada. |

## 01_Architecture — Arquitectura

| Archivo | Nivel | Qué es |
|---|---|---|
| [`01_Architecture/Module_Organization.md`](01_Architecture/Module_Organization.md) | standard | Estructura interna de un módulo y su `MODULE.yaml`. |
| [`01_Architecture/Global_Utilities.md`](01_Architecture/Global_Utilities.md) | mandatory | Reglas para código compartido entre módulos (análisis de impacto, deprecación). |
| [`01_Architecture/Naming_Conventions.md`](01_Architecture/Naming_Conventions.md) | standard | Cómo nombrar clases, funciones, archivos, ramas y commits. |
| [`01_Architecture/Dependency_Rules.md`](01_Architecture/Dependency_Rules.md) | mandatory | Dirección de dependencias, sin ciclos, API pública entre módulos. |

## 02_UI_UX — Interfaz y experiencia

| Archivo | Nivel | Qué es |
|---|---|---|
| [`02_UI_UX/Design_Principles.md`](02_UI_UX/Design_Principles.md) | guideline | Principios de diseño, los 5 estados de toda vista y reglas **mandatory** de pantalla/interacción (CRUD en página completa no modal, shell, anti-doble-click, overlay de menú). |
| [`02_UI_UX/Accessibility.md`](02_UI_UX/Accessibility.md) | standard | Accesibilidad WCAG 2.1 AA (teclado, contraste, ARIA). |
| [`02_UI_UX/Design_System.md`](02_UI_UX/Design_System.md) | standard | Design tokens y componentes reutilizables; nada de estilos sueltos. Reglas **mandatory**: select siempre searchable, validación por tipo en cada control. |

## 03_Database — Base de datos

| Archivo | Nivel | Qué es |
|---|---|---|
| [`03_Database/Seeds_Strategy.md`](03_Database/Seeds_Strategy.md) | mandatory | Seeds de producción / desarrollo / test con responsabilidades separadas. |
| [`03_Database/Naming.md`](03_Database/Naming.md) | standard | Nomenclatura de tablas, columnas, claves e índices. |
| [`03_Database/Migrations.md`](03_Database/Migrations.md) | standard | Migraciones versionadas, reversibles, patrón expand/contract. |
| [`03_Database/Data_Modeling.md`](03_Database/Data_Modeling.md) | guideline | Guía de modelado (claves, dinero, fechas, relaciones). |

## 04_Backend — Backend

| Archivo | Nivel | Qué es |
|---|---|---|
| [`04_Backend/API_Design.md`](04_Backend/API_Design.md) | standard | Diseño REST: recursos, verbos, códigos, formato de respuesta. |
| [`04_Backend/Error_Handling.md`](04_Backend/Error_Handling.md) | mandatory | Taxonomía de errores, formato estándar, manejador global. |
| [`04_Backend/Validation.md`](04_Backend/Validation.md) | mandatory | Validación de forma (borde) y de negocio (dominio). |
| [`04_Backend/Security.md`](04_Backend/Security.md) | mandatory | Mínimos de seguridad: auth, autorización, inyección, secretos, límites. |

## 05_Frontend — Frontend

| Archivo | Nivel | Qué es |
|---|---|---|
| [`05_Frontend/Component_Architecture.md`](05_Frontend/Component_Architecture.md) | standard | Componentes pequeños; separar lógica de vista. Reglas **mandatory**: pantalla invocable que retorna datos al llamante, anti-doble-click técnico. |
| [`05_Frontend/State_Management.md`](05_Frontend/State_Management.md) | guideline | Clasificar el estado y elegir la herramienta correcta. Regla **mandatory**: revalidar el estado de servidor al retornar de una pantalla invocada. |
| [`05_Frontend/Performance.md`](05_Frontend/Performance.md) | standard | Core Web Vitals, code splitting, imágenes, percepción. |

## 06_Testing — Pruebas

| Archivo | Nivel | Qué es |
|---|---|---|
| [`06_Testing/Testing_Strategy.md`](06_Testing/Testing_Strategy.md) | mandatory | Pirámide de tests; qué pruebas son obligatorias. |
| [`06_Testing/E2E_Standards.md`](06_Testing/E2E_Standards.md) | standard | Pruebas E2E (Playwright) y anotaciones `@manual-step`. |
| [`06_Testing/Coverage_Requirements.md`](06_Testing/Coverage_Requirements.md) | standard | Umbrales de cobertura y gate de diff coverage. |

## 07_Documentation — Documentación

| Archivo | Nivel | Qué es |
|---|---|---|
| [`07_Documentation/Obsidian_Vault_Standard.md`](07_Documentation/Obsidian_Vault_Standard.md) | mandatory | La bóveda como única fuente de verdad; vault dinámico; único escritor. |
| [`07_Documentation/User_Manual_Standard.md`](07_Documentation/User_Manual_Standard.md) | standard | Manual de usuario mantenido por `/obsidian` desde E2E anotados. |
| [`07_Documentation/ADR.md`](07_Documentation/ADR.md) | standard | Registro de decisiones de arquitectura. |

## 08_DevOps — Operaciones

| Archivo | Nivel | Qué es |
|---|---|---|
| [`08_DevOps/Environments.md`](08_DevOps/Environments.md) | mandatory | Entornos, variables y comandos canónicos reproducibles. |
| [`08_DevOps/CI_CD.md`](08_DevOps/CI_CD.md) | standard | Pipeline, etapas y gates de calidad obligatorios. |
| [`08_DevOps/Git_GitHub_Standards.md`](08_DevOps/Git_GitHub_Standards.md) | standard | Flujo profesional de Git/GitHub: branching trunk-based, PRs, merge squash + historia lineal, protección de ramas, CODEOWNERS, releases SemVer, reglas de Git para IA. |
| [`08_DevOps/Deployment.md`](08_DevOps/Deployment.md) | standard | Despliegue reversible, gradual y observable. |
| [`08_DevOps/Secrets_Management.md`](08_DevOps/Secrets_Management.md) | mandatory | Cero secretos en el repo; entorno/gestor; rotación. |

## 09_AI — Agentes de IA

| Archivo | Nivel | Qué es |
|---|---|---|
| [`09_AI/Protected_Modules.md`](09_AI/Protected_Modules.md) | mandatory | Zonas de código que la IA no toca sin aprobación (`.aicodeprotect.yml`). |
| [`09_AI/Forbidden_Actions.md`](09_AI/Forbidden_Actions.md) | mandatory | Lista de acciones prohibidas para agentes. |
| [`09_AI/Prompt_Rules.md`](09_AI/Prompt_Rules.md) | standard | Cómo se formulan tareas y cómo razona/responde el agente. |
| [`09_AI/Agent_Workflow.md`](09_AI/Agent_Workflow.md) | standard | El ciclo de trabajo completo del agente, fase a fase. |
| [`09_AI/Documentation_Expert.md`](09_AI/Documentation_Expert.md) | standard | Rol del **Experto Obsidian** (`/obsidian`): oráculo y custodio de la verdad. |

## Templates — Plantillas

| Archivo | Qué es |
|---|---|
| [`Templates/Module_Template.md`](Templates/Module_Template.md) | Plantilla para crear un módulo y su `MODULE.yaml`. |
| [`Templates/Entity_Template.md`](Templates/Entity_Template.md) | Plantilla para una entidad de dominio (con seeds y tests). |
| [`Templates/Seed_Template.sql`](Templates/Seed_Template.sql) | Plantilla de seeds de desarrollo y test. |
| [`Templates/Obsidian_Note_Template.md`](Templates/Obsidian_Note_Template.md) | Plantilla de nota de módulo/entidad para la bóveda. |
| [`Templates/ADR_Template.md`](Templates/ADR_Template.md) | Plantilla de registro de decisión de arquitectura. |
| [`Templates/User_Manual_Template.md`](Templates/User_Manual_Template.md) | Estructura base del manual de usuario. |
| [`Templates/Pull_Request_Template.md`](Templates/Pull_Request_Template.md) | Plantilla de PR con Definition of Done. |
| [`Templates/CLAUDE_Template.md`](Templates/CLAUDE_Template.md) | Plantilla del `CLAUDE.md` que vive en la raíz de cada proyecto. |
| [`Templates/Obsidian_Skill_Template/SKILL.md`](Templates/Obsidian_Skill_Template/SKILL.md) | **Fuente única** del skill `/obsidian` (solo Markdown). |
| [`Templates/Obsidian_Skill_Template/reference.md`](Templates/Obsidian_Skill_Template/reference.md) | Mapa de la bóveda que usa el skill como apoyo. |
| [`Templates/Obsidian_Skill_Template/README.md`](Templates/Obsidian_Skill_Template/README.md) | Cómo instalar y sincronizar el skill en un proyecto. |
| [`Templates/github/README.md`](Templates/github/README.md) | Qué hay en `Templates/github/` y cómo copiarlo a `.github/`. |
| [`Templates/github/workflows/ci.yml`](Templates/github/workflows/ci.yml) | Workflow de CI (GitHub Actions) alineado con los gates de `CI_CD.md`. |
| [`Templates/github/CODEOWNERS`](Templates/github/CODEOWNERS) | Owners por ruta + módulos protegidos (review humano forzado). |
| [`Templates/github/dependabot.yml`](Templates/github/dependabot.yml) | Actualización automática de dependencias y actions. |
| [`Templates/github/branch-protection.md`](Templates/github/branch-protection.md) | Receta `gh api` para proteger `main` de forma reproducible. |
| [`Templates/github/ISSUE_TEMPLATE/bug_report.md`](Templates/github/ISSUE_TEMPLATE/bug_report.md) | Plantilla de issue para bugs. |
| [`Templates/github/ISSUE_TEMPLATE/feature_request.md`](Templates/github/ISSUE_TEMPLATE/feature_request.md) | Plantilla de issue para nuevas funcionalidades. |

## Checklists — Listas de verificación

| Archivo | Qué es |
|---|---|
| [`Checklists/New_Project.md`](Checklists/New_Project.md) | Incorporar el framework a un proyecto nuevo/existente. |
| [`Checklists/New_Module.md`](Checklists/New_Module.md) | Crear un módulo. |
| [`Checklists/New_Entity.md`](Checklists/New_Entity.md) | Crear una entidad (incluye seeds obligatorios). |
| [`Checklists/Modify_Existing.md`](Checklists/Modify_Existing.md) | Modificar código existente con seguridad. |
| [`Checklists/Release.md`](Checklists/Release.md) | Antes de etiquetar una versión. |
| [`Checklists/PR_Review.md`](Checklists/PR_Review.md) | Revisión de un pull request. |

## Examples — Ejemplos reales

| Archivo | Qué es |
|---|---|
| [`Examples/.aicodeprotect.yml`](Examples/.aicodeprotect.yml) | Ejemplo de declaración de módulos protegidos. |
| [`Examples/MODULE.yaml`](Examples/MODULE.yaml) | Ejemplo de manifiesto de módulo. |
| [`Examples/env.example`](Examples/env.example) | Ejemplo de `.env.example` (sin secretos reales). |
| [`Examples/Vault_Structure_Example.md`](Examples/Vault_Structure_Example.md) | Ejemplo de cómo queda la bóveda `docs/` de un proyecto. |

## Tools — Utilidades (opcional / legado)

| Archivo | Qué es |
|---|---|
| [`Tools/README.md`](Tools/README.md) | Explica que los scripts son opcionales; el flujo principal es `/obsidian`. |
| [`Tools/check_obsidian_links.py`](Tools/check_obsidian_links.py) | Validador opcional de enlaces de la bóveda. |
| [`Tools/generate_manual.py`](Tools/generate_manual.py) | Generador opcional de capturas para el manual. |

---

## Cómo está organizado (resumen)

```
Reglas (00–09)  →  qué cumplir y por qué
Templates       →  con qué empezar
Checklists      →  cómo cerrar cada tarea
Examples        →  cómo se ve en real
Tools           →  utilidades opcionales
```
