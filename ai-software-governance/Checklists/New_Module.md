---
obligation: mandatory
area: process
applies_to: all projects
---

# Checklist: Nuevo Módulo

Al crear un módulo nuevo, verifica:

## Estructura
- [ ] Estructura de carpetas según [`../practicas/Module_Organization.md`](../practicas/Module_Organization.md) (domain/application/infrastructure/presentation).
- [ ] Existe `MODULE.yaml` en la raíz del módulo ([`../Templates/Module_Template.md`](../Templates/Module_Template.md)).
- [ ] API pública definida y documentada.
- [ ] Dependencias declaradas y sin ciclos ([`../practicas/Dependency_Rules.md`](../practicas/Dependency_Rules.md)).
- [ ] Naming correcto ([`../practicas/Naming_Conventions.md`](../practicas/Naming_Conventions.md)).

## Datos
- [ ] Migraciones creadas con `up`/`down` ([`../practicas/Migrations.md`](../practicas/Migrations.md)).
- [ ] Seeds de desarrollo (`dev_`) y test (`test_`) implementados ([`../practicas/Seeds_Strategy.md`](../practicas/Seeds_Strategy.md)).

## Calidad
- [ ] Tests unitarios y de integración mínimos.
- [ ] Cobertura por encima del umbral.
- [ ] El código pasa linter, type check y tests.

## Documentación (vía `doc-mapper`)
- [ ] **Entregado a `doc-mapper`** para que cree la nota del módulo en `docs/04_Modulos/` ([`../Templates/Obsidian_Note_Template.md`](../Templates/Obsidian_Note_Template.md)) y la enlace en `docs/00_MAPA_DE_CONTENIDOS.md` ([`../gobernanza/Subagents.md`](../gobernanza/Subagents.md)).
- [ ] ADR creado (por `doc-mapper`) si hubo decisión arquitectónica relevante.
- [ ] Revisado el reporte de `doc-mapper`: la documentación quedó completa.
- [ ] (Recordatorio) Ningún archivo de `docs/` fuera de `07_Implementacion/` fue escrito directamente por el agente desarrollador.

## Gobernanza
- [ ] Registrado en `.aicodeprotect.yml` si debe protegerse.
