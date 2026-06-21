---
obligation: guideline
area: database
applies_to: all projects
---

# Modelado de Datos

## Propósito
Orientar el diseño del modelo relacional (o documental) para que sea consistente, normalizado lo justo y alineado con el dominio.

## Principios
- **El modelo refleja el dominio**, no al revés. Empieza por las entidades del bounded context (ver [`../01_Architecture/Module_Organization.md`](../01_Architecture/Module_Organization.md)).
- **Normaliza por defecto** (3FN), desnormaliza con justificación (rendimiento medido).
- **Claves primarias artificiales** (`UUID` o `BIGINT` autoincremental) salvo razón fuerte para claves naturales.
- **Integridad referencial en la BD** (FKs reales), no solo en la aplicación.

## Decisiones comunes y guía

| Decisión | Recomendación por defecto |
|---|---|
| Tipo de PK | `UUID` (distribuible) o `BIGSERIAL` (simple, ordenable) |
| Borrado | Soft delete (`deleted_at`) para entidades de negocio; hard delete para datos efímeros |
| Dinero | Tipo entero en la unidad mínima (céntimos) o `DECIMAL`, nunca `FLOAT` |
| Fechas | `TIMESTAMPTZ` en UTC; convertir a zona horaria en presentación |
| Enums | Tabla de catálogo o `CHECK`/tipo enum según el motor |
| JSON | Solo para datos sin consultas estructuradas; no abusar |
| Multi-tenant | Columna `tenant_id` indexada + políticas de aislamiento |

## Relaciones

```
users (1) ───< (N) payment_methods
users (1) ───< (N) payments >─── (1) payment_methods
```

- 1:N → FK en el lado "muchos".
- N:M → tabla de unión (`role_user`).
- 1:1 → FK única o misma tabla, según cohesión.

## Ejemplo de modelo (módulo Pagos)

```sql
users (id, email, ...)
payment_methods (id, user_id FK, provider_token, is_default, ...)
payments (id, user_id FK, payment_method_id FK, amount, currency, status, ...)
refunds (id, payment_id FK, amount, reason, created_at)
```

## Integridad y consistencia
- Define `NOT NULL` siempre que el dato sea obligatorio.
- Usa `CHECK` para invariantes simples (`amount > 0`).
- Usa índices únicos para reglas de unicidad de negocio (`uq_users_email`).
- Documenta las invariantes complejas en la nota del módulo (la BD no siempre puede expresarlas).

## Rendimiento (sin prematura)
- Indexa las FKs y las columnas usadas en `WHERE`/`JOIN`/`ORDER BY` reales.
- No añadas índices "por si acaso": cada índice tiene coste de escritura.
- Mide antes de desnormalizar.

## Anti-patrones
- ❌ `FLOAT` para dinero.
- ❌ Fechas sin zona horaria o en hora local.
- ❌ Listas separadas por comas en una columna (usa tablas).
- ❌ Falta de integridad referencial "porque la app ya valida".
- ❌ EAV (entity-attribute-value) salvo necesidad real y documentada.

## Relacionado
- [`Naming.md`](Naming.md), [`Migrations.md`](Migrations.md), [`Seeds_Strategy.md`](Seeds_Strategy.md)
