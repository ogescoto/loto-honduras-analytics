---
obligation: mandatory
area: process
applies_to: all projects
---

# Checklist: Nuevo Proyecto

Al incorporar el framework de gobernanza a un proyecto nuevo o existente, verifica:

## 1. Incorporar el framework
- [ ] Decidir el modo de incorporación (submódulo Git / copia / paquete). Ver [`../README.md`](../README.md).
- [ ] Colocar el framework accesible en el repo (p. ej. `.governance/`).

## 2. Archivos de control en la raíz del proyecto
- [ ] Crear `CLAUDE.md` en la raíz del proyecto a partir de [`../Templates/CLAUDE_Template.md`](../Templates/CLAUDE_Template.md). Es el punto de entrada del agente; debe redirigir al framework.
- [ ] Crear `.aicodeprotect.yml` a partir de [`../Examples/.aicodeprotect.yml`](../Examples/.aicodeprotect.yml).
- [ ] Crear `.env.example` con todas las variables (sin secretos reales). Ver [`../08_DevOps/Environments.md`](../08_DevOps/Environments.md).
- [ ] Configurar `.gitignore` para excluir `.env` y secretos. Ver [`../08_DevOps/Secrets_Management.md`](../08_DevOps/Secrets_Management.md).
- [ ] Copiar las plantillas de [`../Templates/github/`](../Templates/github/) a `.github/` (CI, `CODEOWNERS`, `dependabot.yml`, issue templates) y `.github/pull_request_template.md` desde [`../Templates/Pull_Request_Template.md`](../Templates/Pull_Request_Template.md). Ver [`../08_DevOps/Git_GitHub_Standards.md`](../08_DevOps/Git_GitHub_Standards.md).
- [ ] Declarar en `CODEOWNERS` los **módulos protegidos** de `.aicodeprotect.yml`.

## 3. Bóveda de documentación + Experto Obsidian
- [ ] Crear la estructura `docs/` según [`../07_Documentation/Obsidian_Vault_Standard.md`](../07_Documentation/Obsidian_Vault_Standard.md), incluyendo la carpeta `docs/.obsidian/` (vault).
- [ ] Crear `docs/00_MAPA_DE_CONTENIDOS.md`.
- [ ] **Instalar el skill `/obsidian`** en `.claude/skills/obsidian/` copiándolo desde [`../Templates/Obsidian_Skill_Template/`](../Templates/Obsidian_Skill_Template/) (ver su `README.md` para instalación y **sincronización** "siempre al día").
- [ ] Documentar el stack vía el experto (`/obsidian update`) en `docs/03_Tecnico/`.

## 4. Entornos y comandos
- [ ] Definir comandos canónicos (`install`, `dev`, `migrate`, `seed-*`, `test`, `lint`, `build`). Ver [`../08_DevOps/Environments.md`](../08_DevOps/Environments.md).
- [ ] Documentar "desde cero a funcionando" en el README del proyecto.
- [ ] Fijar versiones de runtime (`.nvmrc`/`.tool-versions`/etc.).

## 5. Calidad y CI
- [ ] Configurar linter, formatter y type check.
- [ ] Configurar framework de tests (unidad/integración/E2E).
- [ ] Configurar pipeline de CI con los gates. Ver [`../08_DevOps/CI_CD.md`](../08_DevOps/CI_CD.md).
- [ ] Activar secret scanning y auditoría de dependencias.
- [ ] Configurar umbrales de cobertura. Ver [`../06_Testing/Coverage_Requirements.md`](../06_Testing/Coverage_Requirements.md).
- [ ] **Proteger la rama `main`** (PR obligatorio, CI requerido, review, historia lineal, sin force-push) con la receta [`../Templates/github/branch-protection.md`](../Templates/github/branch-protection.md). Ver [`../08_DevOps/Git_GitHub_Standards.md`](../08_DevOps/Git_GitHub_Standards.md).

## 6. Seeds
- [ ] Estructura de seeds para `production`, `development`, `test`. Ver [`../03_Database/Seeds_Strategy.md`](../03_Database/Seeds_Strategy.md).

## 7. Verificación final
- [ ] Un agente puede leer [`../AI_START_HERE.md`](../AI_START_HERE.md) y orientarse.
- [ ] `/obsidian` está disponible y responde una consulta de prueba sobre la bóveda.
- [ ] `make dev` (o equivalente) levanta el proyecto desde cero.
- [ ] CI pasa en verde en un PR de prueba.
