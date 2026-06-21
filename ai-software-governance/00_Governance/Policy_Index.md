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
| Índice de políticas | mandatory | `00_Governance/Policy_Index.md` |
| Proceso de excepciones | standard | `00_Governance/Exceptions_Process.md` |

## Arquitectura (01)

| Política | Nivel | Documento |
|---|---|---|
| Organización de módulos | standard | `01_Architecture/Module_Organization.md` |
| Utilidades globales | mandatory | `01_Architecture/Global_Utilities.md` |
| Convenciones de nombres | standard | `01_Architecture/Naming_Conventions.md` |
| Dependencias entre módulos | mandatory | `01_Architecture/Dependency_Rules.md` |

## UI / UX (02)

| Política | Nivel | Documento |
|---|---|---|
| Principios de diseño | guideline | `02_UI_UX/Design_Principles.md` |
| Accesibilidad (a11y) | standard | `02_UI_UX/Accessibility.md` |
| Design System | standard | `02_UI_UX/Design_System.md` |

> **Reglas `Mandatory` inline en UI/UX:** aunque el `obligation` del archivo sea
> `guideline`/`standard`, algunos documentos contienen reglas **innegociables** marcadas
> `Mandatory` en su cuerpo: *select siempre searchable* y *validación por tipo en cada control*
> (`Design_System.md`); *CRUD/reporte en página completa (no modal)*, *toda página dentro del
> shell*, *anti-doble-click* y *overlay de procesamiento en menú* (`Design_Principles.md`).

## Base de datos (03)

| Política | Nivel | Documento |
|---|---|---|
| Estrategia de semillas (prod/dev/test) | mandatory | `03_Database/Seeds_Strategy.md` |
| Nomenclatura de BD | standard | `03_Database/Naming.md` |
| Migraciones | standard | `03_Database/Migrations.md` |
| Modelado de datos | guideline | `03_Database/Data_Modeling.md` |

## Backend (04)

| Política | Nivel | Documento |
|---|---|---|
| Diseño de APIs | standard | `04_Backend/API_Design.md` |
| Manejo de errores | mandatory | `04_Backend/Error_Handling.md` |
| Validación de entrada | mandatory | `04_Backend/Validation.md` |
| Seguridad backend | mandatory | `04_Backend/Security.md` |

## Frontend (05)

| Política | Nivel | Documento |
|---|---|---|
| Arquitectura de componentes | standard | `05_Frontend/Component_Architecture.md` |
| Gestión de estado | guideline | `05_Frontend/State_Management.md` |
| Rendimiento (performance) | standard | `05_Frontend/Performance.md` |

> **Reglas `Mandatory` inline en Frontend:** *pantalla invocable que retorna datos al llamante*
> y *anti-doble-click técnico (guardia de reentrada)* (`Component_Architecture.md`); *revalidar
> el estado de servidor al retornar de una pantalla invocada* (`State_Management.md`).

## Testing (06)

| Política | Nivel | Documento |
|---|---|---|
| Estrategia de testing | mandatory | `06_Testing/Testing_Strategy.md` |
| Pruebas E2E | standard | `06_Testing/E2E_Standards.md` |
| Cobertura mínima | standard | `06_Testing/Coverage_Requirements.md` |

## Documentación (07)

| Política | Nivel | Documento |
|---|---|---|
| Bóveda Obsidian como fuente de verdad | mandatory | `07_Documentation/Obsidian_Vault_Standard.md` |
| Manual de usuario automático | standard | `07_Documentation/User_Manual_Standard.md` |
| Registro de decisiones (ADR) | standard | `07_Documentation/ADR.md` |

## DevOps (08)

| Política | Nivel | Documento |
|---|---|---|
| Entornos y comandos | mandatory | `08_DevOps/Environments.md` |
| Integración y despliegue continuo | standard | `08_DevOps/CI_CD.md` |
| Estándares de Git/GitHub | standard | `08_DevOps/Git_GitHub_Standards.md` |
| Despliegue | standard | `08_DevOps/Deployment.md` |
| Gestión de secretos | mandatory | `08_DevOps/Secrets_Management.md` |

## Agentes IA (09)

| Política | Nivel | Documento |
|---|---|---|
| Módulos protegidos | mandatory | `09_AI/Protected_Modules.md` |
| Acciones prohibidas | mandatory | `09_AI/Forbidden_Actions.md` |
| Reglas de prompts | standard | `09_AI/Prompt_Rules.md` |
| Flujo de trabajo del agente | standard | `09_AI/Agent_Workflow.md` |
| Experto en documentación (Obsidian) | standard | `09_AI/Documentation_Expert.md` |

---

## Mantenimiento de este índice

Cuando se añade o elimina una política:
1. Actualizar esta tabla en el mismo PR.
2. Registrar el cambio en [`../CHANGELOG.md`](../CHANGELOG.md).
3. Si afecta a un nivel `mandatory`/`standard`, abrir un ADR ([`../07_Documentation/ADR.md`](../07_Documentation/ADR.md)).
