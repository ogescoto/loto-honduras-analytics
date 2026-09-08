---
obligation: mandatory
area: process
applies_to: all projects
---

# Checklist: Nueva Entidad

Al crear una entidad de dominio, verifica:

## Dominio
- [ ] Entidad en `domain/` con fábrica que valida invariantes ([`../Templates/Entity_Template.md`](../Templates/Entity_Template.md)).
- [ ] Comportamiento del dominio en la propia entidad (no anémica).
- [ ] Value Objects para conceptos con reglas propias (dinero, email…).
- [ ] Naming correcto ([`../practicas/Naming_Conventions.md`](../practicas/Naming_Conventions.md)).

## Persistencia
- [ ] Tabla siguiendo [`../practicas/Naming_Conventions.md`](../practicas/Naming_Conventions.md) con columnas de auditoría.
- [ ] Migración con `up`/`down`.
- [ ] Integridad referencial (FKs, constraints) y `CHECK` de invariantes simples.

## Seeds (OBLIGATORIO)
- [ ] Seed de **desarrollo** (`dev_`) con datos realistas e idempotente.
- [ ] Fixtures de **test** (`test_`) deterministas y aislados.
- [ ] Verificado que el seed de **producción** NO contiene datos de esta entidad de ejemplo.

## Validación
- [ ] Validación de forma en el borde ([`../practicas/Validation.md`](../practicas/Validation.md)).
- [ ] Validación de negocio en el dominio.

## Tests
- [ ] Unitarios de invariantes y comportamiento.
- [ ] Integración de la persistencia.
- [ ] Cobertura por encima del umbral.

## Documentación (vía `doc-mapper`)
- [ ] **Entregado a `doc-mapper`** para documentar la entidad en `docs/01_Dominio/Entidades.md` o en la nota del módulo ([`../gobernanza/Subagents.md`](../gobernanza/Subagents.md)).
- [ ] Revisado el reporte de `doc-mapper`; el agente no escribió directamente en `docs/` fuera de `07_Implementacion/`.
