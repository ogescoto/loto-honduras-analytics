# AI Software Governance Framework

Conjunto de **mejores prácticas** para desarrollo de software asistido por IA, con **muy pocas reglas duras**.

Define cómo debe trabajar un agente para obtener resultados consistentes y de calidad: **delegando en subagentes de scope definido**, **ahorrando tokens** y **documentando lo que cambia**. No es un corsé: es una guía con 6 reglas innegociables y el resto como recomendaciones.

Este repositorio **no contiene implementación de aplicaciones**. Es la fuente de verdad de gobierno, reutilizable en todos tus proyectos.

---

## ¿Qué es esto?

Un *meta-repositorio* que se incorpora (submódulo Git, copia o paquete) dentro de cada proyecto real. Responde a:

> "Antes de escribir o cambiar código, ¿qué buenas prácticas sigo y qué pocas cosas no puedo hacer?"

---

## Filosofía

| Antes | Ahora |
|---|---|
| Roles y estados rígidos | **6 subagentes de scope definido** |
| Muchos puntos de aprobación | Aprobación **solo en 3 casos**: plan inicial, acción destructiva, módulo protegido |
| "Detente y espera" ante dudas | **Avanza con criterio** marcando `[SUPUESTO]`; en segundo plano no te bloquees |
| Modelo caro para todo | **Modelo por perfil**: barato para leer/probar/registrar, capaz solo para escribir |
| Documentación curada por un rol exclusivo | `doc-mapper` escribe; `doc-reader` lee; ambos con su modelo |
| Arranque tipo formulario | **Asistencia inicial interactiva** ([`gobernanza/Project_Start.md`](gobernanza/Project_Start.md)) |

**Principios de trabajo del agente:**
- **Coordinador delgado:** delega en subagentes con contexto aislado; su contexto no se infla.
- **Modo cavernícola:** razonamiento interno mínimo; respuesta completa en el **idioma del usuario**.
- **Costo consciente:** el modelo capaz solo se gasta donde aporta (escribir).

---

## Los 6 subagentes

| Subagente | Hace | Modelo |
|---|---|---|
| `doc-mapper` | Escribe documentación, mapea código → bóveda y mantiene el **mapa conceptos ↔ código** | **pensante** |
| `doc-reader` | Lee bóveda/código, responde dudas de contexto y de flujos (usa el mapa) | **barato** |
| `dev-backend` | Backend: lógica, APIs, BD, tests | capaz |
| `dev-frontend` | Frontend: componentes, estado, E2E | capaz |
| `tester` | Ejecuta la suite, veredicto pasa/falla | **barato** |
| `activity-manager` | Registra META/TAREA/ESTADO/FECHA_INI/FECHA_FIN | **barato** |

Detalle: [`gobernanza/Subagents.md`](gobernanza/Subagents.md). Ejemplo de configuración: [`Examples/subagents_example.md`](Examples/subagents_example.md).

---

## Estructura del repositorio

```
ai-software-governance/
├── README.md                      ← estás aquí
├── AI_START_HERE.md               ← punto de entrada OBLIGATORIO para agentes (autocontenido)
├── GOVERNANCE.md                  ← filosofía y principios para humanos
├── CHANGELOG.md                   ← historial de cambios del framework
├── GLOSSARY.md                    ← lenguaje ubicuo común
│
├── gobernanza/                   ← acceso, contexto, asistencia inicial, excepciones, ADR
├── practicas/                    ← prácticas por capa (orientan, no mandan), subagentes, workflow
│
├── Templates/                     ← plantillas (subagente, contrato, configuración…)
├── Checklists/                    ← listas de verificación por proceso
├── Examples/                      ← ejemplos concretos
├── Tools/                         ← utilidades opcionales/legado
└── archivo/                       ← documentación pesada retirada (consulta, no activa)
```

> 📑 **¿Buscas un archivo concreto?** El [`INDEX.md`](INDEX.md) es el índice maestro.

---

## Cómo usar esto

| Si eres… | Empieza en… | Y luego… |
|---|---|---|
| **Agente que va a trabajar** | [`AI_START_HERE.md`](AI_START_HERE.md) | Lee los 6 subagentes, el workflow y las 6 reglas duras |
| **Humano que adopta** el framework | [`GOVERNANCE.md`](GOVERNANCE.md) → [`Checklists/New_Project.md`](Checklists/New_Project.md) | Instala `AGENTS.md` y la bóveda inicial |
| **Quien arranca un proyecto nuevo** | [`gobernanza/Project_Start.md`](gobernanza/Project_Start.md) | Conversación guiada: visión → alcance → metas → ambiente → agentes → diagramas |
| **Quien pregunta "¿cómo va?"** | [`gobernanza/Activity_Tracking.md`](gobernanza/Activity_Tracking.md) | La tabla `META | TAREA | ESTADO | FECHA_INI | FECHA_FIN` |
| **Quien configura subagentes** | [`gobernanza/Subagents.md`](gobernanza/Subagents.md) → [`Templates/Subagent_Template.md`](Templates/Subagent_Template.md) | Fichas con `model`, `language`, `isolated_context` |
| **Cualquiera buscando algo** | [`INDEX.md`](INDEX.md) | Índice de todo el repo |

---

## Cómo incorporar el framework a un proyecto

Ver [`Checklists/New_Project.md`](Checklists/New_Project.md). Modos soportados:

| Modo | Cuándo usarlo | Comando |
|---|---|---|
| **Submódulo Git** ⭐ | Caso general | `git submodule add <url> .governance` |
| **Copia (vendoring)** | Sin acceso a Git remoto | copiar el árbol a `.governance/` |
| **Framework hermano** | Varios proyectos en un árbol | se descubre con `.governance-root` |
| **Paquete npm/pnpm** | Proyectos Node | `pnpm add -D <repo>` |

El proyecto debe tener: `AGENTS.md` (punto de entrada), `.<herramienta>/AGENT_CONTEXT.md`, `docs/00_Proyecto/` y `.aicodeprotect.yml`. Si el proyecto es nuevo, el arranque es la **asistencia inicial** (`gobernanza/Project_Start.md`).

---

## Niveles de obligatoriedad

| Nivel | Qué significa |
|---|---|
| **`mandatory`** | No se incumple: **las 6 reglas duras** y **módulos protegidos** |
| **`standard`** | Cúmplelo salvo excepción aprobada |
| **`guideline` / `recommendation`** | Orientan el diseño; puedes desviarte con justificación |

Casi todo el framework es orientación. Lo duro es poco y está en [`gobernanza/Forbidden_Actions.md`](gobernanza/Forbidden_Actions.md).

---

## Estado del framework

Versión actual: consulta [`CHANGELOG.md`](CHANGELOG.md) y [`gobernanza/ADR.md`](gobernanza/ADR.md).
