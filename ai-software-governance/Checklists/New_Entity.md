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
- [ ] Naming correcto ([`../01_Architecture/Naming_Conventions.md`](../01_Architecture/Naming_Conventions.md)).

## Persistencia
- [ ] Tabla siguiendo [`../03_Database/Naming.md`](../03_Database/Naming.md) con columnas de auditoría.
- [ ] Migración con `up`/`down`.
- [ ] Integridad referencial (FKs, constraints) y `CHECK` de invariantes simples.

## Seeds (OBLIGATORIO)
- [ ] Seed de **desarrollo** (`dev_`) con datos realistas e idempotente.
- [ ] Fixtures de **test** (`test_`) deterministas y aislados.
- [ ] Verificado que el seed de **producción** NO contiene datos de esta entidad de ejemplo.

## Validación
- [ ] Validación de forma en el borde ([`../04_Backend/Validation.md`](../04_Backend/Validation.md)).
- [ ] Validación de negocio en el dominio.

## Tests
- [ ] Unitarios de invariantes y comportamiento.
- [ ] Integración de la persistencia.
- [ ] Cobertura por encima del umbral.

## Documentación (vía Experto Obsidian)
- [ ] **Entregado al Experto Obsidian** (`/obsidian update …`) para documentar la entidad en `docs/01_Dominio/Entidades.md` o en la nota del módulo.
- [ ] Revisado el reporte del experto; el agente no escribió directamente en `docs/`.
