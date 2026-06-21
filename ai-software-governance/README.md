# AI Software Governance Framework

Constitución central para el desarrollo de software asistido por IA.

Define **políticas, estándares, procesos y plantillas** que todo agente (Claude Code, Cursor, Copilot, Gemini, etc.) debe seguir antes de modificar o generar código.

Este repositorio **no contiene implementación de aplicaciones**. Es la **fuente única de verdad de gobierno** reutilizable en todos tus proyectos.

---

## ¿Qué es esto?

Un *meta-repositorio* que se incorpora (como submódulo Git, copia o paquete) dentro de cada proyecto real. Su función es responder, de forma inequívoca, a la pregunta:

> "Antes de escribir o cambiar una sola línea de código, ¿qué reglas debo respetar y qué pasos debo seguir?"

Está pensado para equipos donde **gran parte del código lo generan agentes de IA**, y donde se necesita garantizar consistencia, calidad, trazabilidad y seguridad sin depender de la memoria humana.

---

## Estructura del repositorio

```
ai-software-governance/
├── README.md                      ← estás aquí
├── AI_START_HERE.md               ← punto de entrada OBLIGATORIO para agentes
├── GOVERNANCE.md                  ← filosofía y principios para humanos
├── CHANGELOG.md                   ← historial de cambios del framework
├── GLOSSARY.md                    ← lenguaje ubicuo común
│
├── 00_Governance/                 ← índice y meta-políticas
├── 01_Architecture/               ← módulos, naming, dependencias, utilidades
├── 02_UI_UX/                      ← diseño, accesibilidad, design system
├── 03_Database/                   ← seeds, naming, migraciones, modelado
├── 04_Backend/                    ← APIs, errores, validación, seguridad
├── 05_Frontend/                   ← estado, componentes, performance
├── 06_Testing/                    ← pirámide de tests, E2E, cobertura
├── 07_Documentation/              ← Obsidian, manual de usuario, ADR
├── 08_DevOps/                     ← entornos, CI/CD, despliegue, secretos
├── 09_AI/                         ← módulos protegidos, acciones prohibidas, prompts
│
├── Templates/                     ← plantillas reutilizables (incl. skill /obsidian)
├── Checklists/                    ← listas de verificación por proceso
├── Examples/                      ← ejemplos concretos y configuraciones reales
└── Tools/                         ← scripts opcionales/legado
```

> 📑 **¿Buscas un archivo concreto?** El [`INDEX.md`](INDEX.md) es el **índice maestro**: lista
> *cada* archivo del repositorio con una línea de qué es y su enlace.

---

## Cómo usar todo esto (3 escenarios)

| Si eres… | Empieza en… | Y luego… |
|---|---|---|
| **Humano que adopta** el framework en un proyecto | [`GOVERNANCE.md`](GOVERNANCE.md) → [`Checklists/New_Project.md`](Checklists/New_Project.md) | Genera el `CLAUDE.md` ([`Templates/CLAUDE_Template.md`](Templates/CLAUDE_Template.md)) e instala el skill `/obsidian`. |
| **Agente que va a programar** | [`AI_START_HERE.md`](AI_START_HERE.md) | Consulta a `/obsidian`, lee las reglas de tu capa, cierra con la checklist. |
| **Experto que documenta** (`/obsidian`) | [`09_AI/Documentation_Expert.md`](09_AI/Documentation_Expert.md) | Mantiene la bóveda del proyecto y el [`INDEX.md`](INDEX.md) del framework. |
| **Cualquiera buscando algo** | [`INDEX.md`](INDEX.md) | Índice de todo el repo. |

---

## Primeros pasos para agentes

1. Comienza **siempre** en [`AI_START_HERE.md`](AI_START_HERE.md).
2. Lee el nivel de obligatoriedad de cada regla (`Mandatory`, `Standard`, `Guideline`, `Recommendation`).
3. Antes de cualquier modificación, verifica `.aicodeprotect.yml` en el proyecto.
4. Sigue la ruta de lectura correspondiente a tu tarea (creación, modificación o documentación).
5. Cierra siempre con la **checklist** aplicable.

## Primeros pasos para humanos

1. Revisa [`GOVERNANCE.md`](GOVERNANCE.md) para entender la filosofía.
2. Para incorporar el framework a un proyecto, usa la checklist [`Checklists/New_Project.md`](Checklists/New_Project.md).
3. Adapta las plantillas de `Templates/` y los ejemplos de `Examples/` a tu stack.

---

## Cómo incorporar el framework a un proyecto

Hay tres modos soportados (ver [`Checklists/New_Project.md`](Checklists/New_Project.md)):

| Modo | Cuándo usarlo | Comando de referencia |
|---|---|---|
| **Submódulo Git** | Quieres recibir actualizaciones del framework | `git submodule add <url> .governance` |
| **Copia (vendoring)** | Quieres congelar una versión concreta | copiar el árbol a `.governance/` |
| **Paquete** | Distribución interna versionada | publicar como tarball/registry privado |

En todos los casos, el proyecto debe tener en su raíz:
- `.aicodeprotect.yml` (ver [`Examples/.aicodeprotect.yml`](Examples/.aicodeprotect.yml))
- Una carpeta `docs/` con la bóveda Obsidian (ver [`07_Documentation/Obsidian_Vault_Standard.md`](07_Documentation/Obsidian_Vault_Standard.md))
- Una carpeta `.github/` con CI, `CODEOWNERS` y la rama `main` protegida (ver [`08_DevOps/Git_GitHub_Standards.md`](08_DevOps/Git_GitHub_Standards.md) y las plantillas de [`Templates/github/`](Templates/github/))

---

## Niveles de obligatoriedad

Cada documento declara en su cabecera YAML un campo `obligation`:

- **`mandatory`**: no puede incumplirse bajo ninguna circunstancia.
- **`standard`**: cúmplelo, salvo excepción aprobada explícitamente.
- **`guideline`**: orienta el diseño; puedes desviarte con justificación.
- **`recommendation`**: buena práctica, no obligatoria.

---

## Estado del framework

Versión inicial. Consulta [`CHANGELOG.md`](CHANGELOG.md) para el historial y [`07_Documentation/ADR.md`](07_Documentation/ADR.md) para las decisiones de arquitectura del propio framework.
