---
template: true
area: process
---

# Plantilla: Pull Request

> Copia a `.github/pull_request_template.md` en el proyecto. Se valida contra [`../Checklists/PR_Review.md`](../Checklists/PR_Review.md).

## Descripción
Qué hace este PR y por qué. Enlaza la tarea/issue.

Closes #___

## Tipo de cambio
- [ ] feat (nueva funcionalidad)
- [ ] fix (corrección)
- [ ] refactor
- [ ] docs
- [ ] test
- [ ] chore / ci

## ¿Toca módulos protegidos?
- [ ] No
- [ ] Sí → enlace a la aprobación (`APPROVED`): ___
  (ver [`../09_AI/Protected_Modules.md`](../09_AI/Protected_Modules.md))

## Checklist del autor (Definition of Done)
- [ ] El código sigue los estándares de la(s) capa(s) afectada(s).
- [ ] Naming y dependencias correctos ([`../01_Architecture/`](../01_Architecture/)).
- [ ] Tests unitarios/integración añadidos y en verde.
- [ ] Cobertura por encima del umbral.
- [ ] Seeds `dev_`/`test_` actualizados (si hubo entidad/caso de uso).
- [ ] Documentación de la bóveda actualizada (módulo, API, flujos, ADR).
- [ ] E2E con `@manual-step` para flujos de usuario nuevos.
- [ ] Sin secretos en el código.
- [ ] Lint y type check en verde.

## Capturas / evidencia (si aplica)
(imágenes, salida de tests, etc.)

## Notas para el revisor
Puntos de atención, decisiones tomadas, deuda asumida.
