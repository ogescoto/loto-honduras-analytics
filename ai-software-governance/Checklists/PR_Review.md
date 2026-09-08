---
obligation: standard
area: process
applies_to: all projects
---

# Checklist: Revisión de Pull Request

Para quien revisa un PR (humano o agente revisor). Complementa [`../Templates/Pull_Request_Template.md`](../Templates/Pull_Request_Template.md).

## Alcance y contexto
- [ ] El PR resuelve la tarea/issue declarada, sin scope creep.
- [ ] El título y la descripción son claros; enlaza la tarea.

## Módulos protegidos
- [ ] Si toca paths protegidos, existe la aprobación (`APPROVED`) enlazada. Ver [`../gobernanza/Protected_Modules.md`](../gobernanza/Protected_Modules.md).

## Corrección
- [ ] La lógica es correcta; casos límite y errores contemplados.
- [ ] Manejo de errores conforme a [`../practicas/Error_Handling.md`](../practicas/Error_Handling.md).
- [ ] Validación de entrada presente donde corresponde.
- [ ] Sin condiciones de carrera/efectos colaterales evidentes.

## Arquitectura y estilo
- [ ] Respeta capas y dependencias ([`../practicas/Dependency_Rules.md`](../practicas/Dependency_Rules.md)).
- [ ] Naming conforme a [`../practicas/Naming_Conventions.md`](../practicas/Naming_Conventions.md).
- [ ] Sin duplicación innecesaria; reutiliza utilidades/componentes existentes.

## Seguridad
- [ ] Sin secretos en el código.
- [ ] Autenticación/autorización correctas en endpoints nuevos.
- [ ] Consultas parametrizadas; sin inyección. Ver [`../practicas/Security.md`](../practicas/Security.md).
- [ ] Sin PII/secretos en logs.

## Tests y datos
- [ ] Tests adecuados (unidad/integración/E2E) y en verde.
- [ ] Cobertura del diff por encima del umbral.
- [ ] Seeds `dev_`/`test_` actualizados si cambió el modelo.

## Documentación
- [ ] Bóveda actualizada (módulo/API/flujos) si procede.
- [ ] `@manual-step` en E2E de flujos de usuario nuevos.
- [ ] ADR si hubo decisión relevante.

## Veredicto
- [ ] Aprobar / Solicitar cambios / Rechazar — con comentarios accionables.
