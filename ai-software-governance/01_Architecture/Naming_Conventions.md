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
Ver [`../03_Database/Naming.md`](../03_Database/Naming.md). Resumen: tablas en `snake_case` plural (`payment_methods`), columnas en `snake_case` singular (`created_at`).

## Nomenclatura de seeds
Ver [`../03_Database/Seeds_Strategy.md`](../03_Database/Seeds_Strategy.md). Prefijos `dev_` y `test_` (`dev_users.sql`, `test_payments.py`).

## Nomenclatura de ramas Git y commits
- Ramas: `tipo/descripcion-corta` → `feat/payment-refunds`, `fix/login-timeout`.
- Commits: [Conventional Commits](https://www.conventionalcommits.org/) → `feat(payments): add refund use case`.
- Tipos válidos: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`, `ci`.

> Esto define la **nomenclatura**. El **flujo de trabajo** completo con Git/GitHub (branching,
> PRs, política de merge, protección de ramas, releases) es la política canónica en
> [`../08_DevOps/Git_GitHub_Standards.md`](../08_DevOps/Git_GitHub_Standards.md).

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
