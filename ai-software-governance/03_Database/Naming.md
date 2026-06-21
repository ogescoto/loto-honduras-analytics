---
obligation: standard
area: database
applies_to: all projects
---

# Nomenclatura de Base de Datos

## Propósito
Que el esquema sea legible y predecible. Un agente debe poder inferir el nombre de una tabla o columna sin consultarlo.

## Reglas generales
- Todo en **inglés** salvo términos de dominio sin traducción aceptada.
- `snake_case` siempre (no `camelCase`, no `PascalCase`).
- Sin abreviaturas inventadas; `id`, `url`, `ip` permitidas.
- Sin prefijos de tipo húngaro ni prefijos `tbl_`/`col_`.

## Convenciones por elemento

| Elemento | Convención | Ejemplo |
|---|---|---|
| Tabla | `snake_case`, **plural** | `payment_methods`, `users` |
| Tabla de unión (N:M) | nombres ordenados alfabéticamente | `role_user` |
| Columna | `snake_case`, singular | `created_at`, `total_amount` |
| Clave primaria | `id` | `id` |
| Clave foránea | `<tabla_singular>_id` | `user_id`, `payment_method_id` |
| Booleano | prefijo `is_`/`has_` | `is_active`, `has_verified_email` |
| Timestamp | sufijo `_at` | `created_at`, `deleted_at` |
| Fecha | sufijo `_on` o `_date` | `due_date` |
| Índice | `idx_<tabla>_<columnas>` | `idx_payments_user_id` |
| Único | `uq_<tabla>_<columnas>` | `uq_users_email` |
| Constraint FK | `fk_<tabla>_<columna>` | `fk_payments_user_id` |
| Enum/check | `chk_<tabla>_<columna>` | `chk_payments_status` |

## Columnas de auditoría estándar
Toda tabla de negocio debería incluir, salvo justificación:

```sql
created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
deleted_at  TIMESTAMPTZ NULL          -- soft delete cuando aplique
```

## Ejemplo de tabla bien nombrada

```sql
CREATE TABLE payment_methods (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL,
    provider_token  TEXT NOT NULL,
    is_default      BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at      TIMESTAMPTZ NULL,
    CONSTRAINT fk_payment_methods_user_id
        FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE INDEX idx_payment_methods_user_id ON payment_methods (user_id);
CREATE UNIQUE INDEX uq_payment_methods_default
    ON payment_methods (user_id) WHERE is_default;
```

## Anti-patrones
- ❌ Tablas en singular (`user` en vez de `users`).
- ❌ FKs con nombre arbitrario (`owner` en vez de `user_id`).
- ❌ Mezclar idiomas (`fecha_created`).
- ❌ Columnas booleanas ambiguas (`active` sin prefijo `is_`).

## Relacionado
- [`Migrations.md`](Migrations.md), [`Data_Modeling.md`](Data_Modeling.md)
- [`../01_Architecture/Naming_Conventions.md`](../01_Architecture/Naming_Conventions.md)
