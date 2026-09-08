---
obligation: standard
area: architecture
applies_to: all projects
---

# Convenciones de Nombres

## Propósito
Que nombrar deje de ser una decisión y pase a ser una regla. Nombres consistentes reducen la carga cognitiva y permiten que los agentes generen código predecible.

## Principios
- **Claridad sobre brevedad.** `userRepository` mejor que `usrRepo`.
- **El nombre revela la intención.** Un nombre no debe requerir un comentario para entenderse.
- **Sin abreviaturas inventadas.** Solo abreviaturas universales (`id`, `url`, `http`).
- **Idioma:** el código (identificadores) en **inglés**; la documentación de negocio en **español**. El lenguaje ubicuo del dominio puede usar términos del negocio aunque estén en español, pero de forma consistente.

## Tabla de convenciones por elemento

| Elemento | Convención | Ejemplo |
|---|---|---|
| Carpeta de módulo | `kebab-case` | `payment-methods/` |
| Clase / Tipo / Entidad | `PascalCase` | `PaymentMethod`, `CreatePaymentCommand` |
| Interfaz / Puerto | `PascalCase` (sin prefijo `I`) | `PaymentRepository` |
| Función / método | `camelCase`, empieza con verbo | `createPayment`, `getStatus` |
| Variable | `camelCase`, sustantivo | `paymentStatus` |
| Constante | `UPPER_SNAKE_CASE` | `MAX_RETRIES` |
| Booleano | prefijo `is`/`has`/`can`/`should` | `isActive`, `hasAccess` |
| Archivo de clase | igual que la clase, `.kebab` o `.Pascal` según stack | `payment.entity.ts` |
| Caso de uso | `Verbo + Sustantivo + UseCase` | `CreatePaymentUseCase` |
| Comando | `Verbo + Sustantivo + Command` | `RefundPaymentCommand` |
| Consulta | `Get/List + Sustantivo + Query` | `GetPaymentStatusQuery` |
| Evento (pasado) | `Sustantivo + VerboPasado + Event` | `PaymentCompletedEvent` |
| DTO | `Sustantivo + Dto` | `CreatePaymentDto` |
| Test | refleja el sujeto + escenario | `createPayment.spec.ts` |

> Adapta los sufijos de archivo al stack (`.ts`, `.py`, `.cs`…), pero **mantén el patrón de nombre lógico**.

## Nomenclatura de base de datos

Que el esquema sea legible y predecible. Un agente debe poder inferir el nombre de una tabla o columna sin consultarlo.

### Reglas generales
- Todo en **inglés** salvo términos de dominio sin traducción aceptada.
- `snake_case` siempre (no `camelCase`, no `PascalCase`).
- Sin abreviaturas inventadas; `id`, `url`, `ip` permitidas.
- Sin prefijos de tipo húngaro ni prefijos `tbl_`/`col_`.

### Convenciones por elemento

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

### Columnas de auditoría estándar
Toda tabla de negocio debería incluir, salvo justificación:

```sql
created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
deleted_at  TIMESTAMPTZ NULL          -- soft delete cuando aplique
```

### Ejemplo de tabla bien nombrada

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

### Anti-patrones de base de datos
- ❌ Tablas en singular (`user` en vez de `users`).
- ❌ FKs con nombre arbitrario (`owner` en vez de `user_id`).
- ❌ Mezclar idiomas (`fecha_created`).
- ❌ Columnas booleanas ambiguas (`active` sin prefijo `is_`).

## Nomenclatura de seeds
Ver [`Seeds_Strategy.md`](Seeds_Strategy.md). Prefijos `dev_` y `test_` (`dev_users.sql`, `test_payments.py`).

## Nomenclatura de ramas Git y commits
- Ramas: `tipo/descripcion-corta` → `feat/payment-refunds`, `fix/login-timeout`.
- Commits: [Conventional Commits](https://www.conventionalcommits.org/) → `feat(payments): add refund use case`.
- Tipos válidos: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`, `ci`.

> Esto define la **nomenclatura**. El **flujo de trabajo** completo con Git/GitHub (branching,
> PRs, política de merge, protección de ramas, releases) es la política canónica en
> [`Git_GitHub_Standards.md`](Git_GitHub_Standards.md).

## Nombres prohibidos
- ❌ `data`, `info`, `manager`, `helper`, `utils` como nombre de clase principal (demasiado vagos).
- ❌ Números mágicos sin constante nombrada.
- ❌ Nombres que mienten (`getUser` que además crea uno).
- ❌ Prefijos húngaros (`strName`, `iCount`).

## Ejemplos buenos vs. malos

```
✅ class RefundPaymentUseCase
❌ class PaymentManager2

✅ const MAX_LOGIN_ATTEMPTS = 5
❌ if (attempts > 5)   // número mágico

✅ function isEligibleForRefund(payment): boolean
❌ function check(p): boolean
```
