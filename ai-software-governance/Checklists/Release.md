---
obligation: mandatory
area: process
applies_to: all projects
---

# Checklist: Release

Antes de etiquetar una versión:

## Calidad
- [ ] Todos los tests (unitarios, integración, E2E) pasan en CI.
- [ ] Cobertura por encima de los umbrales.
- [ ] Lint, type check y auditoría de dependencias en verde.
- [ ] Sin secretos detectados (secret scanning).

## Datos
- [ ] Los seeds de producción están revisados y **no contienen datos de prueba**.
- [ ] Migraciones probadas (aplican limpio y son compatibles / expand-contract). Ver [`../03_Database/Migrations.md`](../03_Database/Migrations.md).
- [ ] Probado el despliegue en staging con `seed:development`.

## Documentación
- [ ] Bóveda Obsidian actualizada y sin enlaces rotos (responsabilidad del Experto Obsidian, `/obsidian`).
- [ ] Manual de usuario actualizado y reflejando la versión (mantenido por `/obsidian`). Ver [`../07_Documentation/User_Manual_Standard.md`](../07_Documentation/User_Manual_Standard.md).
- [ ] Changelog de la release escrito.
- [ ] ADRs relevantes registrados.

## Despliegue
- [ ] Estrategia de despliegue elegida (rolling/canary/blue-green). Ver [`../08_DevOps/Deployment.md`](../08_DevOps/Deployment.md).
- [ ] Plan de rollback listo y probado.
- [ ] Observabilidad (logs, métricas, alertas, health checks) en su sitio.
- [ ] Autorización explícita para promoción a producción.

## Versionado y publicación
- [ ] Crear el **tag SemVer** `vMAJOR.MINOR.PATCH` sobre el commit a publicar.
- [ ] Publicar una **GitHub Release** con notas (derivadas del `CHANGELOG.md` del proyecto).
- [ ] Verificar que el tag/Release apunta al commit correcto de `main`. Ver [`../08_DevOps/Git_GitHub_Standards.md`](../08_DevOps/Git_GitHub_Standards.md).

## Post-release
- [ ] Health checks en verde tras desplegar.
- [ ] Métricas estables durante la ventana de observación.
- [ ] Smoke test de flujos críticos.
