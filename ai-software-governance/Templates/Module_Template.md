---
template: true
area: architecture
---

# Plantilla: Nuevo Módulo

> Cómo usar: copia esta plantilla al crear un módulo. Crea la estructura de carpetas y el `MODULE.yaml`. Sigue la checklist [`../Checklists/New_Module.md`](../Checklists/New_Module.md).

## Estructura de carpetas a crear

```
src/<module-name>/
├── domain/
├── application/
├── infrastructure/
│   └── seeds/
│       ├── dev_<module>.<ext>
│       └── test_<module>.<ext>
├── presentation/
├── __tests__/
└── MODULE.yaml
```

## Plantilla de `MODULE.yaml`

```yaml
# Manifiesto del módulo
name: modulo-pagos                # kebab-case, único
display_name: Módulo de Pagos
description: Procesa pagos y gestiona suscripciones.
responsible_team: equipo-backend
bounded_context: pagos

# Dependencias hacia otros módulos (solo su API pública)
dependencies:
  - modulo-usuarios
  - modulo-notificaciones

# Servicios externos usados (se acceden desde infrastructure)
external_services:
  - stripe

# API pública del módulo (lo que otros pueden usar)
public_api:
  commands:
    - CreatePaymentCommand
    - RefundPaymentCommand
  queries:
    - GetPaymentStatusQuery
  events:
    - PaymentCompletedEvent

# Protección (ver .aicodeprotect.yml)
protection:
  inherited: true                 # o sobrescribir nivel aquí
```

## Pasos
1. Crear carpetas y `MODULE.yaml`.
2. Definir la API pública.
3. Implementar dominio → aplicación → infraestructura → presentación.
4. Crear seeds `dev_` y `test_` ([`../03_Database/Seeds_Strategy.md`](../03_Database/Seeds_Strategy.md)).
5. Tests unitarios + integración ([`../06_Testing/Testing_Strategy.md`](../06_Testing/Testing_Strategy.md)).
6. Crear la nota del módulo en `docs/04_Modulos/` con [`Obsidian_Note_Template.md`](Obsidian_Note_Template.md).
7. Enlazar en `docs/00_MAPA_DE_CONTENIDOS.md`.
8. Registrar en `.aicodeprotect.yml` si procede.
9. Completar [`../Checklists/New_Module.md`](../Checklists/New_Module.md).

## Relacionado
- [`../01_Architecture/Module_Organization.md`](../01_Architecture/Module_Organization.md)
- [`Entity_Template.md`](Entity_Template.md)
