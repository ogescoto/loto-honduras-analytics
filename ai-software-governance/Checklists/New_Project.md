---
obligation: mandatory
area: process
applies_to: all projects
---

# Checklist: Nuevo Proyecto

Al incorporar el framework de gobernanza a un proyecto nuevo o existente, verifica:

## 1. Incorporar el framework
- [ ] Decidir el modo de incorporación. **Recomendado: submódulo Git** — no duplica archivos, permite anclar a una versión y no impone dependencia de stack. Ver [`../gobernanza/Framework_Access_Standard.md`](../gobernanza/Framework_Access_Standard.md).
      ```bash
      git submodule add <url> .governance
      cd .governance && git checkout v1.0.0
      ```
- [ ] **Anclar a un tag, nunca a `main`.** Anclar a una rama equivale a no tener versión: el proyecto recibiría cambios sin decidirlo.
- [ ] Verificar que el framework tiene `.governance-root` en su raíz (es lo que permite descubrirlo).

## 2. Archivos de control en la raíz del proyecto
- [ ] Crear **`AGENTS.md`** desde [`../Templates/AGENTS_Template.md`](../Templates/AGENTS_Template.md). Es el **punto de entrada único** de todas las herramientas. Declarar en su frontmatter `governance_path` y `governance_version`.
- [ ] Crear los **punteros de una línea** de cada herramienta usada: `CLAUDE.md`, `.cursorrules`, `.github/copilot-instructions.md`. Ver [`../Templates/CLAUDE_Template.md`](../Templates/CLAUDE_Template.md). **No dupliques contenido**: se desincroniza.
- [ ] Crear **`.<herramienta>/AGENT_CONTEXT.md`** por cada agente que trabajará en el proyecto (`.claude/`, `.opencode/`, `.codex/`…) desde [`../Templates/Agent_Contract_Template.md`](../Templates/Agent_Contract_Template.md). Declarar su `agente_app`, sus `subagentes` y su `idioma_respuesta`. Ver [`../gobernanza/Agent_Contract_Standard.md`](../gobernanza/Agent_Contract_Standard.md).
- [ ] Crear **`.<herramienta>/AGENT_CONFIG.md`** con la configuración local de la herramienta: modelos (barato/capaz/pensante) y los subagentes que puede ejecutar. Desde [`../Templates/AGENT_CONFIG_Template.md`](../Templates/AGENT_CONFIG_Template.md).
- [ ] **Replicar los subagentes del catálogo** en la configuración de cada herramienta desde las plantillas (no enlazar): [`../Templates/Subagent_Template.md`](../Templates/Subagent_Template.md) y [`Examples/subagents_example.md`](../Examples/subagents_example.md). Catálogo en [`../gobernanza/Subagents.md`](../gobernanza/Subagents.md).
- [ ] Crear `.aicodeprotect.yml` a partir de [`../Examples/.aicodeprotect.yml`](../Examples/.aicodeprotect.yml).
- [ ] Crear `.env.example` con todas las variables (sin secretos reales). Ver [`../practicas/Environments.md`](../practicas/Environments.md).
- [ ] Configurar `.gitignore` para excluir `.env` y secretos. Ver [`../practicas/Secrets_Management.md`](../practicas/Secrets_Management.md).
- [ ] Copiar las plantillas de [`../Templates/github/`](../Templates/github/) a `.github/` (CI, `CODEOWNERS`, `dependabot.yml`, issue templates) y `.github/pull_request_template.md` desde [`../Templates/Pull_Request_Template.md`](../Templates/Pull_Request_Template.md). Ver [`../practicas/Git_GitHub_Standards.md`](../practicas/Git_GitHub_Standards.md).
- [ ] Declarar en `CODEOWNERS` los **módulos protegidos** de `.aicodeprotect.yml`.

## 3. Asistencia inicial interactiva
- [ ] **Arrancar el proyecto con la asistencia inicial** ([`../gobernanza/Project_Start.md`](../gobernanza/Project_Start.md)): el agente entrevista al usuario en bloques y produce:
  - [ ] Visión, alcance y contexto: `VISION.md`, `ALCANCE.md`, `CONTEXTO_GLOBAL.md` en `docs/00_Proyecto/` (lo no confirmado se marca `[SUPUESTO — confirmar]`).
  - [ ] Ambiente de desarrollo confirmado: stack, comandos canónicos, entornos, `.aicodeprotect.yml` inicial.
  - [ ] **Diagramas Mermaid de la intención** en `docs/00_Proyecto/DIAGRAMAS.md` (contexto, flujo del sistema, arquitectura inicial) — confirmados por el usuario.
  - [ ] Archivos de agentes con frontmatter: `.<herramienta>/AGENT_CONTEXT.md` y `.<herramienta>/AGENT_CONFIG.md` (con `skills` del proyecto solo si existen).
  - [ ] Primera `ACTIVIDAD.md` con la tabla `META | TAREA | ESTADO | FECHA_INI | FECHA_FIN`.
- [ ] No codificar nada hasta que el usuario **apruebe** visión, alcance y contexto.

## 4. Bóveda de documentación
- [ ] Crear la estructura `docs/` según [`../gobernanza/Obsidian_Vault_Standard.md`](../gobernanza/Obsidian_Vault_Standard.md), incluyendo la carpeta `docs/.obsidian/` (vault).
- [ ] Crear `docs/00_MAPA_DE_CONTENIDOS.md`.
- [ ] Crear `docs/00_Proyecto/` (visión, alcance, contexto global) desde la asistencia inicial o, si el proyecto ya tenía contexto, desde [`../Templates/Project_Context_Template/`](../Templates/Project_Context_Template/README.md).
- [ ] Crear **`docs/07_Implementacion/ACTIVIDAD.md`** con la tabla `META | TAREA | ESTADO | FECHA_INI | FECHA_FIN` (primera versión desde la asistencia inicial). Ver [`../gobernanza/Activity_Tracking.md`](../gobernanza/Activity_Tracking.md).
- [ ] (Opcional, legado) Configurar los MCPs: ver [`../Templates/mcp/README.md`](../Templates/mcp/README.md). No es el flujo principal.
- [ ] Documentar el stack vía `doc-mapper` en `docs/03_Tecnico/`.
- [ ] Crear `docs/03_Tecnico/Mapa_Conceptos_Codigo.md` (vía `doc-mapper`, con [`../Templates/Mapa_Conceptos_Template.md`](../Templates/Mapa_Conceptos_Template.md)) en cuanto haya código funcional: la base para que `doc-reader` responda flujos sin releer código.

## 5. Entornos y comandos
- [ ] Definir comandos canónicos (`install`, `dev`, `migrate`, `seed-*`, `test`, `lint`, `build`). Ver [`../practicas/Environments.md`](../practicas/Environments.md).
- [ ] Documentar "desde cero a funcionando" en el README del proyecto.
- [ ] Fijar versiones de runtime (`.nvmrc`/`.tool-versions`/etc.).

## 6. Calidad y CI
- [ ] Configurar linter, formatter y type check.
- [ ] Configurar framework de tests (unidad/integración/E2E).
- [ ] Configurar pipeline de CI con los gates. Ver [`../practicas/CI_CD.md`](../practicas/CI_CD.md).
- [ ] Activar secret scanning y auditoría de dependencias.
- [ ] Configurar umbrales de cobertura. Ver [`../practicas/Coverage_Requirements.md`](../practicas/Coverage_Requirements.md).
- [ ] **Proteger la rama `main`** (PR obligatorio, CI requerido, review, historia lineal, sin force-push) con la receta [`../Templates/github/branch-protection.md`](../Templates/github/branch-protection.md). Ver [`../practicas/Git_GitHub_Standards.md`](../practicas/Git_GitHub_Standards.md).

## 7. Seeds
- [ ] Estructura de seeds para `production`, `development`, `test`. Ver [`../practicas/Seeds_Strategy.md`](../practicas/Seeds_Strategy.md).

## 8. Verificación final
- [ ] Un agente puede leer [`../AI_START_HERE.md`](../AI_START_HERE.md) y orientarse.
- [ ] **Un agente que solo lee `AGENTS.md` encuentra el framework** siguiendo `governance_path`.
- [ ] **Prueba real del arranque:** un agente que empieza en un proyecto sin `docs/00_Proyecto/` activa la asistencia inicial (`Project_Start.md`) y obtiene `VISION` + `ALCANCE` + `CONTEXTO_GLOBAL` + `DIAGRAMAS.md` + archivos de agentes + `ACTIVIDAD.md` con **aprobación del usuario en cada bloque**.
- [ ] `docs/00_Proyecto/VISION.md` tiene su sección "Qué **NO** es" rellenada, y `ALCANCE.md` su "Fuera de alcance". Ahí está su valor.
- [ ] `docs/00_Proyecto/DIAGRAMAS.md` refleja la intención acordada y fue revisado por el usuario.
- [ ] Cada `.<herramienta>/AGENT_CONTEXT.md` declara un `agente_app` distinto, su `idioma_respuesta` y los subagentes que la herramienta realmente puede ejecutar.
- [ ] Los `AGENT_CONFIG.md` declaran `skills` **solo si existen en el proyecto** (no inventados, no del framework).
- [ ] Los 6 subagentes del catálogo están replicados (desde las plantillas) en al menos una herramienta y responden a una prueba.
- [ ] `docs/07_Implementacion/ACTIVIDAD.md` existe y un agente que solo lo lee sabe qué hay en curso y qué le toca.
- [ ] `make dev` (o equivalente) levanta el proyecto desde cero.
- [ ] CI pasa en verde en un PR de prueba.
