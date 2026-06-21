# Changelog del Framework

Todas las modificaciones notables del framework de gobernanza se registran aquí.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es/1.1.0/) y el versionado sigue [SemVer](https://semver.org/lang/es/):

- **MAJOR**: cambio incompatible en una política `mandatory`/`standard` (rompe proyectos existentes).
- **MINOR**: nueva política o documento compatible.
- **PATCH**: correcciones, aclaraciones, ejemplos.

Cada entrada relevante debe enlazar al ADR que la motivó (ver [`07_Documentation/ADR.md`](07_Documentation/ADR.md)).

---

## [Unreleased]

### Added
- **Estándares de Git/GitHub**: nuevo `08_DevOps/Git_GitHub_Standards.md` (branching trunk-based/GitHub Flow, Conventional Commits, PRs, merge squash + historia lineal, protección de ramas, CODEOWNERS atado a módulos protegidos, releases SemVer, higiene/seguridad y reglas de Git para agentes IA) + plantillas reales en `Templates/github/` (`workflows/ci.yml`, `CODEOWNERS`, `dependabot.yml`, `branch-protection.md`, issue templates, `README.md`). Integrado en `Naming_Conventions.md`, `CI_CD.md`, `Policy_Index.md`, `Checklists/New_Project.md` y `Checklists/Release.md`.
- `INDEX.md`: índice maestro navegable de **todo** el repositorio (cada archivo con descripción y enlace). Custodiado por el Experto Obsidian. `README.md` ampliado con sección "Cómo usar todo esto" y puntero al índice.
- `Templates/CLAUDE_Template.md`: plantilla del `CLAUDE.md` que vive en la raíz de cada proyecto y redirige al framework. Enlazada desde `Checklists/New_Project.md` y `AI_START_HERE.md`.
- **Experto Obsidian / skill `/obsidian`**: nuevo rol `09_AI/Documentation_Expert.md` y plantilla del skill en `Templates/Obsidian_Skill_Template/` (SKILL.md + reference.md + README). El experto es el **único que escribe la bóveda**; los demás agentes le consultan antes y le entregan los cambios después (ahorro de contexto). Vault **dinámico** (descubre `.obsidian/`, fallback `docs/`). Copia operativa instalada en `.claude/skills/obsidian/`.

### Changed
- **Reglas de UI/UX e interacción (Mandatory inline)** repartidas en documentos existentes: `Select` siempre searchable y validación por tipo en cada control (`02_UI_UX/Design_System.md`); CRUD/reporte en página completa —no modal—, toda página dentro del shell, anti-doble-click y overlay de procesamiento en menú (`02_UI_UX/Design_Principles.md`); pantalla invocable que retorna datos al llamante y anti-doble-click técnico (`05_Frontend/Component_Architecture.md`); revalidar el estado de servidor al retornar de una pantalla invocada (`05_Frontend/State_Management.md`). Nota de refuerzo en `04_Backend/Validation.md` (la validación de UI no sustituye a la del servidor) y aclaración en `00_Governance/Policy_Index.md`. Estas reglas se marcan `Mandatory` inline aunque el `obligation` del archivo sea `guideline`/`standard`.
- `07_Documentation/Obsidian_Vault_Standard.md`: único escritor (experto), vault dinámico, `.obsidian/` en la estructura.
- `07_Documentation/User_Manual_Standard.md`: el manual lo mantiene `/obsidian` en Markdown; multimedia opcional.
- `09_AI/Agent_Workflow.md` y `09_AI/Forbidden_Actions.md`: consultar/entregar al experto; prohibido escribir en `docs/` directamente.
- `Checklists/` (New_Project, New_Module, New_Entity, Modify_Existing) y `Templates/CLAUDE_Template.md`: documentación vía `/obsidian`.
- `Tools/README.md`, `08_DevOps/CI_CD.md`: los scripts `.py` pasan a **opcional/legado**; el flujo principal de documentación es Markdown vía `/obsidian`.
- `00_Governance/Policy_Index.md`: registrada la política del Experto en documentación.

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
