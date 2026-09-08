---
obligation: mandatory
area: governance
applies_to: all projects
---

# Índice Centralizado de Políticas

Lista completa de políticas clasificadas por área y nivel de obligatoriedad. Las referencias llevan al documento detallado. Este índice es la **tabla de contenidos canónica**: si una política existe, está aquí.

---

## Cómo leer este índice

- **Política**: nombre corto de la regla.
- **Nivel**: `mandatory` | `standard` | `guideline` | `recommendation`.
- **Documento**: ruta relativa desde la raíz del framework.

---

## Gobernanza (00)

| Política | Nivel | Documento |
|---|---|---|
| Índice de políticas | mandatory | `gobernanza/Policy_Index.md` |
| Acceso al framework (descubrimiento y versionado) | mandatory | `gobernanza/Framework_Access_Standard.md` |
| Contexto del proyecto (`AGENTS.md` y `docs/00_Proyecto/`) | mandatory | `gobernanza/Project_Context_Standard.md` |
| Asistencia inicial interactiva | standard | `gobernanza/Project_Start.md` |
| Proceso de excepciones | standard | `gobernanza/Exceptions_Process.md` |

## Arquitectura (01)

| Política | Nivel | Documento |
|---|---|---|
| Organización de módulos | standard | `practicas/Module_Organization.md` |
| Utilidades globales | mandatory | `practicas/Global_Utilities.md` |
| Convenciones de nombres | standard | `practicas/Naming_Conventions.md` |
| Dependencias entre módulos | mandatory | `practicas/Dependency_Rules.md` |

## UI / UX (02)

| Política | Nivel | Documento |
|---|---|---|
| Principios de diseño | guideline | `practicas/Design.md` |
| Accesibilidad (a11y) | standard | `practicas/Accessibility.md` |
| Design System | standard | `practicas/Design.md` |

> **Reglas `Mandatory` inline en UI/UX:** aunque el `obligation` del archivo sea
> `guideline`/`standard`, algunos documentos contienen reglas **innegociables** marcadas
> `Mandatory` en su cuerpo: *select siempre searchable* y *validación por tipo en cada control*
> (`Design.md`); *CRUD/reporte en página completa (no modal)*, *toda página dentro del
> shell*, *anti-doble-click* y *overlay de procesamiento en menú* (`Design.md`).

## Base de datos (03)

| Política | Nivel | Documento |
|---|---|---|
| Estrategia de semillas (prod/dev/test) | mandatory | `practicas/Seeds_Strategy.md` |
| Nomenclatura de BD | standard | `practicas/Naming_Conventions.md` |
| Migraciones | standard | `practicas/Migrations.md` |
| Modelado de datos | guideline | `practicas/Data_Modeling.md` |

## Backend (04)

| Política | Nivel | Documento |
|---|---|---|
| Diseño de APIs | standard | `practicas/API_Design.md` |
| Manejo de errores | mandatory | `practicas/Error_Handling.md` |
| Validación de entrada | mandatory | `practicas/Validation.md` |
| Seguridad backend | mandatory | `practicas/Security.md` |

## Frontend (05)

| Política | Nivel | Documento |
|---|---|---|
| Arquitectura de componentes | standard | `practicas/Component_Architecture.md` |
| Gestión de estado | guideline | `practicas/State_Management.md` |
| Rendimiento (performance) | standard | `practicas/Performance.md` |

> **Reglas `Mandatory` inline en Frontend:** *pantalla invocable que retorna datos al llamante*
> y *anti-doble-click técnico (guardia de reentrada)* (`Component_Architecture.md`); *revalidar
> el estado de servidor al retornar de una pantalla invocada* (`State_Management.md`).

## Testing (06)

| Política | Nivel | Documento |
|---|---|---|
| Estrategia de testing | mandatory | `practicas/Testing_Strategy.md` |
| Pruebas E2E | standard | `practicas/E2E_Standards.md` |
| Cobertura mínima | standard | `practicas/Coverage_Requirements.md` |

## Documentación (07)

| Política | Nivel | Documento |
|---|---|---|
| Bóveda Obsidian como fuente de verdad | mandatory | `gobernanza/Obsidian_Vault_Standard.md` |
| Registro de actividad (`META/TAREA/ESTADO/FECHAS`) | standard | `gobernanza/Activity_Tracking.md` |
| Manual de usuario automático | standard | `gobernanza/User_Manual_Standard.md` |
| Registro de decisiones (ADR) | standard | `gobernanza/ADR.md` |

## DevOps (08)

| Política | Nivel | Documento |
|---|---|---|
| Entornos y comandos | mandatory | `practicas/Environments.md` |
| Integración y despliegue continuo | standard | `practicas/CI_CD.md` |
| Estándares de Git/GitHub | standard | `practicas/Git_GitHub_Standards.md` |
| Despliegue | standard | `practicas/Deployment.md` |
| Gestión de secretos | mandatory | `practicas/Secrets_Management.md` |

## Agentes IA (09)

| Política | Nivel | Documento |
|---|---|---|
| Módulos protegidos | mandatory | `gobernanza/Protected_Modules.md` |
| Acciones prohibidas (6 reglas duras) | mandatory | `gobernanza/Forbidden_Actions.md` |
| Reglas de prompts | standard | `gobernanza/Agent_Workflow.md` |
| Flujo de trabajo del agente (coordinador delgado) | standard | `gobernanza/Agent_Workflow.md` |
| Subagentes (catálogo de 6) | standard | `gobernanza/Subagents.md` |
| Contrato del agente (`.<agente>/AGENT_CONTEXT.md`) | standard | `gobernanza/Agent_Contract_Standard.md` |

> **Políticas retiradas:** la maquinaria pesada (roles y ciclo de vida, estados unificados,
> onboarding, arquitectos de casos de uso/pantallas, PM, experto Obsidian, MCP de código/bóveda,
> configuración local y registro de implementación con sub-estados) quedó archivada en
> [`archivo/`](../archivo/) como referencia. El framework activo usa los **6 subagentes**, el
> **registro de actividad ligero** y la **asistencia inicial interactiva**.

---

## Mantenimiento de este índice

Cuando se añade o elimina una política:
1. Actualizar esta tabla en el mismo PR.
2. Registrar el cambio en [`../CHANGELOG.md`](../CHANGELOG.md).
3. Si afecta a un nivel `mandatory`/`standard`, abrir un ADR ([`ADR.md`](ADR.md)).
