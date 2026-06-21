---
template: true
area: architecture
---

# Plantilla: Nueva Entidad

> Cómo usar: al crear una entidad de dominio, sigue esta estructura y completa la checklist [`../Checklists/New_Entity.md`](../Checklists/New_Entity.md). Recuerda: **toda entidad nueva exige seeds de dev y test**.

## 1. Entidad de dominio (ejemplo TypeScript)

```ts
// src/<module>/domain/<entity>.entity.ts
export class Payment {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly amount: number,     // céntimos, > 0
    public readonly currency: 'EUR' | 'USD',
    public status: PaymentStatus,
    public readonly createdAt: Date,
  ) {}

  // Fábrica: valida invariantes (ver 04_Backend/Validation.md)
  static create(props: CreatePaymentProps): Payment {
    if (props.amount <= 0) throw new PaymentAmountInvalidError();
    return new Payment(
      generateId(), props.userId, props.amount, props.currency, 'pending', new Date(),
    );
  }

  // Comportamiento del dominio
  refund(): void {
    if (this.status !== 'completed') throw new PaymentNotRefundableError();
    this.status = 'refunded';
  }
}
```

## 2. Persistencia
- Tabla siguiendo [`../03_Database/Naming.md`](../03_Database/Naming.md) y columnas de auditoría (`created_at`, `updated_at`, `deleted_at`).
- Migración con `up`/`down` ([`../03_Database/Migrations.md`](../03_Database/Migrations.md)).

```sql
CREATE TABLE payments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL,
    amount      INTEGER NOT NULL CHECK (amount > 0),
    currency    TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'pending',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at  TIMESTAMPTZ NULL,
    CONSTRAINT fk_payments_user_id FOREIGN KEY (user_id) REFERENCES users (id)
);
```

## 3. Seeds (obligatorios)

```ts
// dev_payments — datos realistas (Faker), idempotente
// test_payments — datos deterministas y aislados
```
Ver [`Seed_Template.sql`](Seed_Template.sql) y [`../03_Database/Seeds_Strategy.md`](../03_Database/Seeds_Strategy.md).

## 4. Tests (obligatorios)
- Unitarios de las invariantes y el comportamiento (`create`, `refund`).
- Integración de la persistencia.

## 5. Documentación
- Añadir la entidad en `docs/01_Dominio/Entidades.md` o en la nota del módulo.

## Checklist
[`../Checklists/New_Entity.md`](../Checklists/New_Entity.md)
