---
obligation: mandatory
area: process
applies_to: all projects
---

# Checklist: Nuevo Módulo

Al crear un módulo nuevo, verifica:

## Estructura
- [ ] Estructura de carpetas según [`../01_Architecture/Module_Organization.md`](../01_Architecture/Module_Organization.md) (domain/application/infrastructure/presentation).
- [ ] Existe `MODULE.yaml` en la raíz del módulo ([`../Templates/Module_Template.md`](../Templates/Module_Template.md)).
- [ ] API pública definida y documentada.
- [ ] Dependencias declaradas y sin ciclos ([`../01_Architecture/Dependency_Rules.md`](../01_Architecture/Dependency_Rules.md)).
- [ ] Naming correcto ([`../01_Architecture/Naming_Conventions.md`](../01_Architecture/Naming_Conventions.md)).

## Datos
- [ ] Migraciones creadas con `up`/`down` ([`../03_Database/Migrations.md`](../03_Database/Migrations.md)).
- [ ] Seeds de desarrollo (`dev_`) y test (`test_`) implementados ([`../03_Database/Seeds_Strategy.md`](../03_Database/Seeds_Strategy.md)).

## Calidad
- [ ] Tests unitarios y de integración mínimos.
- [ ] Cobertura por encima del umbral.
- [ ] El código pasa linter, type check y tests.

## Documentación (vía Experto Obsidian)
- [ ] **Entregado al Experto Obsidian** (`/obsidian update …`) para que cree la nota del módulo en `docs/04_Modulos/` ([`../Templates/Obsidian_Note_Template.md`](../Templates/Obsidian_Note_Template.md)) y la enlace en `docs/00_MAPA_DE_CONTENIDOS.md`.
- [ ] ADR creado (por el experto) si hubo decisión arquitectónica relevante.
- [ ] Revisado el reporte del experto: la documentación quedó completa.
- [ ] (Recordatorio) Ningún archivo de `docs/` fue escrito directamente por el agente desarrollador.

## Gobernanza
- [ ] Registrado en `.aicodeprotect.yml` si debe protegerse.
